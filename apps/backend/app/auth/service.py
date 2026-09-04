"""Authentication business logic for local email/password (OAuth-ready facade)."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.schemas import (
    AuthLoginResponse,
    AuthRegisterResponse,
    AuthUserResponse,
    LoginRequest,
    RegisterRequest,
    TokenPairResponse,
)
from app.auth.security import hash_password, verify_password
from app.auth.tokens import (
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.common.exceptions import ConflictException, UnauthorizedException
from app.common.utils import utc_now
from app.models.token_blacklist import TokenBlacklist
from app.models.user import User


class AuthService:
    """Local authentication service with hooks for future providers."""

    PROVIDER_LOCAL = "local"

    def register(self, db: Session, payload: RegisterRequest) -> AuthRegisterResponse:
        email = payload.email.lower().strip()
        existing = db.scalars(select(User).where(User.email == email)).first()
        if existing is not None:
            raise ConflictException("An account with this email already exists")

        user = User(
            name=payload.name,
            email=email,
            password_hash=hash_password(payload.password),
            provider=self.PROVIDER_LOCAL,
            is_verified=False,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return AuthRegisterResponse(user=AuthUserResponse.model_validate(user))

    def login(self, db: Session, payload: LoginRequest) -> AuthLoginResponse:
        email = payload.email.lower().strip()
        user = db.scalars(select(User).where(User.email == email)).first()
        if user is None or not user.password_hash:
            raise UnauthorizedException("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedException("Account is inactive")
        if not verify_password(payload.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        user.last_login = utc_now()
        db.add(user)
        db.commit()
        db.refresh(user)

        access_token = create_access_token(str(user.uuid))
        refresh_token, _, _ = create_refresh_token(str(user.uuid))
        return AuthLoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=AuthUserResponse.model_validate(user),
        )

    def refresh(self, db: Session, refresh_token: str) -> TokenPairResponse:
        payload = verify_token(refresh_token, expected_type="refresh")
        jti = str(payload["jti"])
        if self._is_blacklisted(db, jti):
            raise UnauthorizedException("Token has been revoked")

        user = self._get_user_by_uuid(db, UUID(str(payload["sub"])))
        if not user.is_active:
            raise UnauthorizedException("Account is inactive")

        # Rotate: revoke old refresh token, issue a new pair.
        self._blacklist_token(
            db,
            jti=jti,
            token_type="refresh",
            expires_at=payload.get("exp"),
        )
        access_token = create_access_token(str(user.uuid))
        new_refresh, _, _ = create_refresh_token(str(user.uuid))
        return TokenPairResponse(access_token=access_token, refresh_token=new_refresh)

    def logout(self, db: Session, *, refresh_token: str | None) -> None:
        if not refresh_token:
            return
        try:
            payload = verify_token(refresh_token, expected_type="refresh")
        except UnauthorizedException:
            # Idempotent logout — ignore already-invalid tokens.
            return
        self._blacklist_token(
            db,
            jti=str(payload["jti"]),
            token_type="refresh",
            expires_at=payload.get("exp"),
        )

    def get_user_by_uuid(self, db: Session, user_uuid: UUID) -> User:
        return self._get_user_by_uuid(db, user_uuid)

    def _get_user_by_uuid(self, db: Session, user_uuid: UUID) -> User:
        user = db.scalars(select(User).where(User.uuid == user_uuid)).first()
        if user is None:
            raise UnauthorizedException("User not found")
        return user

    def _is_blacklisted(self, db: Session, jti: str) -> bool:
        row = db.scalars(select(TokenBlacklist).where(TokenBlacklist.jti == jti)).first()
        return row is not None

    def _blacklist_token(
        self,
        db: Session,
        *,
        jti: str,
        token_type: str,
        expires_at: object,
    ) -> None:
        if self._is_blacklisted(db, jti):
            return

        from datetime import datetime, timezone

        if isinstance(expires_at, (int, float)):
            exp_dt = datetime.fromtimestamp(float(expires_at), tz=timezone.utc)
        elif isinstance(expires_at, datetime):
            exp_dt = expires_at if expires_at.tzinfo else expires_at.replace(tzinfo=timezone.utc)
        else:
            exp_dt = utc_now()

        db.add(
            TokenBlacklist(
                jti=jti,
                token_type=token_type,
                expires_at=exp_dt,
            )
        )
        db.commit()


auth_service = AuthService()
