"""PaymentService unit tests — success, failure, cancel, duplicate, signature, expiry."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.common.enums import ExperienceStatus, PaymentStatus
from app.common.exceptions import ConflictException, PaymentException
from app.payments.base import GatewayOrder
from app.services.payment_service import ORDER_TTL, PaymentService


class FakeGateway:
    provider_name = "fake"
    public_key = "rzp_test_fake"

    def __init__(self, *, verify_ok: bool = True, order_status: str = "created") -> None:
        self.verify_ok = verify_ok
        self.order_status = order_status
        self.created: list[GatewayOrder] = []

    def create_order(self, *, amount_minor, currency, receipt, notes=None):
        order = GatewayOrder(
            order_id=f"order_{len(self.created) + 1}",
            amount=amount_minor,
            currency=currency,
            status="created",
            raw={"id": f"order_{len(self.created) + 1}", "amount": amount_minor},
        )
        self.created.append(order)
        return order

    def verify_signature(self, *, order_id, payment_id, signature):
        return self.verify_ok

    def fetch_order(self, order_id: str):
        return GatewayOrder(
            order_id=order_id,
            amount=19900,
            currency="INR",
            status=self.order_status,
            raw={"id": order_id, "status": self.order_status},
        )


class FakeDB:
    def __init__(self) -> None:
        self.added: list[object] = []
        self.committed = False
        self._payments_by_id: dict[str, object] = {}

    def add(self, obj: object) -> None:
        self.added.append(obj)

    def commit(self) -> None:
        self.committed = True

    def flush(self) -> None:
        return None

    def refresh(self, obj: object) -> None:
        return None

    def scalars(self, _statement):
        class _Result:
            def __init__(self, outer: FakeDB) -> None:
                self.outer = outer

            def first(self):
                return None

        return _Result(self)


def _experience(*, status=ExperienceStatus.READY_FOR_PAYMENT, payment=None, email="a@example.com"):
    return SimpleNamespace(
        id=1,
        uuid=uuid4(),
        status=status,
        deleted_at=None,
        customer_email=email,
        payment=payment,
    )


def _payment(*, order_id="order_1", status=PaymentStatus.CREATED, payment_id=None):
    now = datetime.now(timezone.utc)
    return SimpleNamespace(
        id=10,
        order_id=order_id,
        payment_id=payment_id,
        signature=None,
        amount=Decimal("199.00"),
        currency="INR",
        status=status,
        payment_method=None,
        failure_reason=None,
        verified_at=None,
        gateway_response={"order_created_at": now.isoformat()},
        created_at=now,
        experience_id=1,
        provider="fake",
    )


@pytest.fixture
def service(monkeypatch):
    gateway = FakeGateway()
    svc = PaymentService(gateway=gateway)

    def fake_get(_db, experience_uuid, include_deleted=False):
        return getattr(svc, "_test_experience", None)

    monkeypatch.setattr(
        "app.services.payment_service.experience_repository.get_by_uuid",
        fake_get,
    )
    return svc, gateway


def test_create_order_success(service):
    svc, gateway = service
    exp = _experience()
    svc._test_experience = exp
    db = FakeDB()

    # PaymentService creates Payment ORM — patch Payment constructor to SimpleNamespace
    created_holder: dict[str, object] = {}

    class FakePayment:
        def __init__(self, **kwargs):
            obj = SimpleNamespace(id=99, **kwargs)
            created_holder["payment"] = obj
            exp.payment = obj
            self.__dict__.update(kwargs)

    import app.services.payment_service as mod

    original = mod.Payment
    mod.Payment = FakePayment  # type: ignore[misc,assignment]
    try:
        result = svc.create_order(db, exp.uuid)
    finally:
        mod.Payment = original

    assert result.order_id.startswith("order_")
    assert result.amount == 19900
    assert result.currency == "INR"
    assert result.razorpay_key == "rzp_test_fake"
    assert exp.status == ExperienceStatus.PAYMENT_PENDING
    assert len(gateway.created) == 1


def test_verify_success(service):
    svc, _gateway = service
    payment = _payment(status=PaymentStatus.CREATED)
    exp = _experience(status=ExperienceStatus.PAYMENT_PENDING, payment=payment)
    svc._test_experience = exp
    db = FakeDB()

    result = svc.verify_payment(
        db,
        order_id="order_1",
        payment_id="pay_1",
        signature="sig_valid",
        experience_uuid=exp.uuid,
    )

    assert result.success is True
    assert payment.status == PaymentStatus.SUCCESS
    assert exp.status == ExperienceStatus.READY_TO_PUBLISH
    assert payment.verified_at is not None
    assert payment.payment_id == "pay_1"
    assert payment.signature == "sig_valid"


def test_verify_invalid_signature(service):
    svc, gateway = service
    gateway.verify_ok = False
    payment = _payment()
    exp = _experience(status=ExperienceStatus.PAYMENT_PENDING, payment=payment)
    svc._test_experience = exp
    db = FakeDB()

    with pytest.raises(PaymentException) as exc:
        svc.verify_payment(
            db,
            order_id="order_1",
            payment_id="pay_bad",
            signature="bad",
            experience_uuid=exp.uuid,
        )

    assert exc.value.code == "invalid_signature"
    assert payment.status == PaymentStatus.FAILED
    assert exp.status == ExperienceStatus.READY_FOR_PAYMENT


def test_duplicate_verification(service):
    svc, _gateway = service
    payment = _payment(status=PaymentStatus.SUCCESS, payment_id="pay_1")
    payment.verified_at = datetime.now(timezone.utc)
    exp = _experience(status=ExperienceStatus.READY_TO_PUBLISH, payment=payment)
    svc._test_experience = exp
    db = FakeDB()

    with pytest.raises(ConflictException) as exc:
        svc.verify_payment(
            db,
            order_id="order_1",
            payment_id="pay_1",
            signature="sig",
            experience_uuid=exp.uuid,
        )
    assert exc.value.code == "duplicate_verification"


def test_cancelled_payment(service):
    svc, _gateway = service
    payment = _payment()
    exp = _experience(status=ExperienceStatus.PAYMENT_PENDING, payment=payment)
    svc._test_experience = exp
    db = FakeDB()

    result = svc.record_failure(
        db,
        experience_uuid=exp.uuid,
        order_id="order_1",
        cancelled=True,
        reason="user closed modal",
    )

    assert result.payment_status == PaymentStatus.CANCELLED
    assert payment.status == PaymentStatus.CANCELLED
    assert exp.status == ExperienceStatus.READY_FOR_PAYMENT


def test_failed_payment(service):
    svc, _gateway = service
    payment = _payment()
    exp = _experience(status=ExperienceStatus.PAYMENT_PENDING, payment=payment)
    svc._test_experience = exp
    db = FakeDB()

    result = svc.record_failure(
        db,
        experience_uuid=exp.uuid,
        order_id="order_1",
        cancelled=False,
        reason="Bank declined",
        gateway_response={"error": "declined"},
    )

    assert result.payment_status == PaymentStatus.FAILED
    assert payment.failure_reason == "Bank declined"
    assert payment.gateway_response["error"] == "declined"


def test_expired_order(service):
    svc, gateway = service
    gateway.order_status = "created"
    payment = _payment()
    # Force local TTL expiry
    old = datetime.now(timezone.utc) - ORDER_TTL - timedelta(minutes=1)
    payment.created_at = old
    payment.gateway_response = {"order_created_at": old.isoformat()}
    exp = _experience(status=ExperienceStatus.PAYMENT_PENDING, payment=payment)
    svc._test_experience = exp
    db = FakeDB()

    with pytest.raises(PaymentException) as exc:
        svc.verify_payment(
            db,
            order_id="order_1",
            payment_id="pay_1",
            signature="sig",
            experience_uuid=exp.uuid,
        )
    assert exc.value.code == "order_expired"
    assert payment.status == PaymentStatus.FAILED


def test_create_order_rejects_already_paid(service):
    svc, _gateway = service
    payment = _payment(status=PaymentStatus.SUCCESS, payment_id="pay_done")
    exp = _experience(status=ExperienceStatus.READY_TO_PUBLISH, payment=payment)
    svc._test_experience = exp
    db = FakeDB()

    with pytest.raises(ConflictException):
        svc.create_order(db, exp.uuid)
