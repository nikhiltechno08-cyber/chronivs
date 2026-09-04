"""Admin HTTP routes."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, Query, Response
from sqlalchemy.orm import Session

from app.admin.dependencies import ADMIN_COOKIE, CurrentAdmin
from app.admin.analytics_service import admin_analytics_service
from app.admin.customers_service import admin_customers_service
from app.admin.experiences_service import admin_experiences_service
from app.admin.payments_service import admin_payments_service
from app.admin.orders_service import admin_orders_service
from app.admin.search_service import admin_search_service
from app.admin.schemas import (
    AdminCustomerDetailResponse,
    AdminCustomerListResponse,
    AdminDashboardResponse,
    AdminAnalyticsResponse,
    AdminExperienceDetailResponse,
    AdminExperienceListResponse,
    AdminLoginRequest,
    AdminMessageResponse,
    AdminOrderDetailResponse,
    AdminOrderListResponse,
    AdminPaymentDetailResponse,
    AdminPaymentListResponse,
    AdminSearchResponse,
    AdminSessionResponse,
    AdminSettingsResponse,
)
from app.admin.settings_service import admin_settings_service
from app.admin.service import admin_service
from app.admin.session import get_admin_session_expiry
from app.core.config import settings
from app.database.session import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=AdminSessionResponse)
def admin_login(payload: AdminLoginRequest, response: Response) -> AdminSessionResponse:
    session, token, max_age = admin_service.login(payload.email, payload.password)
    response.set_cookie(
        key=ADMIN_COOKIE,
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=max_age,
        path="/",
    )
    return session


@router.post("/logout", response_model=AdminMessageResponse)
def admin_logout(response: Response) -> AdminMessageResponse:
    response.delete_cookie(key=ADMIN_COOKIE, path="/")
    return AdminMessageResponse(message="Logged out successfully")


@router.get("/me", response_model=AdminSessionResponse)
def admin_me(
    current_admin: CurrentAdmin,
    session_token: Annotated[str | None, Cookie(alias=ADMIN_COOKIE)] = None,
) -> AdminSessionResponse:
    expires_at = get_admin_session_expiry(session_token) if session_token else None
    return admin_service.get_session(current_admin, expires_at)


@router.get("/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> AdminDashboardResponse:
    return admin_service.get_dashboard(db)


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def admin_analytics(
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> AdminAnalyticsResponse:
    return admin_analytics_service.get_analytics(db)


@router.get("/orders", response_model=AdminOrderListResponse)
def admin_orders(
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    q: Annotated[str | None, Query(max_length=200)] = None,
    status: Annotated[str | None, Query(max_length=32)] = None,
    occasion: Annotated[str | None, Query(max_length=128)] = None,
    template: Annotated[str | None, Query(max_length=128)] = None,
    date_from: Annotated[datetime | None, Query()] = None,
    date_to: Annotated[datetime | None, Query()] = None,
    sort: Annotated[str, Query(max_length=32)] = "newest",
) -> AdminOrderListResponse:
    return admin_orders_service.list_orders(
        db,
        page=page,
        page_size=page_size,
        q=q,
        status=status,
        occasion=occasion,
        template=template,
        date_from=date_from,
        date_to=date_to,
        sort=sort,
    )


@router.get("/orders/{order_id}", response_model=AdminOrderDetailResponse)
def admin_order_detail(
    order_id: UUID,
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> AdminOrderDetailResponse:
    return admin_orders_service.get_order_detail(db, order_id)


@router.get("/customers", response_model=AdminCustomerListResponse)
def admin_customers(
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    q: Annotated[str | None, Query(max_length=200)] = None,
    has_orders: Annotated[str | None, Query(max_length=32)] = None,
    repeat_customer: Annotated[str | None, Query(max_length=32)] = None,
    date_from: Annotated[datetime | None, Query()] = None,
    date_to: Annotated[datetime | None, Query()] = None,
    sort: Annotated[str, Query(max_length=32)] = "newest",
) -> AdminCustomerListResponse:
    return admin_customers_service.list_customers(
        db,
        page=page,
        page_size=page_size,
        q=q,
        has_orders=has_orders,
        repeat_customer=repeat_customer,
        date_from=date_from,
        date_to=date_to,
        sort=sort,
    )


@router.get("/customers/{customer_email:path}", response_model=AdminCustomerDetailResponse)
def admin_customer_detail(
    customer_email: str,
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> AdminCustomerDetailResponse:
    return admin_customers_service.get_customer_detail(db, customer_email)


@router.get("/experiences", response_model=AdminExperienceListResponse)
def admin_experiences(
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    q: Annotated[str | None, Query(max_length=200)] = None,
    occasion: Annotated[str | None, Query(max_length=128)] = None,
    relationship: Annotated[str | None, Query(max_length=128)] = None,
    template: Annotated[str | None, Query(max_length=128)] = None,
    status: Annotated[str | None, Query(max_length=32)] = None,
    date_from: Annotated[datetime | None, Query()] = None,
    date_to: Annotated[datetime | None, Query()] = None,
    sort: Annotated[str, Query(max_length=32)] = "newest",
) -> AdminExperienceListResponse:
    return admin_experiences_service.list_experiences(
        db,
        page=page,
        page_size=page_size,
        q=q,
        occasion=occasion,
        relationship=relationship,
        template=template,
        status=status,
        date_from=date_from,
        date_to=date_to,
        sort=sort,
    )


@router.get("/experiences/{experience_id}", response_model=AdminExperienceDetailResponse)
def admin_experience_detail(
    experience_id: UUID,
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> AdminExperienceDetailResponse:
    return admin_experiences_service.get_experience_detail(db, experience_id)


@router.get("/payments", response_model=AdminPaymentListResponse)
def admin_payments(
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    q: Annotated[str | None, Query(max_length=200)] = None,
    status: Annotated[str | None, Query(max_length=32)] = None,
    gateway: Annotated[str | None, Query(max_length=32)] = None,
    date_from: Annotated[datetime | None, Query()] = None,
    date_to: Annotated[datetime | None, Query()] = None,
    sort: Annotated[str, Query(max_length=32)] = "newest",
) -> AdminPaymentListResponse:
    return admin_payments_service.list_payments(
        db,
        page=page,
        page_size=page_size,
        q=q,
        status=status,
        gateway=gateway,
        date_from=date_from,
        date_to=date_to,
        sort=sort,
    )


@router.get("/payments/{record_id}", response_model=AdminPaymentDetailResponse)
def admin_payment_detail(
    record_id: int,
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
) -> AdminPaymentDetailResponse:
    return admin_payments_service.get_payment_detail(db, record_id)


@router.get("/search", response_model=AdminSearchResponse)
def admin_search(
    _current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    q: Annotated[str, Query(min_length=1, max_length=200)],
    limit: Annotated[int, Query(ge=1, le=10)] = 5,
    intent: Annotated[str | None, Query(max_length=32)] = None,
) -> AdminSearchResponse:
    return admin_search_service.search(db, q=q, limit=limit, intent=intent)


@router.get("/settings", response_model=AdminSettingsResponse)
def admin_settings(
    current_admin: CurrentAdmin,
    db: Annotated[Session, Depends(get_db)],
    session_token: Annotated[str | None, Cookie(alias=ADMIN_COOKIE)] = None,
) -> AdminSettingsResponse:
    return admin_settings_service.get_settings(
        db,
        admin_email=current_admin,
        session_token=session_token,
    )
