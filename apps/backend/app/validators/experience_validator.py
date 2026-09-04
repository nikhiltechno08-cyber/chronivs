"""Experience validation rules (create / update / sections)."""

from __future__ import annotations

import re

from app.common.enums import ExperienceStatus
from app.common.exceptions import ValidationException
from app.schemas.experience import ExperienceCreateRequest, ExperienceUpdateRequest
from app.schemas.experience_data import EXPERIENCE_DATA_SECTIONS, ExperienceData

_INDIAN_MOBILE = re.compile(r"^[6-9]\d{9}$")
_SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class ExperienceValidator:
    def validate_create(self, payload: ExperienceCreateRequest) -> None:
        if payload.customer_name is not None and len(payload.customer_name.strip()) < 2:
            raise ValidationException("Customer name must be at least 2 characters")
        if payload.customer_mobile:
            self._validate_mobile(payload.customer_mobile)
        if payload.template_slug:
            self._validate_slug(payload.template_slug)
        if payload.experience_data is not None:
            self.validate_data(payload.experience_data)
        if payload.status == ExperienceStatus.PUBLISHED:
            raise ValidationException("Cannot create an experience already published")

    def validate_update(self, payload: ExperienceUpdateRequest) -> None:
        if payload.customer_name is not None and len(payload.customer_name.strip()) < 2:
            raise ValidationException("Customer name must be at least 2 characters")
        if payload.customer_mobile is not None:
            self._validate_mobile(payload.customer_mobile)
        if payload.template_slug is not None:
            self._validate_slug(payload.template_slug)
        if payload.experience_data is not None:
            self.validate_data(payload.experience_data)

    def validate_data(self, data: ExperienceData) -> None:
        # Structural validation is handled by Pydantic; keep hook for future rules.
        _ = data

    def validate_section(self, section: str) -> None:
        if section not in EXPERIENCE_DATA_SECTIONS:
            raise ValidationException(
                f"Unknown experience data section: {section}",
                details={"allowed": list(EXPERIENCE_DATA_SECTIONS)},
            )

    def _validate_mobile(self, mobile: str) -> None:
        digits = re.sub(r"\D", "", mobile)
        if digits.startswith("91") and len(digits) == 12:
            digits = digits[2:]
        if not _INDIAN_MOBILE.match(digits):
            raise ValidationException("Enter a valid 10-digit Indian mobile number")

    def _validate_slug(self, slug: str) -> None:
        if not _SLUG.match(slug):
            raise ValidationException(
                "template_slug must be lowercase kebab-case (e.g. birthday-girlfriend)",
            )


experience_validator = ExperienceValidator()
