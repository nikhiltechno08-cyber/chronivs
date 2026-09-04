"""PublishService unit tests — happy path, status gate, payment gate, immutability helpers."""

from __future__ import annotations

from datetime import datetime, timezone
from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.common.enums import ExperienceStatus, PaymentStatus
from app.common.exceptions import ValidationException
from app.services.publish_service import PublishService


class FakeDB:
    def __init__(self) -> None:
        self.committed = False
        self.rolled_back = False
        self.added: list[object] = []

    def add(self, obj: object) -> None:
        self.added.append(obj)

    def commit(self) -> None:
        self.committed = True

    def rollback(self) -> None:
        self.rolled_back = True

    def flush(self) -> None:
        return None

    def refresh(self, _obj: object) -> None:
        return None


def _snapshot():
    return {
        "general": {
            "receiver_name": "Ada",
            "experience_title": "For Ada",
            "sender_name": "Alan",
        },
        "hero": {},
        "timeline": {"items": []},
        "letter": {"body": "Hello"},
        "gallery": {"items": []},
        "music": {},
        "ending": {},
        "metadata": {
            "notes": {
                "schema_version": 1,
                "gallery_urls": ["https://res.cloudinary.com/demo/image/upload/v1/photo.jpg"],
                "canonical": {
                    "templateId": "birthday-girlfriend",
                    "occasion": "birthday",
                    "relationship": "girlfriend",
                    "recipient": {"name": "Ada"},
                    "creator": {"name": "Alan", "email": "a@example.com", "phone": "9876543210"},
                    "content": {"title": "For Ada", "letter": "Hello"},
                    "media": {
                        "gallery": [
                            {"url": "https://res.cloudinary.com/demo/image/upload/v1/photo.jpg"}
                        ],
                        "music": {},
                    },
                    "metadata": {"version": 1},
                },
            }
        },
        "theme": {},
        "animations": {},
    }


def _experience(*, status=ExperienceStatus.READY_TO_PUBLISH, payment_status=PaymentStatus.SUCCESS):
    payment = SimpleNamespace(status=payment_status, payment_id="pay_1")
    return SimpleNamespace(
        id=1,
        uuid=uuid4(),
        status=status,
        deleted_at=None,
        template_slug="birthday-girlfriend",
        title="For Ada",
        customer_email="a@example.com",
        experience_data=_snapshot(),
        payment=payment,
        published_at=None,
        published_by=None,
        published_version=None,
        published=None,
    )


@pytest.fixture
def service(monkeypatch):
    svc = PublishService()
    exp_holder: dict[str, object] = {}

    def fake_get(_db, experience_uuid, include_deleted=False):
        return exp_holder.get("exp")

    monkeypatch.setattr(
        "app.services.publish_service.experience_repository.get_by_uuid",
        fake_get,
    )
    monkeypatch.setattr(
        "app.services.publish_service.experience_repository.save",
        lambda _db, exp: exp,
    )
    monkeypatch.setattr(
        "app.services.publish_service.published_experience_repository.slug_exists",
        lambda _db, _slug: False,
    )
    monkeypatch.setattr(
        "app.services.publish_service.published_experience_repository.get_by_experience_id",
        lambda _db, _experience_id: None,
    )

    created: dict[str, object] = {}

    def fake_add(_db, row):
        created["published"] = row
        return row

    monkeypatch.setattr(
        "app.services.publish_service.published_experience_repository.add",
        fake_add,
    )

    # Replace PublishedExperience constructor with SimpleNamespace-friendly stand-in
    import app.services.publish_service as mod

    class FakePublished:
        def __init__(self, **kwargs):
            self.__dict__.update(kwargs)
            created["published"] = self

    original = mod.PublishedExperience
    mod.PublishedExperience = FakePublished  # type: ignore[misc,assignment]

    yield svc, exp_holder, created

    mod.PublishedExperience = original


def test_publish_success(service):
    svc, holder, created = service
    exp = _experience()
    holder["exp"] = exp
    db = FakeDB()

    result = svc.publish(db, exp.uuid)

    assert result.published is True
    assert result.status == "PUBLISHED"
    assert result.version == 1
    assert "/e/" in result.public_url
    assert exp.status == ExperienceStatus.PUBLISHED
    assert exp.published_at is not None
    assert exp.published_version == 1
    assert db.committed is True
    assert "published" in created


def test_reject_wrong_status(service):
    svc, holder, _created = service
    exp = _experience(status=ExperienceStatus.READY_FOR_PAYMENT)
    holder["exp"] = exp
    db = FakeDB()

    with pytest.raises(ValidationException) as exc:
        svc.publish(db, exp.uuid)
    assert exc.value.code == "invalid_publish_status"
    assert db.rolled_back is True


def test_reject_unpaid(service):
    svc, holder, _created = service
    exp = _experience(payment_status=PaymentStatus.PENDING)
    holder["exp"] = exp
    db = FakeDB()

    with pytest.raises(ValidationException) as exc:
        svc.publish(db, exp.uuid)
    assert exc.value.code == "payment_not_verified"
    assert db.rolled_back is True


def test_publish_is_idempotent_for_existing_record(service, monkeypatch):
    svc, holder, _created = service
    exp = _experience(status=ExperienceStatus.PUBLISHED)
    holder["exp"] = exp
    published = SimpleNamespace(
        public_uuid=uuid4(),
        public_slug="f8c3a74b",
        public_url="http://localhost:3000/e/f8c3a74b",
        template_id="birthday-girlfriend",
        version=1,
        published_at=datetime.now(timezone.utc),
    )
    monkeypatch.setattr(
        "app.services.publish_service.published_experience_repository.get_by_experience_id",
        lambda _db, _experience_id: published,
    )
    db = FakeDB()

    result = svc.publish(db, exp.uuid)

    assert result.published is True
    assert result.public_slug == "f8c3a74b"
    assert db.committed is True


def test_reject_invalid_media(service):
    svc, holder, _created = service
    exp = _experience()
    snap = _snapshot()
    snap["metadata"]["notes"]["gallery_urls"] = ["blob:local-preview"]
    snap["metadata"]["notes"]["canonical"]["media"]["gallery"] = [
        {"url": "blob:local-preview"}
    ]
    exp.experience_data = snap
    holder["exp"] = exp
    db = FakeDB()

    with pytest.raises(ValidationException) as exc:
        svc.publish(db, exp.uuid)
    assert exc.value.code == "publish_validation_failed"


def test_public_runtime_rejects_inactive(service, monkeypatch):
    svc, _holder, _created = service
    published = SimpleNamespace(
        public_uuid=uuid4(),
        public_slug="f8c3a74b",
        public_url="http://localhost:3000/e/f8c3a74b",
        template_id="birthday-girlfriend",
        version=1,
        published_at=datetime.now(timezone.utc),
        status="published",
        is_active=False,
        expires_at=None,
        experience_snapshot=_snapshot(),
        experience=SimpleNamespace(
            deleted_at=None,
            status=ExperienceStatus.PUBLISHED,
            template_slug="birthday-girlfriend",
            experience_data=_snapshot(),
        ),
    )
    monkeypatch.setattr(
        "app.services.publish_service.published_experience_repository.get_by_public_token",
        lambda _db, _token, include_inactive=False: published,
    )
    from app.common.exceptions import NotFoundException

    with pytest.raises(NotFoundException):
        svc.get_public_runtime(FakeDB(), "f8c3a74b")
