"""Public runtime sanitization + access control tests."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.common.enums import ExperienceStatus
from app.common.exceptions import NotFoundException
from app.services.public_runtime_service import (
    PublicRuntimeService,
    sanitize_experience_data_for_public,
)


def test_sanitize_strips_creator_contact_and_coupons():
    raw = {
        "general": {"receiver_name": "Ada", "customer_email": "secret@example.com"},
        "metadata": {
            "notes": {
                "coupon_code": "SECRET",
                "gallery_urls": ["https://res.cloudinary.com/demo/a.jpg"],
                "canonical": {
                    "templateId": "birthday-girlfriend",
                    "experienceId": "internal-uuid",
                    "creator": {
                        "name": "Alan",
                        "email": "alan@example.com",
                        "phone": "9876543210",
                    },
                    "recipient": {"name": "Ada"},
                    "media": {"gallery": [{"url": "https://res.cloudinary.com/demo/a.jpg"}]},
                },
            }
        },
    }
    clean = sanitize_experience_data_for_public(raw)
    notes = clean["metadata"]["notes"]
    assert "coupon_code" not in notes
    assert notes["canonical"]["creator"] == {"name": "Alan"}
    assert "experienceId" not in notes["canonical"]
    assert "customer_email" not in clean["general"]


def test_get_runtime_success(monkeypatch):
    pub_uuid = uuid4()
    published = SimpleNamespace(
        id=1,
        public_uuid=pub_uuid,
        public_slug="f8c3a74b",
        public_url="http://localhost:3000/e/f8c3a74b",
        template_id="birthday-girlfriend",
        published_at=datetime.now(timezone.utc),
        version=1,
        status="published",
        is_active=True,
        expires_at=None,
        experience_snapshot={
            "metadata": {
                "notes": {
                    "gallery_urls": ["https://res.cloudinary.com/demo/a.jpg"],
                    "music_url": "https://res.cloudinary.com/demo/m.mp3",
                    "canonical": {
                        "templateId": "birthday-girlfriend",
                        "creator": {"name": "A", "email": "x@y.com", "phone": "1"},
                        "media": {"gallery": [], "music": {"url": "https://res.cloudinary.com/demo/m.mp3"}},
                    },
                }
            }
        },
        experience=SimpleNamespace(
            deleted_at=None,
            status=ExperienceStatus.PUBLISHED,
            template_slug="birthday-girlfriend",
            experience_data={},
        ),
    )
    monkeypatch.setattr(
        "app.services.public_runtime_service.published_experience_repository.get_by_public_token",
        lambda _db, _token, include_inactive=False: published,
    )
    svc = PublicRuntimeService()
    result = svc.get_runtime(SimpleNamespace(), "f8c3a74b")
    assert result.template_id == "birthday-girlfriend"
    assert result.music_url.endswith(".mp3")
    assert result.meta.public_slug == "f8c3a74b"
    creator = result.experience_data["metadata"]["notes"]["canonical"]["creator"]
    assert creator == {"name": "A"}


def test_reject_expired(monkeypatch):
    published = SimpleNamespace(
        is_active=True,
        status="published",
        expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
        experience=SimpleNamespace(deleted_at=None, status=ExperienceStatus.PUBLISHED),
    )
    monkeypatch.setattr(
        "app.services.public_runtime_service.published_experience_repository.get_by_public_token",
        lambda *_a, **_k: published,
    )
    with pytest.raises(NotFoundException) as exc:
        PublicRuntimeService().get_runtime(SimpleNamespace(), "f8c3a74b")
    assert exc.value.code == "published_expired"


def test_reject_unpublished(monkeypatch):
    published = SimpleNamespace(
        is_active=True,
        status="published",
        expires_at=None,
        experience=SimpleNamespace(
            deleted_at=None,
            status=ExperienceStatus.READY_TO_PUBLISH,
            template_slug="birthday-girlfriend",
            experience_data={},
        ),
        experience_snapshot={},
        template_id="birthday-girlfriend",
    )
    monkeypatch.setattr(
        "app.services.public_runtime_service.published_experience_repository.get_by_public_token",
        lambda *_a, **_k: published,
    )
    with pytest.raises(NotFoundException) as exc:
        PublicRuntimeService().get_runtime(SimpleNamespace(), "f8c3a74b")
    assert exc.value.code == "not_published"
