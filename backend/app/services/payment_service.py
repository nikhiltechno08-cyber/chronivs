"""
Payment service — create order, verify signature, store payment, update status.

Business logic lives here (not in routers). Gateway-specific work is delegated
to PaymentGateway so Stripe / PayPal / PhonePe can be plugged in later.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.common.constants import CHECKOUT_BASE_PRICE, CHECKOUT_CURRENCY
from app.common.enums import ExperienceStatus, PaymentStatus
from app.common.exceptions import (
    ConflictException,
    NotFoundException,
    PaymentException,
    UnauthorizedException,
    ValidationException,
)
from app.models.experience import Experience
from app.models.payment import Payment
from app.core.config import settings
from app.payments.base import PaymentGateway
from app.payments.factory import get_payment_gateway
from app.repositories.experience_repository import experience_repository
from app.schemas.payment_api import (
    CreateOrderResponse,
    PaymentFailureResponse,
    VerifyPaymentResponse,
)

logger = logging.getLogger(__name__)

# Reject reuse of stale unpaid orders (Razorpay orders typically expire ~1 day;
# we refresh earlier for a safer UX).
ORDER_TTL = timedelta(minutes=45)

_PAYABLE_STATUSES = {
    ExperienceStatus.READY_FOR_PAYMENT,
    ExperienceStatus.PAYMENT_PENDING,
    ExperienceStatus.CHECKOUT_STARTED,
    ExperienceStatus.FAILED,
}

_TERMINAL_SUCCESS = {PaymentStatus.SUCCESS, PaymentStatus.PAID}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _is_success(status: PaymentStatus) -> bool:
    return status in _TERMINAL_SUCCESS


class PaymentService:
    def __init__(self, gateway: PaymentGateway | None = None) -> None:
        self._gateway = gateway

    @property
    def gateway(self) -> PaymentGateway:
        return self._gateway or get_payment_gateway()

    def create_order(
        self,
        db: Session,
        experience_uuid: UUID,
        *,
        customer_email: str | None = None,
    ) -> CreateOrderResponse:
        experience = self._get_experience(db, experience_uuid)
        self._assert_experience_payable(experience, customer_email=customer_email)

        existing = experience.payment
        if existing is not None and _is_success(existing.status):
            raise ConflictException(
                "This experience is already paid.",
                code="payment_already_success",
                details={"experience_id": str(experience_uuid)},
            )

        amount_rupees = Decimal(CHECKOUT_BASE_PRICE)
        amount_paise = int(amount_rupees * 100)
        currency = CHECKOUT_CURRENCY

        # Reuse a fresh unpaid order when possible (same provider only).
        if (
            existing is not None
            and existing.order_id
            and existing.status in {PaymentStatus.CREATED, PaymentStatus.PENDING}
            and self._order_still_valid(existing)
            and self._order_matches_gateway(existing.order_id)
        ):
            logger.info(
                "Order reused order_id=%s experience_uuid=%s",
                existing.order_id,
                experience_uuid,
            )
            experience.status = ExperienceStatus.PAYMENT_PENDING
            db.add(experience)
            db.commit()
            db.refresh(existing)
            return CreateOrderResponse(
                order_id=existing.order_id,
                amount=int(Decimal(existing.amount) * 100),
                currency=existing.currency,
                razorpay_key=self.gateway.public_key,
                experience_id=experience.uuid,
                payment_status=existing.status,
                provider=self.gateway.provider_name,
                mock_result=(
                    settings.mock_payment_result
                    if self.gateway.provider_name == "mock"
                    else None
                ),
            )

        receipt = f"exp_{str(experience_uuid).replace('-', '')[:32]}"
        gateway_order = self.gateway.create_order(
            amount_minor=amount_paise,
            currency=currency,
            receipt=receipt,
            notes={
                "experience_id": str(experience_uuid),
                "app": "chronivs",
            },
        )

        order_meta = {
            **(gateway_order.raw or {}),
            "order_created_at": _utc_now().isoformat(),
        }

        if existing is None:
            payment = Payment(
                experience_id=experience.id,
                provider=self.gateway.provider_name,
                order_id=gateway_order.order_id,
                payment_id=None,
                amount=amount_rupees,
                currency=currency,
                status=PaymentStatus.CREATED,
                gateway_response=order_meta,
            )
            db.add(payment)
        else:
            existing.provider = self.gateway.provider_name
            existing.order_id = gateway_order.order_id
            existing.payment_id = None
            existing.signature = None
            existing.amount = amount_rupees
            existing.currency = currency
            existing.status = PaymentStatus.CREATED
            existing.payment_method = None
            existing.failure_reason = None
            existing.verified_at = None
            existing.gateway_response = order_meta
            payment = existing

        experience.status = ExperienceStatus.PAYMENT_PENDING
        db.add(experience)
        db.commit()
        db.refresh(payment)

        logger.info(
            "Order created order_id=%s experience_uuid=%s amount=%s timestamp=%s",
            payment.order_id,
            experience_uuid,
            amount_paise,
            _utc_now().isoformat(),
        )

        return CreateOrderResponse(
            order_id=str(payment.order_id),
            amount=amount_paise,
            currency=currency,
            razorpay_key=self.gateway.public_key,
            experience_id=experience.uuid,
            payment_status=payment.status,
            provider=self.gateway.provider_name,
            mock_result=(
                settings.mock_payment_result
                if self.gateway.provider_name == "mock"
                else None
            ),
        )

    def verify_payment(
        self,
        db: Session,
        *,
        order_id: str,
        payment_id: str,
        signature: str,
        experience_uuid: UUID,
        payment_method: str | None = None,
        customer_email: str | None = None,
    ) -> VerifyPaymentResponse:
        experience = self._get_experience(db, experience_uuid)
        self._assert_experience_ownership(experience, customer_email=customer_email)

        payment = experience.payment
        if payment is None:
            raise NotFoundException(
                "No payment order found for this experience.",
                code="payment_not_found",
            )

        # Duplicate verification / replay protection
        if _is_success(payment.status):
            if payment.payment_id and payment.payment_id == payment_id:
                raise ConflictException(
                    "Payment already verified.",
                    code="duplicate_verification",
                    details={
                        "experience_id": str(experience_uuid),
                        "payment_id": payment_id,
                    },
                )
            raise ConflictException(
                "This experience already has a successful payment.",
                code="payment_already_success",
            )

        if payment.order_id != order_id:
            raise ValidationException(
                "Order does not belong to this experience.",
                code="order_mismatch",
                details={"expected_order_id": payment.order_id},
            )

        # Reject replay of a payment_id already stored on another row
        other = db.scalars(
            select(Payment).where(
                Payment.payment_id == payment_id,
                Payment.id != payment.id,
            )
        ).first()
        if other is not None:
            raise ConflictException(
                "Payment id has already been used.",
                code="payment_id_replay",
            )

        if not self._order_still_valid(payment):
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = "Order expired. Create a new order and try again."
            payment.gateway_response = {
                **(payment.gateway_response or {}),
                "expired": True,
                "checked_at": _utc_now().isoformat(),
            }
            db.add(payment)
            db.commit()
            logger.warning(
                "Verification failure expired order order_id=%s experience_uuid=%s",
                order_id,
                experience_uuid,
            )
            raise PaymentException(
                "Payment order has expired. Please try again.",
                code="order_expired",
            )

        payment.status = PaymentStatus.PENDING
        db.add(payment)
        db.flush()

        valid = self.gateway.verify_signature(
            order_id=order_id,
            payment_id=payment_id,
            signature=signature,
        )
        if not valid:
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = "Invalid payment signature"
            payment.gateway_response = {
                **(payment.gateway_response or {}),
                "verification": "failed",
                "order_id": order_id,
                "payment_id": payment_id,
                "checked_at": _utc_now().isoformat(),
            }
            # Keep experience payable for a clean retry (new order).
            experience.status = ExperienceStatus.READY_FOR_PAYMENT
            db.add(payment)
            db.add(experience)
            db.commit()
            logger.warning(
                "Verification failure invalid signature order_id=%s payment_id=%s "
                "experience_uuid=%s timestamp=%s",
                order_id,
                payment_id,
                experience_uuid,
                _utc_now().isoformat(),
            )
            raise PaymentException(
                "Payment signature verification failed.",
                code="invalid_signature",
            )

        now = _utc_now()
        payment.payment_id = payment_id
        payment.signature = signature
        payment.status = PaymentStatus.SUCCESS
        payment.payment_method = payment_method
        payment.verified_at = now
        payment.failure_reason = None
        payment.gateway_response = {
            **(payment.gateway_response or {}),
            "verification": "success",
            "order_id": order_id,
            "payment_id": payment_id,
            "verified_at": now.isoformat(),
            "provider": self.gateway.provider_name,
        }

        # Do NOT publish — only mark ready for Phase 4.6 publishing.
        experience.status = ExperienceStatus.READY_TO_PUBLISH

        db.add(payment)
        db.add(experience)
        db.commit()
        db.refresh(payment)
        db.refresh(experience)

        logger.info(
            "Payment success / verification success order_id=%s payment_id=%s "
            "experience_uuid=%s timestamp=%s",
            order_id,
            payment_id,
            experience_uuid,
            now.isoformat(),
        )

        return VerifyPaymentResponse(
            success=True,
            payment_status=payment.status,
            experience_status=experience.status,
            experience_id=experience.uuid,
            order_id=order_id,
            payment_id=payment_id,
            amount=payment.amount,
            currency=payment.currency,
            verified_at=payment.verified_at,
            message="Payment verified successfully",
        )

    def record_failure(
        self,
        db: Session,
        *,
        experience_uuid: UUID,
        order_id: str | None = None,
        reason: str | None = None,
        cancelled: bool = False,
        gateway_response: dict[str, Any] | None = None,
        customer_email: str | None = None,
    ) -> PaymentFailureResponse:
        experience = self._get_experience(db, experience_uuid)
        self._assert_experience_ownership(experience, customer_email=customer_email)

        payment = experience.payment
        if payment is None:
            if experience.status == ExperienceStatus.PUBLISHED:
                return PaymentFailureResponse(
                    success=False,
                    payment_status=PaymentStatus.SUCCESS,
                    experience_id=experience.uuid,
                    message="Experience is already published.",
                )
            raise NotFoundException(
                "No payment order found for this experience.",
                code="payment_not_found",
            )

        if _is_success(payment.status):
            return PaymentFailureResponse(
                success=False,
                payment_status=payment.status,
                experience_id=experience.uuid,
                message="Payment already completed.",
            )

        if order_id and payment.order_id and payment.order_id != order_id:
            raise ValidationException(
                "Order does not belong to this experience.",
                code="order_mismatch",
            )

        status = PaymentStatus.CANCELLED if cancelled else PaymentStatus.FAILED
        payment.status = status
        payment.failure_reason = (reason or "").strip() or (
            "Payment cancelled by user" if cancelled else "Payment failed"
        )
        payment.gateway_response = {
            **(payment.gateway_response or {}),
            **(gateway_response or {}),
            "failure_recorded_at": _utc_now().isoformat(),
            "cancelled": cancelled,
        }

        # Keep experience payable for retry.
        if experience.status not in {
            ExperienceStatus.READY_TO_PUBLISH,
            ExperienceStatus.PUBLISHED,
            ExperienceStatus.ARCHIVED,
        }:
            experience.status = ExperienceStatus.READY_FOR_PAYMENT

        db.add(payment)
        db.add(experience)
        db.commit()

        logger.warning(
            "Payment failed status=%s order_id=%s experience_uuid=%s reason=%s timestamp=%s",
            status.value,
            payment.order_id,
            experience_uuid,
            payment.failure_reason,
            _utc_now().isoformat(),
        )

        return PaymentFailureResponse(
            success=False,
            payment_status=payment.status,
            experience_id=experience.uuid,
            message=payment.failure_reason or "Payment failed",
        )

    def _get_experience(self, db: Session, experience_uuid: UUID) -> Experience:
        experience = experience_repository.get_by_uuid(db, experience_uuid)
        if experience is None:
            raise NotFoundException(
                "Experience not found.",
                code="experience_not_found",
                details={"experience_id": str(experience_uuid)},
            )
        return experience

    def _assert_experience_payable(
        self,
        experience: Experience,
        *,
        customer_email: str | None,
    ) -> None:
        self._assert_experience_ownership(experience, customer_email=customer_email)

        if experience.deleted_at is not None or experience.status == ExperienceStatus.ARCHIVED:
            raise ValidationException(
                "Archived experiences cannot be paid for.",
                code="experience_archived",
            )

        if experience.status == ExperienceStatus.READY_TO_PUBLISH:
            raise ConflictException(
                "This experience is already paid and ready to publish.",
                code="already_ready_to_publish",
            )

        if experience.status == ExperienceStatus.PUBLISHED:
            raise ConflictException(
                "This experience is already published.",
                code="already_published",
            )

        if experience.status not in _PAYABLE_STATUSES:
            raise ValidationException(
                f"Experience is not ready for payment (status={experience.status.value}).",
                code="experience_not_payable",
            )

    def _assert_experience_ownership(
        self,
        experience: Experience,
        *,
        customer_email: str | None,
    ) -> None:
        """
        Guest checkout ownership: when a customer email is known on the experience,
        optional request email must match. Always reject archived/deleted.
        """
        if experience.deleted_at is not None:
            raise UnauthorizedException(
                "Experience is not accessible.",
                code="experience_inaccessible",
            )

        stored = (experience.customer_email or "").strip().lower()
        provided = (customer_email or "").strip().lower()
        if stored and provided and stored != provided:
            raise UnauthorizedException(
                "Experience ownership check failed.",
                code="experience_ownership_mismatch",
            )

    def _order_created_at(self, payment: Payment) -> datetime | None:
        meta = payment.gateway_response or {}
        raw = meta.get("order_created_at")
        if isinstance(raw, str) and raw.strip():
            try:
                parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
                if parsed.tzinfo is None:
                    parsed = parsed.replace(tzinfo=timezone.utc)
                return parsed
            except ValueError:
                pass
        created = payment.created_at
        if created is None:
            return None
        if created.tzinfo is None:
            return created.replace(tzinfo=timezone.utc)
        return created

    def _order_still_valid(self, payment: Payment) -> bool:
        if not payment.order_id:
            return False
        created = self._order_created_at(payment)
        if created is None:
            return False
        if _utc_now() - created > ORDER_TTL:
            return False

        # Prefer gateway status when available (expired / paid).
        remote = self.gateway.fetch_order(payment.order_id)
        if remote is None:
            return True
        status = (remote.status or "").lower()
        if status == "paid":
            return False
        if status in {"expired", "cancelled"}:
            return False
        return True

    def _order_matches_gateway(self, order_id: str) -> bool:
        """Do not reuse Razorpay orders when mock is active (and vice versa)."""
        provider = self.gateway.provider_name
        is_mock_order = order_id.startswith("order_mock_")
        if provider == "mock":
            return is_mock_order
        if provider == "razorpay":
            return not is_mock_order
        return True


payment_service = PaymentService()
