"""
Pre-publish validation for Chronivs experiences.

Centralized, reusable rules with a template registry so new templates can
register additional checks without changing the core validator.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import datetime, timezone
from typing import Any, Literal
from uuid import UUID

from sqlalchemy.orm import Session

from app.common.enums import ExperienceStatus, MediaType, MediaUploadStatus
from app.models.experience import Experience
from app.repositories.experience_repository import experience_repository
from app.schemas.experience_data import EXPERIENCE_DATA_SECTIONS
from app.schemas.publish_validation import (
    PublishValidationIssue,
    PublishValidationResponse,
    PublishValidationSummary,
)

logger = logging.getLogger(__name__)

EXPECTED_SCHEMA_VERSION = 1
MIN_PHOTOS_DEFAULT = 0

PublishStage = Literal["pre_publish", "pre_payment"]

TemplateRuleFn = Callable[
    [Experience, dict[str, Any], PublishStage],
    tuple[list[PublishValidationIssue], list[PublishValidationIssue]],
]

# template_slug → additional rule callables
_TEMPLATE_RULES: dict[str, list[TemplateRuleFn]] = {}


def register_template_validation_rules(template_slug: str, *rules: TemplateRuleFn) -> None:
    """Register extra validation rules for a template (future-compatible)."""
    slug = (template_slug or "").strip().lower()
    if not slug:
        return
    bucket = _TEMPLATE_RULES.setdefault(slug, [])
    for rule in rules:
        if rule not in bucket:
            bucket.append(rule)


def clear_template_validation_rules(template_slug: str | None = None) -> None:
    """Test helper — clear one template or the entire registry."""
    if template_slug is None:
        _TEMPLATE_RULES.clear()
    else:
        _TEMPLATE_RULES.pop(template_slug.strip().lower(), None)


def _issue(field: str, message: str, code: str | None = None) -> PublishValidationIssue:
    return PublishValidationIssue(field=field, message=message, code=code)


def _as_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if hasattr(value, "model_dump"):
        return value.model_dump()
    return {}


def _canonical(experience: Experience) -> dict[str, Any]:
    data = _as_dict(experience.experience_data)
    metadata = _as_dict(data.get("metadata"))
    notes = _as_dict(metadata.get("notes"))
    canonical = notes.get("canonical")
    return canonical if isinstance(canonical, dict) else {}


def _cloudinary_url(url: str | None) -> bool:
    """True for durable https media URLs (Cloudinary preferred; rejects local blobs)."""
    if not url or not isinstance(url, str):
        return False
    lowered = url.strip().lower()
    if lowered.startswith("blob:") or lowered.startswith("data:"):
        return False
    return lowered.startswith("https://")


class PublishValidator:
    """Reusable publish / pre-payment validator."""

    def validate_experience(
        self,
        db: Session,
        experience_uuid: UUID,
        *,
        stage: PublishStage = "pre_publish",
        transition: bool = True,
        extras: dict[str, Any] | None = None,
    ) -> PublishValidationResponse:
        timestamp = datetime.now(timezone.utc).isoformat()
        extras = extras or {}

        experience = experience_repository.get_by_uuid(
            db, experience_uuid, include_deleted=True
        )

        errors: list[PublishValidationIssue] = []
        warnings: list[PublishValidationIssue] = []

        # --- Draft existence / status ---
        draft_errors = self._validate_draft(experience, experience_uuid, stage=stage)
        errors.extend(draft_errors)

        photo_count = 0
        template_slug: str | None = None

        if experience is not None and not draft_errors:
            template_slug = (experience.template_slug or "").strip() or None
            field_errors, field_warnings = self._validate_required_fields(experience, stage)
            errors.extend(field_errors)
            warnings.extend(field_warnings)

            media_errors, media_warnings, photo_count = self._validate_media(experience)
            errors.extend(media_errors)
            warnings.extend(media_warnings)

            data_errors, data_warnings = self._validate_experience_data(experience)
            errors.extend(data_errors)
            warnings.extend(data_warnings)

            soft_warnings = self._collect_soft_warnings(experience, extras)
            warnings.extend(soft_warnings)

            # Template-specific extensions
            slug_key = (template_slug or "").lower()
            for rule in _TEMPLATE_RULES.get(slug_key, []):
                try:
                    rule_errors, rule_warnings = rule(experience, extras, stage)
                    errors.extend(rule_errors)
                    warnings.extend(rule_warnings)
                except Exception:  # noqa: BLE001 — never fail core validation on bad rule
                    logger.exception(
                        "Template validation rule failed",
                        extra={"template": slug_key, "experience_uuid": str(experience_uuid)},
                    )

        valid = len(errors) == 0

        if valid and experience is not None and transition:
            # Normalize unpaid funnel states so checkout / Create This Experience
            # can continue after a cancelled or abandoned payment attempt.
            if experience.status in {
                ExperienceStatus.DRAFT,
                ExperienceStatus.PREVIEW_READY,
                ExperienceStatus.CHECKOUT_STARTED,
                ExperienceStatus.PAYMENT_PENDING,
                ExperienceStatus.PENDING_PAYMENT,
                ExperienceStatus.FAILED,
            }:
                experience.status = ExperienceStatus.READY_FOR_PAYMENT
                experience_repository.save(db, experience)
                db.commit()
                experience_repository.refresh(db, experience)

        summary = PublishValidationSummary(
            photos=photo_count,
            template=template_slug,
            readyForPublish=valid,
        )

        response = PublishValidationResponse(
            valid=valid,
            errors=errors,
            warnings=warnings,
            summary=summary,
        )

        if valid:
            logger.info(
                "Publish validation success experience_uuid=%s stage=%s template=%s photos=%s timestamp=%s",
                experience_uuid,
                stage,
                template_slug,
                photo_count,
                timestamp,
            )
        else:
            logger.warning(
                "Publish validation failure experience_uuid=%s stage=%s errors=%s timestamp=%s",
                experience_uuid,
                stage,
                [{"field": e.field, "message": e.message} for e in errors],
                timestamp,
            )

        return response

    def _validate_draft(
        self,
        experience: Experience | None,
        experience_uuid: UUID,
        *,
        stage: PublishStage = "pre_publish",
    ) -> list[PublishValidationIssue]:
        if experience is None:
            return [
                _issue(
                    "experience.uuid",
                    "Draft experience was not found.",
                    "draft_not_found",
                )
            ]

        errors: list[PublishValidationIssue] = []
        if experience.deleted_at is not None or experience.status == ExperienceStatus.ARCHIVED:
            errors.append(
                _issue(
                    "experience.status",
                    "This experience is archived and cannot be published.",
                    "archived",
                )
            )

        # pre_publish / pre_payment both open the checkout path — allow unpaid
        # payment-funnel statuses (e.g. payment_pending after create-order).
        allowed = {
            ExperienceStatus.DRAFT,
            ExperienceStatus.PREVIEW_READY,
            ExperienceStatus.CHECKOUT_STARTED,
            ExperienceStatus.READY_FOR_PAYMENT,
            ExperienceStatus.PAYMENT_PENDING,
            ExperienceStatus.PENDING_PAYMENT,
            ExperienceStatus.FAILED,
        }
        if experience.status not in allowed and experience.status != ExperienceStatus.ARCHIVED:
            stage_hint = (
                "draft, ready_for_payment, or payment_pending"
                if stage in {"pre_publish", "pre_payment"}
                else "draft or ready_for_payment"
            )
            errors.append(
                _issue(
                    "experience.status",
                    f"Experience status must be {stage_hint} (got {experience.status.value}).",
                    "invalid_status",
                )
            )

        if experience.uuid != experience_uuid:
            errors.append(
                _issue("experience.uuid", "Experience UUID mismatch.", "uuid_mismatch")
            )

        return errors

    def _validate_required_fields(
        self,
        experience: Experience,
        stage: PublishStage,
    ) -> tuple[list[PublishValidationIssue], list[PublishValidationIssue]]:
        errors: list[PublishValidationIssue] = []
        warnings: list[PublishValidationIssue] = []
        canonical = _canonical(experience)
        general = _as_dict(_as_dict(experience.experience_data).get("general"))
        creator = _as_dict(canonical.get("creator"))
        recipient = _as_dict(canonical.get("recipient"))
        content = _as_dict(canonical.get("content"))

        template = (
            (experience.template_slug or "").strip()
            or str(canonical.get("templateId") or "").strip()
        )
        if not template:
            errors.append(_issue("template", "Template is required.", "required_template"))

        occasion = (
            (experience.occasion or "").strip()
            or str(canonical.get("occasion") or "").strip()
        )
        if not occasion:
            errors.append(_issue("occasion", "Occasion is required.", "required_occasion"))

        relationship = (
            (experience.relationship or "").strip()
            or str(canonical.get("relationship") or "").strip()
        )
        # Relationship is applicable for all current Chronivs templates.
        if not relationship:
            errors.append(
                _issue(
                    "relationship",
                    "Relationship is required.",
                    "required_relationship",
                )
            )

        recipient_name = (
            str(recipient.get("name") or "").strip()
            or str(general.get("receiver_name") or "").strip()
        )
        if not recipient_name:
            errors.append(
                _issue(
                    "recipient.name",
                    "Recipient name is required.",
                    "required_recipient",
                )
            )

        title = (
            (experience.title or "").strip()
            or str(content.get("title") or "").strip()
            or str(general.get("experience_title") or "").strip()
            or str(content.get("letter") or "").strip()
        )
        if not title:
            errors.append(
                _issue(
                    "content.title",
                    "Experience title is required.",
                    "required_title",
                )
            )

        email = (
            (experience.customer_email or "").strip()
            or str(creator.get("email") or "").strip()
        )
        phone = (
            (experience.customer_mobile or "").strip()
            or str(creator.get("phone") or "").strip()
        )

        contact_email_issue = _issue(
            "creator.email",
            "Creator email is required.",
            "required_creator_email",
        )
        contact_phone_issue = _issue(
            "creator.phone",
            "Creator phone is required.",
            "required_creator_phone",
        )

        # Contact is collected in checkout — warn at pre_publish, block at pre_payment.
        if not email:
            if stage == "pre_payment":
                errors.append(contact_email_issue)
            else:
                warnings.append(contact_email_issue)
        if not phone:
            if stage == "pre_payment":
                errors.append(contact_phone_issue)
            else:
                warnings.append(contact_phone_issue)

        return errors, warnings

    def _validate_media(
        self,
        experience: Experience,
    ) -> tuple[list[PublishValidationIssue], list[PublishValidationIssue], int]:
        errors: list[PublishValidationIssue] = []
        warnings: list[PublishValidationIssue] = []

        data = _as_dict(experience.experience_data)
        metadata = _as_dict(data.get("metadata"))
        notes = _as_dict(metadata.get("notes"))
        gallery_urls = notes.get("gallery_urls")
        urls: list[str] = []
        if isinstance(gallery_urls, list):
            urls = [str(u).strip() for u in gallery_urls if u]

        canonical = _canonical(experience)
        media = _as_dict(canonical.get("media"))
        gallery = media.get("gallery")
        if isinstance(gallery, list) and gallery:
            urls = []
            for item in gallery:
                if isinstance(item, dict) and item.get("url"):
                    urls.append(str(item["url"]).strip())

        # ORM media rows (photos)
        orm_photos = [
            m
            for m in (experience.media or [])
            if m.media_type in {MediaType.PHOTO, MediaType.COVER}
        ]

        pending = [
            m
            for m in orm_photos
            if m.upload_status
            in {MediaUploadStatus.PENDING, MediaUploadStatus.PLACEHOLDER}
        ]
        failed = [m for m in orm_photos if m.upload_status == MediaUploadStatus.FAILED]

        if pending:
            errors.append(
                _issue(
                    "media.gallery",
                    "Some photos are still uploading. Wait for uploads to finish.",
                    "pending_uploads",
                )
            )
        if failed:
            warnings.append(
                _issue(
                    "media.gallery",
                    "Some photos failed to upload and will be omitted. "
                    "You can continue without them.",
                    "failed_uploads",
                )
            )

        valid_urls = [u for u in urls if _cloudinary_url(u)]
        invalid_urls = [u for u in urls if u and not _cloudinary_url(u)]
        if invalid_urls:
            errors.append(
                _issue(
                    "media.gallery",
                    "All photos must have valid storage URLs.",
                    "invalid_cloudinary_url",
                )
            )

        # Prefer ORM uploaded count when linked; else canonical URLs
        uploaded_orm = [
            m
            for m in orm_photos
            if m.upload_status == MediaUploadStatus.UPLOADED
            and _cloudinary_url(m.secure_url or m.file_url)
        ]
        photo_count = max(len(uploaded_orm), len(valid_urls))

        min_photos = MIN_PHOTOS_DEFAULT
        if photo_count < min_photos:
            errors.append(
                _issue(
                    "media.gallery",
                    f"Add at least {min_photos} uploaded photo before publishing.",
                    "required_photos",
                )
            )

        return errors, warnings, photo_count

    def _validate_experience_data(
        self,
        experience: Experience,
    ) -> tuple[list[PublishValidationIssue], list[PublishValidationIssue]]:
        errors: list[PublishValidationIssue] = []
        warnings: list[PublishValidationIssue] = []

        raw = experience.experience_data
        if raw is None:
            errors.append(
                _issue(
                    "experience_data",
                    "Experience data is missing.",
                    "missing_experience_data",
                )
            )
            return errors, warnings

        data = _as_dict(raw)
        if not data:
            errors.append(
                _issue(
                    "experience_data",
                    "Experience data must be a valid JSON object.",
                    "invalid_json_structure",
                )
            )
            return errors, warnings

        missing_sections = [s for s in EXPERIENCE_DATA_SECTIONS if s not in data]
        if missing_sections:
            errors.append(
                _issue(
                    "experience_data.sections",
                    f"Missing required sections: {', '.join(missing_sections)}.",
                    "missing_sections",
                )
            )

        for section in ("general", "gallery", "metadata"):
            if section in data and not isinstance(data.get(section), dict):
                errors.append(
                    _issue(
                        f"experience_data.{section}",
                        f"Section '{section}' must be an object.",
                        "invalid_section_type",
                    )
                )

        # Schema format version lives in notes.schema_version only.
        # Do NOT treat canonical.metadata.version as schema — that field is a
        # document revision counter incremented by autosave.
        metadata = _as_dict(data.get("metadata"))
        notes = _as_dict(metadata.get("notes"))
        schema_version = notes.get("schema_version")

        if schema_version is None:
            # Sectioned payload without explicit version is treated as current.
            schema_version = EXPECTED_SCHEMA_VERSION
            warnings.append(
                _issue(
                    "experience_data.schema_version",
                    "Schema version was not set; assuming current version.",
                    "schema_version_assumed",
                )
            )
        else:
            try:
                version_int = int(schema_version)
            except (TypeError, ValueError):
                errors.append(
                    _issue(
                        "experience_data.schema_version",
                        "Schema version is invalid.",
                        "invalid_schema_version",
                    )
                )
                version_int = -1
            if version_int != -1 and version_int != EXPECTED_SCHEMA_VERSION:
                errors.append(
                    _issue(
                        "experience_data.schema_version",
                        f"Schema version must be {EXPECTED_SCHEMA_VERSION}.",
                        "schema_version_mismatch",
                    )
                )

        return errors, warnings

    def _collect_soft_warnings(
        self,
        experience: Experience,
        extras: dict[str, Any],
    ) -> list[PublishValidationIssue]:
        warnings: list[PublishValidationIssue] = []
        data = _as_dict(experience.experience_data)
        music = _as_dict(data.get("music"))
        notes = _as_dict(_as_dict(data.get("metadata")).get("notes"))
        canonical = _canonical(experience)
        media = _as_dict(canonical.get("media"))
        music_canonical = _as_dict(media.get("music"))

        has_music = bool(
            music.get("media_uuid")
            or music.get("title")
            or music_canonical.get("url")
            or notes.get("music_url")
        )
        if not has_music:
            warnings.append(
                _issue(
                    "media.music",
                    "Background music not selected.",
                    "missing_music",
                )
            )

        gift_message = extras.get("gift_message")
        if gift_message is not None and not str(gift_message).strip():
            warnings.append(
                _issue(
                    "giftMessage",
                    "Gift message is empty.",
                    "empty_gift_message",
                )
            )

        general = _as_dict(data.get("general"))
        letter = _as_dict(data.get("letter"))
        content = _as_dict(canonical.get("content"))
        custom = (
            str(general.get("custom_message") or "").strip()
            or str(letter.get("body") or "").strip()
            or str(content.get("letter") or "").strip()
        )
        if not custom:
            warnings.append(
                _issue(
                    "content.letter",
                    "Personal message is empty.",
                    "empty_message",
                )
            )

        return warnings


publish_validator = PublishValidator()
