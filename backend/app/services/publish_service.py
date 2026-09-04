"""
PublishService — transform a paid draft into an immutable published experience.

Atomic transaction. Never generates static HTML — freezes ExperienceData for
the runtime renderer (Template + ExperienceData + Cloudinary URLs).
"""

from __future__ import annotations

import copy
import logging
import time
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from app.common.enums import ExperienceStatus, PaymentStatus
from app.common.exceptions import NotFoundException, ValidationException
from app.core.config import settings
from app.models.experience import Experience
from app.models.published_experience import PublishedExperience
from app.repositories.experience_repository import experience_repository
from app.repositories.published_experience_repository import published_experience_repository
from app.schemas.publish import PublicRuntimePayload, PublishResponse

logger = logging.getLogger(__name__)

KNOWN_TEMPLATES = frozenset(
    {
        "birthday-girlfriend",
        "birthday-mother",
        "birthday-father",
        "anniversary-wife",
        "proposal-girlfriend",
    }
)

_PAYMENT_OK = {PaymentStatus.SUCCESS, PaymentStatus.PAID}


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        return value.model_dump()
    return {}


class PublishService:
    """Validate → freeze → publish → public URL. No router logic."""

    def publish(
        self,
        db: Session,
        experience_uuid: UUID,
        *,
        published_by: str | None = None,
    ) -> PublishResponse:
        started = time.perf_counter()
        logger.info(
            "Publish started experience_uuid=%s timestamp=%s",
            experience_uuid,
            _utc_now().isoformat(),
        )

        try:
            experience = experience_repository.get_by_uuid(
                db, experience_uuid, include_deleted=True
            )
            if experience is None:
                raise NotFoundException(
                    "Experience not found.",
                    code="experience_not_found",
                    details={"experience_id": str(experience_uuid)},
                )

            published = published_experience_repository.get_by_experience_id(
                db, experience.id
            )
            if published is not None:
                if experience.status != ExperienceStatus.PUBLISHED:
                    experience.status = ExperienceStatus.PUBLISHED
                    experience.published_at = (
                        experience.published_at or published.published_at or _utc_now()
                    )
                    experience.published_version = int(
                        published.version or experience.published_version or 1
                    )
                    experience_repository.save(db, experience)
                result = self._response_from_published(experience, published)
                db.commit()
                duration_ms = int((time.perf_counter() - started) * 1000)
                logger.info(
                    "Publish idempotent experience_uuid=%s public_slug=%s duration_ms=%s",
                    experience_uuid,
                    result.public_slug,
                    duration_ms,
                )
                return result

            self._assert_publishable(experience)
            self._validate_for_publish(db, experience)

            # Atomic unit of work
            result = self._freeze_and_publish(db, experience, published_by=published_by)
            db.commit()

            duration_ms = int((time.perf_counter() - started) * 1000)
            logger.info(
                "Publish success experience_uuid=%s public_slug=%s duration_ms=%s timestamp=%s",
                experience_uuid,
                result.public_slug,
                duration_ms,
                _utc_now().isoformat(),
            )
            return result
        except Exception as exc:
            db.rollback()
            duration_ms = int((time.perf_counter() - started) * 1000)
            logger.error(
                "Publish failed experience_uuid=%s duration_ms=%s error=%s timestamp=%s",
                experience_uuid,
                duration_ms,
                str(exc),
                _utc_now().isoformat(),
            )
            raise

    def get_public_runtime(self, db: Session, public_token: str) -> PublicRuntimePayload:
        """
        Public viewer payload. Rejects unpublished / inactive / deleted / expired.
        Never exposes draft-only fields or internal integer ids.
        """
        published = published_experience_repository.get_by_public_token(db, public_token)
        if published is None:
            raise NotFoundException(
                "Published experience not found.",
                code="published_not_found",
            )

        if published.status != "published" or not published.is_active:
            raise NotFoundException(
                "Published experience is not available.",
                code="published_inactive",
            )

        if published.expires_at is not None:
            expires = published.expires_at
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if _utc_now() > expires:
                raise NotFoundException(
                    "This share link has expired.",
                    code="published_expired",
                )

        experience = published.experience
        if experience is None or experience.deleted_at is not None:
            raise NotFoundException(
                "Published experience not found.",
                code="published_not_found",
            )

        if experience.status != ExperienceStatus.PUBLISHED:
            raise NotFoundException(
                "Experience is not published.",
                code="not_published",
            )

        snapshot = published.experience_snapshot or _as_dict(experience.experience_data)
        notes = _as_dict(_as_dict(snapshot.get("metadata")).get("notes"))
        canonical = _as_dict(notes.get("canonical"))
        template_id = (
            str(canonical.get("templateId") or "").strip()
            or (published.template_id or "").strip()
            or (experience.template_slug or "").strip()
        )

        if not template_id:
            raise NotFoundException(
                "Published experience is missing a template.",
                code="missing_template",
            )

        media_urls = self._extract_media_urls(snapshot)

        return PublicRuntimePayload(
            public_uuid=str(published.public_uuid),
            public_slug=published.public_slug,
            public_url=published.public_url,
            template_id=template_id,
            version=int(published.version or 1),
            published_at=published.published_at,
            status=published.status.upper(),
            experience_data=snapshot,
            media_urls=media_urls,
        )

    def _assert_publishable(self, experience: Experience) -> None:
        if experience.deleted_at is not None or experience.status == ExperienceStatus.ARCHIVED:
            raise ValidationException(
                "Archived experiences cannot be published.",
                code="experience_archived",
            )

        if experience.status != ExperienceStatus.READY_TO_PUBLISH:
            raise ValidationException(
                f"Experience must be ready_to_publish (got {experience.status.value}).",
                code="invalid_publish_status",
            )

        payment = experience.payment
        if payment is None or payment.status not in _PAYMENT_OK:
            raise ValidationException(
                "Payment must be verified before publishing.",
                code="payment_not_verified",
            )

    def _validate_for_publish(self, db: Session, experience: Experience) -> None:
        """Re-validate content/media/template before freezing. Abort on failure."""
        _ = db  # reserved for future repository-backed media checks
        content_errors = self._validate_content_and_media(experience)
        if content_errors:
            raise ValidationException(
                content_errors[0],
                code="publish_validation_failed",
                details={"errors": content_errors},
            )

    def _validate_content_and_media(self, experience: Experience) -> list[str]:
        errors: list[str] = []
        data = _as_dict(experience.experience_data)
        notes = _as_dict(_as_dict(data.get("metadata")).get("notes"))
        canonical = _as_dict(notes.get("canonical"))
        general = _as_dict(data.get("general"))
        content = _as_dict(canonical.get("content"))
        recipient = _as_dict(canonical.get("recipient"))
        media = _as_dict(canonical.get("media"))
        gallery = media.get("gallery") if isinstance(media.get("gallery"), list) else []

        template_id = (
            (experience.template_slug or "").strip()
            or str(canonical.get("templateId") or "").strip()
        )
        if not template_id:
            errors.append("Template is required.")
        elif template_id not in KNOWN_TEMPLATES:
            errors.append(f"Unknown template: {template_id}.")

        recipient_name = (
            str(recipient.get("name") or "").strip()
            or str(general.get("receiver_name") or "").strip()
        )
        if not recipient_name:
            errors.append("Recipient name is required.")

        title = (
            (experience.title or "").strip()
            or str(content.get("title") or "").strip()
            or str(general.get("experience_title") or "").strip()
        )
        if not title:
            errors.append("Experience title is required.")

        if not data or not isinstance(data, dict):
            errors.append("Experience JSON is invalid.")

        urls: list[str] = []
        gallery_urls = notes.get("gallery_urls")
        if isinstance(gallery_urls, list):
            urls = [str(u) for u in gallery_urls if u]
        for item in gallery:
            if isinstance(item, dict) and item.get("url"):
                urls.append(str(item["url"]))

        # Photos are optional — only reject invalid local/blob URLs when present.
        invalid = [
            u
            for u in urls
            if u and (u.startswith("blob:") or u.startswith("data:") or not u.startswith("https://"))
        ]
        if invalid:
            errors.append("All media must use valid Cloudinary HTTPS URLs.")

        return errors

    def _response_from_published(
        self,
        experience: Experience,
        published: PublishedExperience,
    ) -> PublishResponse:
        template_id = (
            (published.template_id or "").strip()
            or (experience.template_slug or "").strip()
            or None
        )
        published_at = published.published_at or experience.published_at or _utc_now()
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)
        public_url = published.public_url or self._build_public_url(published.public_slug)
        return PublishResponse(
            published=True,
            public_url=public_url,
            public_uuid=str(published.public_uuid),
            public_slug=published.public_slug,
            published_at=published_at,
            status="PUBLISHED",
            version=int(published.version or 1),
            template_id=template_id,
            experience_id=experience.uuid,
        )

    def _freeze_and_publish(
        self,
        db: Session,
        experience: Experience,
        *,
        published_by: str | None,
    ) -> PublishResponse:
        now = _utc_now()
        public_uuid = uuid4()
        public_slug = self._unique_public_slug(db, public_uuid)
        public_url = self._build_public_url(public_slug)

        data = _as_dict(experience.experience_data)
        notes = _as_dict(_as_dict(data.get("metadata")).get("notes"))
        canonical = _as_dict(notes.get("canonical"))
        template_id = (
            (experience.template_slug or "").strip()
            or str(canonical.get("templateId") or "").strip()
        )

        # Immutable frozen snapshot (deep copy) — runtime reads this, not live draft.
        snapshot = copy.deepcopy(data)
        snap_meta = _as_dict(snapshot.get("metadata"))
        snap_notes = dict(_as_dict(snap_meta.get("notes")))
        snap_notes["frozen_at"] = now.isoformat()
        snap_notes["publish_version"] = 1
        snap_notes["schema_version"] = snap_notes.get("schema_version") or 1
        snap_meta["notes"] = snap_notes
        snapshot["metadata"] = snap_meta

        actor = (published_by or experience.customer_email or "").strip() or None
        version = 1

        published = PublishedExperience(
            experience_id=experience.id,
            public_uuid=public_uuid,
            public_slug=public_slug,
            public_url=public_url,
            template_id=template_id,
            published_at=now,
            status="published",
            version=version,
            published_by=actor,
            experience_snapshot=snapshot,
            expires_at=None,
            is_active=True,
        )
        published_experience_repository.add(db, published)

        # Lock the experience — no further edits.
        experience.status = ExperienceStatus.PUBLISHED
        experience.published_at = now
        experience.published_by = actor
        experience.published_version = version
        # Persist frozen snapshot on the experience row too (single source for export).
        experience.experience_data = snapshot
        experience_repository.save(db, experience)

        return PublishResponse(
            published=True,
            public_url=public_url,
            public_uuid=str(public_uuid),
            public_slug=public_slug,
            published_at=now,
            status="PUBLISHED",
            version=version,
            template_id=template_id,
            experience_id=experience.uuid,
        )

    def _unique_public_slug(self, db: Session, public_uuid: UUID) -> str:
        """Short cryptographically derived token for /e/{slug} (example: f8c3a74b)."""
        # Prefer 8 hex chars from the secure UUID; retry with more entropy on collision.
        candidates = [
            public_uuid.hex[:8],
            public_uuid.hex[:12],
            uuid4().hex[:8],
            uuid4().hex[:12],
        ]
        for slug in candidates:
            if not published_experience_repository.slug_exists(db, slug):
                return slug
        # Extremely unlikely fallback
        return uuid4().hex

    def _build_public_url(self, public_slug: str) -> str:
        base = (settings.PUBLIC_APP_URL or "https://chronivs.com").rstrip("/")
        return f"{base}/e/{public_slug}"

    def _extract_media_urls(self, snapshot: dict[str, Any]) -> list[str]:
        notes = _as_dict(_as_dict(snapshot.get("metadata")).get("notes"))
        urls: list[str] = []
        gallery_urls = notes.get("gallery_urls")
        if isinstance(gallery_urls, list):
            urls.extend(str(u) for u in gallery_urls if u)
        canonical = _as_dict(notes.get("canonical"))
        gallery = _as_dict(canonical.get("media")).get("gallery")
        if isinstance(gallery, list):
            for item in gallery:
                if isinstance(item, dict) and item.get("url"):
                    urls.append(str(item["url"]))
        # Dedupe preserve order
        seen: set[str] = set()
        out: list[str] = []
        for u in urls:
            if u not in seen:
                seen.add(u)
                out.append(u)
        return out


publish_service = PublishService()
