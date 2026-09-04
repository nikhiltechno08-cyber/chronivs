"""Admin settings aggregation — safe, non-secret configuration snapshot."""

from __future__ import annotations

from datetime import datetime, timezone

from jose import jwt
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.admin.schemas import (
    AdminSettingsAbout,
    AdminSettingsBackup,
    AdminSettingsCloudinary,
    AdminSettingsEmail,
    AdminSettingsGeneral,
    AdminSettingsMaintenance,
    AdminSettingsPayment,
    AdminSettingsResponse,
    AdminSettingsSecurity,
    AdminSystemStatusItem,
)
from app.admin.session import ADMIN_TOKEN_TYPE
from app.core.config import settings


def _status_label(configured: bool, *, ready_label: str = "Configured") -> str:
    return ready_label if configured else "Not configured"


def _connection_status(configured: bool, db_ok: bool = True) -> str:
    if not configured:
        return "unavailable"
    return "operational" if db_ok else "unavailable"


def _decode_session_issued_at(token: str | None) -> datetime | None:
    if not token or not settings.SECRET_KEY.strip():
        return None
    try:
        payload = jwt.decode(token.strip(), settings.SECRET_KEY.strip(), algorithms=[settings.ALGORITHM])
    except Exception:
        return None
    if payload.get("type") != ADMIN_TOKEN_TYPE:
        return None
    issued_at = payload.get("iat")
    if isinstance(issued_at, (int, float)):
        return datetime.fromtimestamp(issued_at, tz=timezone.utc)
    return None


class AdminSettingsService:
    def get_settings(
        self,
        db: Session,
        *,
        admin_email: str,
        session_token: str | None = None,
    ) -> AdminSettingsResponse:
        db_ok = self._database_ok(db)
        cloudinary_configured = not settings.cloudinary_missing()
        payment_provider = settings.payment_provider
        razorpay_configured = not settings.razorpay_missing()
        email_configured = not settings.resend_missing()
        session_started = _decode_session_issued_at(session_token)

        platform_name = settings.APP_NAME.replace(" API", "").strip() or "Chronivs"

        general = AdminSettingsGeneral(
            platform_name=platform_name,
            platform_version=settings.APP_VERSION,
            environment=settings.app_env,
        )

        cloudinary = AdminSettingsCloudinary(
            cloud_name=settings.cloud_name or None,
            upload_status=_status_label(cloudinary_configured, ready_label="Ready"),
            connection_status=_connection_status(cloudinary_configured, db_ok),
        )

        if payment_provider == "razorpay":
            gateway_connection = _connection_status(razorpay_configured, db_ok)
            webhook_status = "coming_soon" if razorpay_configured else "not_configured"
        else:
            gateway_connection = "operational" if db_ok else "unavailable"
            webhook_status = "not_applicable"

        payment = AdminSettingsPayment(
            current_gateway=payment_provider,
            mock_enabled=payment_provider == "mock",
            razorpay_ready=razorpay_configured,
            connection_status=gateway_connection,
            webhook_status=webhook_status,
        )

        email = AdminSettingsEmail(
            smtp_status=_status_label(email_configured, ready_label="Resend configured"),
            queue_status="Direct delivery" if email_configured else "Not available",
        )

        security = AdminSettingsSecurity(
            current_admin=admin_email,
            last_login=session_started,
            session_timeout_hours=settings.ADMIN_SESSION_EXPIRE_HOURS,
        )

        maintenance = AdminSettingsMaintenance(
            maintenance_mode=False,
            read_only_mode=False,
        )

        system_health = [
            AdminSystemStatusItem(label="API", status="operational"),
            AdminSystemStatusItem(label="Database", status=self._database_status(db)),
            AdminSystemStatusItem(label="Cloudinary", status=self._cloudinary_status()),
            AdminSystemStatusItem(label="Email", status=self._email_status()),
            AdminSystemStatusItem(label="Payment Gateway", status=self._payment_status()),
        ]

        backup = AdminSettingsBackup(
            future_features=[
                "Export Database",
                "Backup System",
            ]
        )

        about = AdminSettingsAbout(
            chronivs_version=settings.APP_VERSION,
            build_version=settings.APP_VERSION,
            deployment_environment=settings.app_env,
        )

        return AdminSettingsResponse(
            general=general,
            cloudinary=cloudinary,
            payment=payment,
            email=email,
            security=security,
            maintenance=maintenance,
            system_health=system_health,
            backup=backup,
            about=about,
        )

    def _database_ok(self, db: Session) -> bool:
        if not settings.DATABASE_URL.strip():
            return False
        try:
            db.execute(text("SELECT 1"))
            return True
        except Exception:
            return False

    def _database_status(self, db: Session) -> str:
        return "operational" if self._database_ok(db) else "unavailable"

    def _cloudinary_status(self) -> str:
        return "operational" if not settings.cloudinary_missing() else "unavailable"

    def _email_status(self) -> str:
        return "operational" if not settings.resend_missing() else "unavailable"

    def _payment_status(self) -> str:
        provider = settings.payment_provider
        if provider == "razorpay" and settings.razorpay_missing():
            return "unavailable"
        if provider not in {"mock", "razorpay"}:
            return "unavailable"
        return "operational"


admin_settings_service = AdminSettingsService()
