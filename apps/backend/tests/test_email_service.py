"""EmailService tests — success, retry backoff, validation, status mapping."""

from __future__ import annotations

from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.common.enums import EmailLogStatus, ExperienceStatus
from app.common.exceptions import ValidationException
from app.email.base import EmailSendResult
from app.services.email_service import EmailService


class FakeProvider:
    provider_name = "fake"

    def __init__(self, *, fail_times: int = 0) -> None:
        self.fail_times = fail_times
        self.calls = 0

    def send(self, message):
        self.calls += 1
        if self.calls <= self.fail_times:
            return EmailSendResult(success=False, error=f"fail-{self.calls}")
        return EmailSendResult(success=True, message_id=f"msg_{self.calls}")


class FakeDB:
    def __init__(self) -> None:
        self.committed = 0

    def add(self, _obj):
        return None

    def commit(self):
        self.committed += 1

    def flush(self):
        return None

    def refresh(self, obj):
        if getattr(obj, "id", None) is None:
            obj.id = 1


def _experience():
    published = SimpleNamespace(
        public_url="http://localhost:3000/e/abc12345",
        public_slug="abc12345",
    )
    return SimpleNamespace(
        id=7,
        uuid=uuid4(),
        status=ExperienceStatus.PUBLISHED,
        customer_email="Customer@Example.com",
        customer_name="Nikhil",
        occasion="Birthday",
        experience_data={
            "general": {"receiver_name": "Ada"},
            "metadata": {
                "notes": {
                    "gallery_urls": ["https://res.cloudinary.com/demo/image/upload/v1/p.jpg"],
                    "canonical": {"recipient": {"name": "Ada"}},
                }
            },
        },
        published=published,
    )


@pytest.fixture
def wired(monkeypatch):
    exp = _experience()
    logs: list[object] = []

    monkeypatch.setattr(
        "app.services.email_service.experience_repository.get_by_uuid",
        lambda _db, _uuid, include_deleted=False: exp,
    )
    monkeypatch.setattr(
        "app.services.email_service.email_log_repository.get_latest_for_experience",
        lambda _db, _eid, email_type="experience_ready": logs[-1] if logs else None,
    )

    def fake_add(_db, row):
        row.id = len(logs) + 1
        logs.append(row)
        return row

    monkeypatch.setattr(
        "app.services.email_service.email_log_repository.add",
        fake_add,
    )
    monkeypatch.setattr(
        "app.services.email_service.email_log_repository.save",
        lambda _db, row: row,
    )
    monkeypatch.setattr("app.services.email_service.time.sleep", lambda _s: None)

    return exp, logs


def test_send_success(wired):
    _exp, logs = wired
    provider = FakeProvider()
    svc = EmailService(provider=provider)
    status = svc.deliver_experience_ready(FakeDB(), uuid4())

    assert status.email_sent is True
    assert status.status == "email_sent"
    assert provider.calls == 1
    assert logs[-1].status == EmailLogStatus.SENT
    assert logs[-1].message_id == "msg_1"


def test_retries_then_succeeds(wired):
    _exp, logs = wired
    provider = FakeProvider(fail_times=2)
    svc = EmailService(provider=provider)
    status = svc.deliver_experience_ready(FakeDB(), uuid4())

    assert provider.calls == 3
    assert status.email_sent is True
    assert logs[-1].retry_count == 2


def test_retries_then_fails(wired):
    _exp, logs = wired
    provider = FakeProvider(fail_times=5)
    svc = EmailService(provider=provider)
    status = svc.deliver_experience_ready(FakeDB(), uuid4())

    assert provider.calls == 3
    assert status.failed is True
    assert status.status == "failed"
    assert logs[-1].status == EmailLogStatus.FAILED


def test_rejects_invalid_email(wired, monkeypatch):
    exp, _logs = wired
    exp.customer_email = "not-an-email"
    svc = EmailService(provider=FakeProvider())
    with pytest.raises(ValidationException) as exc:
        svc.deliver_experience_ready(FakeDB(), exp.uuid)
    assert exc.value.code == "invalid_recipient_email"


def test_rejects_before_publish(wired, monkeypatch):
    exp, _logs = wired
    exp.status = ExperienceStatus.READY_TO_PUBLISH
    svc = EmailService(provider=FakeProvider())
    with pytest.raises(ValidationException) as exc:
        svc.deliver_experience_ready(FakeDB(), exp.uuid)
    assert exc.value.code == "not_published"


def test_delivery_status_pending_when_no_log(wired, monkeypatch):
    exp, _logs = wired
    svc = EmailService(provider=FakeProvider())
    monkeypatch.setattr(
        "app.services.email_service.email_log_repository.get_latest_for_experience",
        lambda *_a, **_k: None,
    )
    status = svc.get_delivery_status(FakeDB(), exp.uuid)
    assert status.pending is True
    assert status.status == "pending"
