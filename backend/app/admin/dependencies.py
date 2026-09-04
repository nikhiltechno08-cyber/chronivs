"""Admin route dependencies."""

from __future__ import annotations

from typing import Annotated

from fastapi import Cookie, Depends

from app.admin.session import verify_admin_session_token
from app.common.exceptions import UnauthorizedException
from app.core.config import settings

ADMIN_COOKIE = settings.ADMIN_SESSION_COOKIE_NAME


def get_current_admin_email(
    session_token: Annotated[str | None, Cookie(alias=ADMIN_COOKIE)] = None,
) -> str:
    if not session_token:
        raise UnauthorizedException("Not authenticated")
    return verify_admin_session_token(session_token)


CurrentAdmin = Annotated[str, Depends(get_current_admin_email)]
