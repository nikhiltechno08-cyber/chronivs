"""
Serialize Experience ↔ JSON for backups, export/import, versioning, publishing.

Architecture only for autosave/version history — full undo stack comes later.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from app.mappers.experience_mapper import experience_mapper
from app.models.experience import Experience
from app.schemas.experience import ExperienceResponse
from app.schemas.experience_data import ExperienceData


class ExperienceSerializer:
    SCHEMA_VERSION = 1

    def to_dict(self, experience: Experience) -> dict[str, Any]:
        response = experience_mapper.to_response(experience)
        return {
            "schema_version": self.SCHEMA_VERSION,
            "experience": response.model_dump(mode="json"),
        }

    def to_jsonable(self, experience: Experience) -> dict[str, Any]:
        return self.to_dict(experience)

    def from_dict(self, payload: dict[str, Any]) -> ExperienceResponse:
        body = payload.get("experience", payload)
        return ExperienceResponse.model_validate(body)

    def data_to_dict(self, data: ExperienceData) -> dict[str, Any]:
        return data.model_dump(mode="json")

    def data_from_dict(self, payload: dict[str, Any]) -> ExperienceData:
        return ExperienceData.model_validate(payload)

    def snapshot_for_version(self, experience: Experience) -> dict[str, Any]:
        """Point-in-time snapshot for future version history / undo."""
        return {
            "schema_version": self.SCHEMA_VERSION,
            "uuid": str(experience.uuid),
            "preview_version": experience.preview_version,
            "published_version": experience.published_version,
            "status": experience.status.value,
            "experience_data": experience_mapper.parse_data(experience.experience_data).model_dump(
                mode="json",
            ),
            "captured_at": experience.updated_at.isoformat() if experience.updated_at else None,
        }

    def ensure_uuid(self, value: str | UUID) -> UUID:
        return value if isinstance(value, UUID) else UUID(str(value))


experience_serializer = ExperienceSerializer()
