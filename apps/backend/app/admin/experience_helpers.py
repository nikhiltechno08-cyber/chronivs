"""Shared admin query helpers for experience payloads."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.admin.schemas import AdminOrderPhotoItem
from app.common.enums import ExperienceStatus, MediaType
from app.models.checkout_session import CheckoutSession
from app.models.experience import Experience
from app.models.experience_media import ExperienceMedia
from app.models.payment import Payment
from app.models.published_experience import PublishedExperience


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def extract_general(experience: Experience | None) -> dict[str, Any]:
    if not experience or not experience.experience_data:
        return {}
    raw = experience.experience_data
    general = raw.get("general") if isinstance(raw, dict) else None
    return general if isinstance(general, dict) else {}


def extract_custom_message(experience: Experience | None) -> str | None:
    general = extract_general(experience)
    message = general.get("custom_message")
    if isinstance(message, str) and message.strip():
        return message.strip()

    if not experience or not experience.experience_data:
        return None
    raw = experience.experience_data
    if not isinstance(raw, dict):
        return None
    letter = raw.get("letter")
    if isinstance(letter, dict):
        body = letter.get("body")
        if isinstance(body, str) and body.strip():
            return body.strip()
    return None


def extract_recipient_name(
    experience: Experience | None,
    checkout: CheckoutSession | None = None,
) -> str | None:
    general = extract_general(experience)
    receiver = general.get("receiver_name")
    if isinstance(receiver, str) and receiver.strip():
        return receiver.strip()
    if checkout:
        return checkout.customer_name
    return experience.customer_name if experience else None


def photo_items(media: list[ExperienceMedia]) -> list[AdminOrderPhotoItem]:
    items: list[AdminOrderPhotoItem] = []
    for row in media:
        if row.media_type not in {MediaType.PHOTO, MediaType.COVER}:
            continue
        url = row.secure_url or row.file_url or row.placeholder_url
        items.append(
            AdminOrderPhotoItem(
                uuid=str(row.uuid),
                url=url,
                cloudinary_public_id=row.cloudinary_public_id,
                media_type=row.media_type.value,
                alt_text=row.alt_text,
            )
        )
    return items


def payment_reference(payment: Payment | None) -> str | None:
    if not payment:
        return None
    return payment.payment_id or payment.order_id


def resolve_customer_name(
    experience: Experience,
    checkout: CheckoutSession | None,
) -> str:
    if experience.customer_name:
        return experience.customer_name
    if checkout:
        return checkout.customer_name
    return "Customer"


def is_expired(published: PublishedExperience | None, now: datetime | None = None) -> bool:
    if not published or not published.expires_at:
        return False
    current = now or utc_now()
    return published.expires_at < current


def is_published(experience: Experience, published: PublishedExperience | None) -> bool:
    if published and published.is_active and published.status == "published":
        return True
    return experience.status == ExperienceStatus.PUBLISHED


def display_status(
    experience: Experience,
    published: PublishedExperience | None,
    now: datetime | None = None,
) -> str:
    if is_expired(published, now):
        return "expired"
    if is_published(experience, published):
        return "published"
    return "draft"
