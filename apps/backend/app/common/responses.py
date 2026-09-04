"""Reusable API response models (Pydantic)."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class MessageResponse(BaseModel):
    """Simple message payload."""

    message: str


class SuccessResponse(BaseModel, Generic[T]):
    """Standard success envelope."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    success: bool = True
    message: str = "ok"
    data: T | None = None


class ErrorResponse(BaseModel):
    """Standard error envelope."""

    success: bool = False
    message: str
    code: str | None = None
    details: dict[str, Any] | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list envelope."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    success: bool = True
    items: list[T] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
    pages: int = 0


class HealthResponse(BaseModel):
    """Health-check payload shape for future typed endpoints."""

    status: str
    service: str
