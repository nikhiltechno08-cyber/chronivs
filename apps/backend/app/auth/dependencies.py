"""Reusable FastAPI auth dependencies for protecting future routes."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.service import auth_service
from app.auth.tokens import verify_token
from app.common.exceptions import UnauthorizedException
from app.database.session import get_db
from app.models.user import User

http_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(http_bearer)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    Verify Bearer access JWT and load the corresponding user.

    Rejects missing, invalid, expired, or wrong-type tokens.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise UnauthorizedException("Not authenticated")

    payload = verify_token(credentials.credentials, expected_type="access")
    try:
        user_uuid = UUID(str(payload["sub"]))
    except (TypeError, ValueError) as exc:
        raise UnauthorizedException("Invalid token subject") from exc

    user = auth_service.get_user_by_uuid(db, user_uuid)
    if not user.is_active:
        raise UnauthorizedException("Account is inactive")
    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Alias for readability on secured routes (active check already applied)."""
    return current_user


CurrentUser = Annotated[User, Depends(get_current_user)]
ActiveUser = Annotated[User, Depends(get_current_active_user)]
