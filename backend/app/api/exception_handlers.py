"""Global exception handlers for ChronivsException subclasses."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.common.exceptions import (
    ChronivsException,
    ConflictException,
    MediaException,
    NotFoundException,
    PaymentException,
    UnauthorizedException,
    ValidationException,
)
from app.common.responses import ErrorResponse


def _status_for(exc: ChronivsException) -> int:
    if isinstance(exc, UnauthorizedException):
        return 401
    if isinstance(exc, NotFoundException):
        return 404
    if isinstance(exc, ConflictException):
        return 409
    if isinstance(exc, ValidationException):
        return 422
    if isinstance(exc, MediaException):
        return 400
    if isinstance(exc, PaymentException):
        # Misconfiguration should be actionable (not "Payment Required" 402).
        if exc.code == "razorpay_not_configured":
            return 503
        return 402
    return 400


def register_exception_handlers(app: FastAPI) -> None:
    """Attach Chronivs exception handlers to the FastAPI app."""

    @app.exception_handler(ChronivsException)
    async def chronivs_exception_handler(
        _request: Request,
        exc: ChronivsException,
    ) -> JSONResponse:
        body = ErrorResponse(
            success=False,
            message=exc.message,
            code=exc.code,
            details=exc.details,
        )
        return JSONResponse(
            status_code=_status_for(exc),
            content=body.model_dump(),
        )
