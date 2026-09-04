"""Authentication HTTP endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import CurrentUser
from app.auth.schemas import (
    AuthLoginResponse,
    AuthMessageResponse,
    AuthRegisterResponse,
    AuthUserResponse,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPairResponse,
)
from app.auth.service import auth_service
from app.database.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/health")
def auth_health() -> dict[str, str]:
    """Lightweight auth module health check."""
    return {"status": "ok", "module": "auth"}


@router.post(
    "/register",
    response_model=AuthRegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AuthRegisterResponse:
    """Create a new local account."""
    return auth_service.register(db, payload)


@router.post("/login", response_model=AuthLoginResponse)
def login(
    payload: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AuthLoginResponse:
    """Authenticate with email/password and issue JWT tokens."""
    return auth_service.login(db, payload)


@router.post("/refresh", response_model=TokenPairResponse)
def refresh(
    payload: RefreshRequest,
    db: Annotated[Session, Depends(get_db)],
) -> TokenPairResponse:
    """Rotate refresh token and issue a new access/refresh pair."""
    return auth_service.refresh(db, payload.refresh_token)


@router.post("/logout", response_model=AuthMessageResponse)
def logout(
    payload: LogoutRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AuthMessageResponse:
    """Revoke the provided refresh token (idempotent)."""
    auth_service.logout(db, refresh_token=payload.refresh_token)
    return AuthMessageResponse(message="Logged out successfully")


@router.get("/me", response_model=AuthUserResponse)
def me(current_user: CurrentUser) -> AuthUserResponse:
    """Return the authenticated user profile (protected)."""
    return AuthUserResponse.model_validate(current_user)
