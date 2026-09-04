"""JWT create / decode / verify helpers for access and refresh tokens."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Literal
from uuid import uuid4

from jose import JWTError, jwt

from app.common.exceptions import UnauthorizedException
from app.core.config import settings

TokenType = Literal["access", "refresh"]


def _ensure_secret() -> str:
    if not settings.SECRET_KEY:
        raise RuntimeError("SECRET_KEY is not configured in environment")
    return settings.SECRET_KEY


def create_token(
    *,
    subject: str,
    token_type: TokenType,
    expires_delta: timedelta,
    extra_claims: dict[str, Any] | None = None,
) -> tuple[str, str, datetime]:
    """
    Create a signed JWT.

    Returns ``(token, jti, expires_at)``.
    """
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta
    jti = uuid4().hex
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "jti": jti,
        "iat": now,
        "exp": expires_at,
    }
    if extra_claims:
        payload.update(extra_claims)
    token = jwt.encode(payload, _ensure_secret(), algorithm=settings.ALGORITHM)
    return token, jti, expires_at


def create_access_token(subject: str, *, extra_claims: dict[str, Any] | None = None) -> str:
    """Create a short-lived access token."""
    token, _, _ = create_token(
        subject=subject,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims=extra_claims,
    )
    return token


def create_refresh_token(subject: str) -> tuple[str, str, datetime]:
    """Create a longer-lived refresh token. Returns token, jti, expires_at."""
    return create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT signature / expiry. Raises UnauthorizedException."""
    try:
        return jwt.decode(token, _ensure_secret(), algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise UnauthorizedException("Invalid or expired token") from exc


def verify_token(token: str, *, expected_type: TokenType) -> dict[str, Any]:
    """Decode a token and ensure it matches the expected type."""
    payload = decode_token(token)
    token_type = payload.get("type")
    if token_type != expected_type:
        raise UnauthorizedException("Invalid token type")
    if not payload.get("sub"):
        raise UnauthorizedException("Invalid token subject")
    if not payload.get("jti"):
        raise UnauthorizedException("Invalid token identifier")
    return payload
