"""Structured ExperienceData sections — independently editable, serializable."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ExperienceDataGeneral(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sender_name: str | None = None
    receiver_name: str | None = None
    special_date: str | None = None
    custom_message: str | None = None
    experience_title: str | None = None


class ExperienceDataHero(BaseModel):
    model_config = ConfigDict(extra="forbid")

    headline: str | None = None
    subheadline: str | None = None
    cover_media_uuid: str | None = None


class ExperienceDataTimelineItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = None
    title: str | None = None
    body: str | None = None
    date_label: str | None = None
    media_uuid: str | None = None
    order: int = 0


class ExperienceDataTimeline(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[ExperienceDataTimelineItem] = Field(default_factory=list)


class ExperienceDataLetter(BaseModel):
    model_config = ConfigDict(extra="forbid")

    body: str | None = None
    signature: str | None = None
    opened: bool = False


class ExperienceDataGalleryItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    media_uuid: str | None = None
    caption: str | None = None
    order: int = 0


class ExperienceDataGallery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[ExperienceDataGalleryItem] = Field(default_factory=list)


class ExperienceDataMusic(BaseModel):
    model_config = ConfigDict(extra="forbid")

    media_uuid: str | None = None
    title: str | None = None
    autoplay: bool = False


class ExperienceDataEnding(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str | None = None
    cta_label: str | None = None


class ExperienceDataMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    locale: str | None = "en-IN"
    currency: str | None = "INR"
    source: str | None = None
    notes: dict[str, Any] = Field(default_factory=dict)


class ExperienceDataTheme(BaseModel):
    model_config = ConfigDict(extra="forbid")

    accent: str | None = None
    mood: str | None = None
    palette: dict[str, str] = Field(default_factory=dict)


class ExperienceDataAnimations(BaseModel):
    model_config = ConfigDict(extra="forbid")

    reduced_motion: bool = False
    intensity: str | None = "standard"
    flags: dict[str, bool] = Field(default_factory=dict)


class ExperienceData(BaseModel):
    """
    Canonical structured payload for a Chronivs experience.

    Template + ExperienceData → runtime renderer (no HTML duplication).
    Each section is independently patchable for future autosave.
    """

    model_config = ConfigDict(extra="forbid")

    general: ExperienceDataGeneral = Field(default_factory=ExperienceDataGeneral)
    hero: ExperienceDataHero = Field(default_factory=ExperienceDataHero)
    timeline: ExperienceDataTimeline = Field(default_factory=ExperienceDataTimeline)
    letter: ExperienceDataLetter = Field(default_factory=ExperienceDataLetter)
    gallery: ExperienceDataGallery = Field(default_factory=ExperienceDataGallery)
    music: ExperienceDataMusic = Field(default_factory=ExperienceDataMusic)
    ending: ExperienceDataEnding = Field(default_factory=ExperienceDataEnding)
    metadata: ExperienceDataMetadata = Field(default_factory=ExperienceDataMetadata)
    theme: ExperienceDataTheme = Field(default_factory=ExperienceDataTheme)
    animations: ExperienceDataAnimations = Field(default_factory=ExperienceDataAnimations)

    def merge_section(self, section: str, payload: dict[str, Any]) -> ExperienceData:
        """Return a copy with one named section updated (autosave-ready)."""
        data = self.model_dump()
        if section not in data:
            raise KeyError(f"Unknown experience data section: {section}")
        current = data[section] if isinstance(data[section], dict) else {}
        current.update(payload)
        data[section] = current
        return ExperienceData.model_validate(data)


EXPERIENCE_DATA_SECTIONS = (
    "general",
    "hero",
    "timeline",
    "letter",
    "gallery",
    "music",
    "ending",
    "metadata",
    "theme",
    "animations",
)
