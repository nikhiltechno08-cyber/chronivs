"""Schemas for pre-publish validation responses."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class PublishValidationIssue(BaseModel):
    field: str
    message: str
    code: str | None = None


class PublishValidationSummary(BaseModel):
    photos: int = 0
    template: str | None = None
    readyForPublish: bool = False


class PublishValidationResponse(BaseModel):
    valid: bool
    errors: list[PublishValidationIssue] = Field(default_factory=list)
    warnings: list[PublishValidationIssue] = Field(default_factory=list)
    summary: PublishValidationSummary = Field(default_factory=PublishValidationSummary)


class PublishValidationRequest(BaseModel):
    """
    Optional body for POST /experiences/{id}/validate.

    stage:
      - pre_publish: gate before checkout opens (default)
      - pre_payment: gate before payment (contact fields required)
    """

    stage: Literal["pre_publish", "pre_payment"] = "pre_publish"
    transition: bool = True
    # Optional client snapshot hints (e.g. gift message for warnings)
    extras: dict[str, Any] = Field(default_factory=dict)
