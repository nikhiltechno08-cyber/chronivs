"""Map between Experience ORM, structured ExperienceData, and API schemas."""

from __future__ import annotations

from typing import Any
from uuid import UUID, uuid4

from app.common.enums import ExperienceStatus
from app.models.experience import Experience
from app.schemas.experience import ExperienceCreateRequest, ExperienceResponse, ExperienceUpdateRequest
from app.schemas.experience_data import ExperienceData


class ExperienceMapper:
    def empty_data(self) -> ExperienceData:
        return ExperienceData()

    def parse_data(self, raw: dict[str, Any] | ExperienceData | None) -> ExperienceData:
        if raw is None:
            return self.empty_data()
        if isinstance(raw, ExperienceData):
            return raw
        return ExperienceData.model_validate(raw)

    def to_orm_dict(
        self,
        payload: ExperienceCreateRequest,
        *,
        user_id: int | None,
        experience_uuid: UUID | None = None,
    ) -> dict[str, Any]:
        data = self.parse_data(payload.experience_data)
        title = payload.title or data.general.experience_title
        return {
            "uuid": experience_uuid or payload.uuid or uuid4(),
            "user_id": user_id,
            "template_slug": payload.template_slug,
            "template_name": payload.template_name,
            "occasion": payload.occasion,
            "relationship": payload.relationship,
            "title": title,
            "customer_name": payload.customer_name,
            "customer_email": str(payload.customer_email).lower() if payload.customer_email else None,
            "customer_mobile": payload.customer_mobile,
            "status": payload.status or ExperienceStatus.DRAFT,
            "preview_version": 1,
            "published_version": None,
            "experience_data": data.model_dump(),
        }

    _IMMUTABLE_FIELDS = frozenset({"uuid", "id", "created_at", "user_id", "user_uuid"})

    def apply_update(self, experience: Experience, payload: ExperienceUpdateRequest) -> Experience:
        data = payload.model_dump(exclude_unset=True)
        # Never overwrite immutable identity / audit fields.
        for key in list(data.keys()):
            if key in self._IMMUTABLE_FIELDS:
                data.pop(key, None)

        if "experience_data" in data and data["experience_data"] is not None:
            parsed = self.parse_data(data.pop("experience_data"))
            # Bump nested canonical version when present (Phase 4.3 versioning).
            notes = dict(parsed.metadata.notes or {})
            canonical = notes.get("canonical")
            if isinstance(canonical, dict):
                meta = dict(canonical.get("metadata") or {})
                meta["version"] = int(meta.get("version") or 1) + 1
                meta["updatedAt"] = experience.updated_at.isoformat() if experience.updated_at else meta.get("updatedAt")
                canonical["metadata"] = meta
                if canonical.get("experienceId") in (None, ""):
                    canonical["experienceId"] = str(experience.uuid)
                notes["canonical"] = canonical
                parsed = parsed.model_copy(
                    update={"metadata": parsed.metadata.model_copy(update={"notes": notes})}
                )
            experience.experience_data = parsed.model_dump()

        if "customer_email" in data and data["customer_email"] is not None:
            data["customer_email"] = str(data["customer_email"]).lower()
        for field, value in data.items():
            if hasattr(experience, field):
                setattr(experience, field, value)
        return experience

    def to_response(self, experience: Experience) -> ExperienceResponse:
        user_uuid = experience.user.uuid if experience.user is not None else None
        return ExperienceResponse(
            uuid=experience.uuid,
            template_slug=experience.template_slug,
            template_name=experience.template_name,
            occasion=experience.occasion,
            relationship=experience.relationship,
            title=experience.title,
            customer_name=experience.customer_name,
            customer_email=experience.customer_email,
            customer_mobile=experience.customer_mobile,
            status=experience.status,
            preview_version=experience.preview_version,
            published_version=experience.published_version,
            experience_data=self.parse_data(experience.experience_data),
            published_at=experience.published_at,
            created_at=experience.created_at,
            updated_at=experience.updated_at,
            user_uuid=user_uuid,
        )


experience_mapper = ExperienceMapper()
