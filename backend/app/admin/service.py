"""Admin authentication and dashboard aggregation services."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import desc, func, select, text
from sqlalchemy.orm import Session

from app.admin.schemas import (
    AdminDashboardResponse,
    AdminKpiMetrics,
    AdminRecentExperienceItem,
    AdminRecentOrderItem,
    AdminSessionResponse,
    AdminSystemStatusItem,
    AdminUserResponse,
)
from app.admin.session import create_admin_session_token
from app.auth.security import verify_password
from app.common.enums import CheckoutStatus, PaymentStatus
from app.common.exceptions import UnauthorizedException, ValidationException
from app.core.config import settings
from app.models.checkout_session import CheckoutSession
from app.models.experience import Experience
from app.models.payment import Payment
from app.models.published_experience import PublishedExperience

_SUCCESS_PAYMENT = {PaymentStatus.SUCCESS, PaymentStatus.PAID}
_PENDING_PAYMENT = {PaymentStatus.CREATED, PaymentStatus.PENDING}
_COMPLETED_CHECKOUT = {CheckoutStatus.COMPLETED}
_PENDING_CHECKOUT = {CheckoutStatus.READY_FOR_PAYMENT, CheckoutStatus.PENDING}


class AdminService:
    def assert_configured(self) -> None:
        if not settings.ADMIN_EMAIL.strip() or not settings.ADMIN_PASSWORD_HASH.strip():
            raise ValidationException(
                "Admin authentication is not configured on the server",
                code="admin_not_configured",
            )

    def login(self, email: str, password: str) -> tuple[AdminSessionResponse, str, int]:
        self.assert_configured()
        normalized_email = email.lower().strip()
        if normalized_email != settings.ADMIN_EMAIL.strip().lower():
            raise UnauthorizedException("Invalid credentials")
        if not verify_password(password, settings.ADMIN_PASSWORD_HASH):
            raise UnauthorizedException("Invalid credentials")

        token, expires_at = create_admin_session_token(normalized_email)
        response = AdminSessionResponse(
            user=AdminUserResponse(email=normalized_email, name="Chronivs Admin"),
            expires_at=expires_at,
        )
        max_age = settings.ADMIN_SESSION_EXPIRE_HOURS * 3600
        return response, token, max_age

    def get_session(self, email: str, expires_at: datetime | None = None) -> AdminSessionResponse:
        return AdminSessionResponse(
            user=AdminUserResponse(email=email, name="Chronivs Admin"),
            expires_at=expires_at,
        )

    def get_dashboard(self, db: Session) -> AdminDashboardResponse:
        system_status = self._build_system_status(db)

        if not settings.DATABASE_URL.strip():
            return AdminDashboardResponse(
                available=False,
                message="No data available",
                system_status=system_status,
            )

        try:
            kpis = self._load_kpis(db)
            recent_orders = self._load_recent_orders(db)
            recent_experiences = self._load_recent_experiences(db)
        except Exception:
            return AdminDashboardResponse(
                available=False,
                message="No data available",
                system_status=system_status,
            )

        return AdminDashboardResponse(
            available=True,
            kpis=kpis,
            recent_orders=recent_orders,
            recent_experiences=recent_experiences,
            system_status=system_status,
        )

    def _load_kpis(self, db: Session) -> AdminKpiMetrics:
        total_orders = db.scalar(select(func.count()).select_from(CheckoutSession)) or 0

        completed_orders = db.scalar(
            select(func.count())
            .select_from(CheckoutSession)
            .where(CheckoutSession.status.in_(_COMPLETED_CHECKOUT))
        ) or 0

        pending_orders = db.scalar(
            select(func.count())
            .select_from(CheckoutSession)
            .where(CheckoutSession.status.in_(_PENDING_CHECKOUT))
        ) or 0

        revenue = db.scalar(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                Payment.status.in_(_SUCCESS_PAYMENT)
            )
        ) or Decimal("0.00")

        customers = db.scalar(
            select(func.count(func.distinct(CheckoutSession.email))).select_from(CheckoutSession)
        ) or 0

        published_experiences = db.scalar(
            select(func.count())
            .select_from(PublishedExperience)
            .where(PublishedExperience.is_active.is_(True))
        ) or 0

        return AdminKpiMetrics(
            total_orders=int(total_orders),
            completed_orders=int(completed_orders),
            pending_orders=int(pending_orders),
            revenue=Decimal(revenue),
            customers=int(customers),
            published_experiences=int(published_experiences),
        )

    def _load_recent_orders(self, db: Session) -> list[AdminRecentOrderItem]:
        rows = db.execute(
            select(CheckoutSession, Experience, Payment)
            .join(Experience, Experience.uuid == CheckoutSession.experience_uuid)
            .outerjoin(Payment, Payment.experience_id == Experience.id)
            .order_by(desc(CheckoutSession.created_at))
            .limit(10)
        ).all()

        items: list[AdminRecentOrderItem] = []
        for checkout, _experience, payment in rows:
            payment_status = payment.status.value if payment else "unpaid"
            items.append(
                AdminRecentOrderItem(
                    order_id=str(checkout.uuid),
                    customer=checkout.customer_name,
                    customer_email=checkout.email,
                    occasion=checkout.occasion,
                    template=checkout.template_name,
                    amount=checkout.total,
                    currency=checkout.currency,
                    payment_status=payment_status,
                    checkout_status=checkout.status.value,
                    created_at=checkout.created_at,
                )
            )
        return items

    def _load_recent_experiences(self, db: Session) -> list[AdminRecentExperienceItem]:
        rows = db.execute(
            select(PublishedExperience, Experience)
            .join(Experience, Experience.id == PublishedExperience.experience_id)
            .order_by(desc(PublishedExperience.created_at))
            .limit(10)
        ).all()

        items: list[AdminRecentExperienceItem] = []
        for published, experience in rows:
            name = experience.title or experience.template_name or published.template_id or "Experience"
            customer = experience.customer_name or published.published_by
            items.append(
                AdminRecentExperienceItem(
                    id=str(published.public_uuid),
                    name=name,
                    customer=customer,
                    published=published.status == "published" and published.is_active,
                    published_at=published.published_at,
                    created_at=published.created_at,
                    public_url=published.public_url,
                )
            )
        return items

    def _build_system_status(self, db: Session) -> list[AdminSystemStatusItem]:
        return [
            AdminSystemStatusItem(label="Database", status=self._database_status(db)),
            AdminSystemStatusItem(label="Cloudinary", status=self._cloudinary_status()),
            AdminSystemStatusItem(label="API", status="operational"),
            AdminSystemStatusItem(label="Email", status=self._email_status()),
            AdminSystemStatusItem(label="Payment", status=self._payment_status()),
        ]

    def _database_status(self, db: Session) -> str:
        if not settings.DATABASE_URL.strip():
            return "unavailable"
        try:
            db.execute(text("SELECT 1"))
            return "operational"
        except Exception:
            return "unavailable"

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


admin_service = AdminService()
