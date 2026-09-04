"""Admin session cookie helpers."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import jwt

from app.common.exceptions import UnauthorizedException
from app.core.config import settings

ADMIN_TOKEN_TYPE = "admin_session"


def _ensure_secret() -> str:
    if not settings.SECRET_KEY.strip():
        raise RuntimeError("SECRET_KEY is not configured in environment")
    return settings.SECRET_KEY.strip()


def create_admin_session_token(email: str) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=settings.ADMIN_SESSION_EXPIRE_HOURS)
    payload = {
        "sub": email.lower().strip(),
        "type": ADMIN_TOKEN_TYPE,
        "iat": now,
        "exp": expires_at,
    }
    token = jwt.encode(payload, _ensure_secret(), algorithm=settings.ALGORITHM)
    return token, expires_at


def get_admin_session_expiry(token: str) -> datetime | None:
    try:
        payload = jwt.decode(token, _ensure_secret(), algorithms=[settings.ALGORITHM])
    except Exception:
        return None

    if payload.get("type") != ADMIN_TOKEN_TYPE:
        return None

    exp = payload.get("exp")
    if isinstance(exp, (int, float)):
        return datetime.fromtimestamp(exp, tz=timezone.utc)
    return None


def verify_admin_session_token(token: str) -> str:
    try:
        payload = jwt.decode(token, _ensure_secret(), algorithms=[settings.ALGORITHM])
    except Exception as exc:
        raise UnauthorizedException("Invalid or expired admin session") from exc

    if payload.get("type") != ADMIN_TOKEN_TYPE:
        raise UnauthorizedException("Invalid admin session")
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject.strip():
        raise UnauthorizedException("Invalid admin session subject")
    return subject.strip().lower()
