"""
Public runtime service — load published experiences for recipients.

Never queries draft-only flows for rendering. Never exposes payment/PII/internal IDs.
"""

from __future__ import annotations

import copy
import logging
from datetime import datetime, timezone
from typing import Any
from sqlalchemy.orm import Session

from app.common.enums import ExperienceStatus
from app.common.exceptions import NotFoundException
from app.core.config import settings
from app.repositories.published_experience_repository import published_experience_repository
from app.schemas.public_runtime import PublicRuntimeMeta, PublicRuntimeResponse

logger = logging.getLogger(__name__)

SENSITIVE_CREATOR_KEYS = frozenset({"email", "phone", "mobile", "customer_email", "customer_mobile"})
SENSITIVE_NOTE_KEYS = frozenset(
    {
        "coupon_code",
        "source",
        "payment",
        "checkout",
        "customer_email",
        "customer_mobile",
        "customer_name",
    }
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        return value.model_dump()
    return {}


def sanitize_experience_data_for_public(raw: dict[str, Any] | None) -> dict[str, Any]:
    """Strip creator contact, coupons, and other internal fields from frozen JSON."""
    data = copy.deepcopy(_as_dict(raw))
    if not data:
        return {}

    notes = _as_dict(_as_dict(data.get("metadata")).get("notes"))
    canonical = _as_dict(notes.get("canonical"))

    if canonical:
        creator = _as_dict(canonical.get("creator"))
        for key in SENSITIVE_CREATOR_KEYS:
            creator.pop(key, None)
        # Keep display name only
        canonical["creator"] = {"name": str(creator.get("name") or "").strip()}
        canonical.pop("experienceId", None)
        notes["canonical"] = canonical

    for key in list(notes.keys()):
        if key in SENSITIVE_NOTE_KEYS:
            notes.pop(key, None)

    metadata = _as_dict(data.get("metadata"))
    metadata["notes"] = notes
    data["metadata"] = metadata

    # Never leak top-level personalization contact fields if present
    general = _as_dict(data.get("general"))
    for key in ("sender_email", "sender_phone", "customer_email", "customer_mobile"):
        general.pop(key, None)
    if general:
        data["general"] = general

    return data


def extract_media_urls(snapshot: dict[str, Any]) -> list[str]:
    notes = _as_dict(_as_dict(snapshot.get("metadata")).get("notes"))
    urls: list[str] = []
    gallery_urls = notes.get("gallery_urls")
    if isinstance(gallery_urls, list):
        urls.extend(str(u) for u in gallery_urls if isinstance(u, str) and u.startswith("https://"))

    canonical = _as_dict(notes.get("canonical"))
    gallery = _as_dict(canonical.get("media")).get("gallery")
    if isinstance(gallery, list):
        for item in gallery:
            if isinstance(item, dict):
                url = item.get("url")
                if isinstance(url, str) and url.startswith("https://"):
                    urls.append(url)

    seen: set[str] = set()
    out: list[str] = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            out.append(url)
    return out


def extract_music_url(snapshot: dict[str, Any]) -> str | None:
    notes = _as_dict(_as_dict(snapshot.get("metadata")).get("notes"))
    music_url = notes.get("music_url")
    if isinstance(music_url, str) and music_url.startswith("https://"):
        return music_url
    canonical = _as_dict(notes.get("canonical"))
    music = _as_dict(_as_dict(canonical.get("media")).get("music"))
    url = music.get("url")
    if isinstance(url, str) and url.startswith("https://"):
        return url
    return None


class PublicRuntimeService:
    def get_runtime(self, db: Session, public_token: str) -> PublicRuntimeResponse:
        token = (public_token or "").strip()
        if not token:
            raise NotFoundException(
                "This experience link is invalid.",
                code="invalid_public_uuid",
            )

        # Soft UUID shape check (slug tokens are short hex — allow those too)
        if len(token) < 6 or len(token) > 64:
            raise NotFoundException(
                "This experience link is invalid.",
                code="invalid_public_uuid",
            )

        published = published_experience_repository.get_by_public_token(db, token)
        if published is None:
            raise NotFoundException(
                "This experience could not be found.",
                code="published_not_found",
            )

        if not published.is_active or published.status != "published":
            raise NotFoundException(
                "This experience is no longer available.",
                code="published_unavailable",
            )

        if published.expires_at is not None:
            expires = published.expires_at
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if _utc_now() > expires:
                raise NotFoundException(
                    "This experience link has expired.",
                    code="published_expired",
                )

        experience = published.experience
        if experience is None or experience.deleted_at is not None:
            raise NotFoundException(
                "This experience is no longer available.",
                code="published_deleted",
            )

        if experience.status != ExperienceStatus.PUBLISHED:
            raise NotFoundException(
                "This experience is not available yet.",
                code="not_published",
            )

        snapshot = published.experience_snapshot or _as_dict(experience.experience_data)
        sanitized = sanitize_experience_data_for_public(snapshot)
        media_urls = extract_media_urls(sanitized)
        music_url = extract_music_url(sanitized)

        notes = _as_dict(_as_dict(sanitized.get("metadata")).get("notes"))
        canonical = _as_dict(notes.get("canonical"))
        template_id = (
            str(canonical.get("templateId") or "").strip()
            or (published.template_id or "").strip()
            or (experience.template_slug or "").strip()
        )
        if not template_id:
            raise NotFoundException(
                "This experience is unavailable.",
                code="published_unavailable",
            )

        public_url = published.public_url or (
            f"{settings.PUBLIC_APP_URL.rstrip('/')}/e/{published.public_slug}"
        )

        logger.info(
            "Public runtime loaded public_slug=%s template_id=%s",
            published.public_slug,
            template_id,
        )

        return PublicRuntimeResponse(
            template_id=template_id,
            experience_data=sanitized,
            media_urls=media_urls,
            music_url=music_url,
            meta=PublicRuntimeMeta(
                public_uuid=str(published.public_uuid),
                public_slug=published.public_slug,
                public_url=public_url,
                published_at=published.published_at,
                version=int(published.version or 1),
                status="published",
                show_create_cta=True,
            ),
        )


public_runtime_service = PublicRuntimeService()
