"""Reusable exception classes for Chronivs backend (no business logic)."""

from typing import Any


class ChronivsException(Exception):
    """Base application exception."""

    def __init__(
        self,
        message: str = "An unexpected error occurred",
        *,
        code: str = "chronivs_error",
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message
        self.code = code
        self.details = details
        super().__init__(message)


class NotFoundException(ChronivsException):
    """Raised when a requested resource does not exist."""

    def __init__(
        self,
        message: str = "Resource not found",
        *,
        code: str = "not_found",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, code=code, details=details)


class UnauthorizedException(ChronivsException):
    """Raised when authentication or authorization fails."""

    def __init__(
        self,
        message: str = "Unauthorized",
        *,
        code: str = "unauthorized",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, code=code, details=details)


class ValidationException(ChronivsException):
    """Raised when input validation fails."""

    def __init__(
        self,
        message: str = "Validation failed",
        *,
        code: str = "validation_error",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, code=code, details=details)


class ConflictException(ChronivsException):
    """Raised when a request conflicts with current resource state."""

    def __init__(
        self,
        message: str = "Conflict",
        *,
        code: str = "conflict",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, code=code, details=details)


class PaymentException(ChronivsException):
    """Raised for payment-related failures."""

    def __init__(
        self,
        message: str = "Payment error",
        *,
        code: str = "payment_error",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, code=code, details=details)


class MediaException(ChronivsException):
    """Raised for media upload or processing failures."""

    def __init__(
        self,
        message: str = "Media error",
        *,
        code: str = "media_error",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, code=code, details=details)
