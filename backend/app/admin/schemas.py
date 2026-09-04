"""Admin API request/response schemas."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=3, max_length=128)


class AdminUserResponse(BaseModel):
    email: EmailStr
    name: str | None = None
    role: str = "admin"


class AdminSessionResponse(BaseModel):
    user: AdminUserResponse
    expires_at: datetime | None = None


class AdminMessageResponse(BaseModel):
    message: str


class AdminKpiMetrics(BaseModel):
    total_orders: int
    completed_orders: int
    pending_orders: int
    revenue: Decimal
    customers: int
    published_experiences: int
    currency: str = "INR"


class AdminRecentOrderItem(BaseModel):
    order_id: str
    customer: str
    customer_email: str | None = None
    occasion: str | None = None
    template: str | None = None
    amount: Decimal
    currency: str
    payment_status: str
    checkout_status: str
    created_at: datetime


class AdminRecentExperienceItem(BaseModel):
    id: str
    name: str
    customer: str | None = None
    published: bool
    published_at: datetime | None = None
    created_at: datetime
    public_url: str | None = None


class AdminSystemStatusItem(BaseModel):
    label: str
    status: str


class AdminDashboardResponse(BaseModel):
    available: bool = True
    message: str | None = None
    kpis: AdminKpiMetrics | None = None
    recent_orders: list[AdminRecentOrderItem] = Field(default_factory=list)
    recent_experiences: list[AdminRecentExperienceItem] = Field(default_factory=list)
    system_status: list[AdminSystemStatusItem] = Field(default_factory=list)


class AdminOrderSummary(BaseModel):
    total_orders: int
    completed: int
    pending: int
    failed: int
    todays_orders: int
    todays_revenue: Decimal
    currency: str = "INR"


class AdminOrderListItem(BaseModel):
    order_id: str
    experience_uuid: str
    customer_name: str
    email: str
    occasion: str | None = None
    relationship: str | None = None
    template: str | None = None
    amount: Decimal
    currency: str
    payment_status: str
    experience_status: str | None = None
    checkout_status: str
    payment_id: str | None = None
    experience_url: str | None = None
    published: bool = False
    created_at: datetime


class AdminOrderFilterOptions(BaseModel):
    occasions: list[str] = Field(default_factory=list)
    templates: list[str] = Field(default_factory=list)


class AdminOrderListResponse(BaseModel):
    items: list[AdminOrderListItem] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
    pages: int = 0
    summary: AdminOrderSummary
    filter_options: AdminOrderFilterOptions = Field(default_factory=AdminOrderFilterOptions)


class AdminOrderPhotoItem(BaseModel):
    uuid: str
    url: str | None = None
    cloudinary_public_id: str | None = None
    media_type: str
    alt_text: str | None = None


class AdminOrderDetailResponse(BaseModel):
    order_id: str
    experience_uuid: str
    customer_name: str
    email: str
    mobile: str
    occasion: str | None = None
    relationship: str | None = None
    template: str | None = None
    template_slug: str | None = None
    recipient_name: str | None = None
    custom_message: str | None = None
    amount: Decimal
    discount_amount: Decimal
    total: Decimal
    currency: str
    coupon_code: str | None = None
    payment_status: str
    checkout_status: str
    experience_status: str | None = None
    payment_id: str | None = None
    payment_order_id: str | None = None
    payment_provider: str | None = None
    experience_url: str | None = None
    published: bool = False
    published_at: datetime | None = None
    photos: list[AdminOrderPhotoItem] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime | None = None


class AdminCustomerSummary(BaseModel):
    total_customers: int
    new_this_month: int
    repeat_customers: int
    total_revenue: Decimal
    currency: str = "INR"


class AdminCustomerListItem(BaseModel):
    email: str
    customer_name: str
    phone: str | None = None
    total_orders: int
    total_spent: Decimal
    currency: str
    latest_purchase: datetime | None = None
    joined_at: datetime
    is_repeat: bool = False
    latest_order_id: str | None = None
    latest_experience_url: str | None = None


class AdminCustomerListResponse(BaseModel):
    items: list[AdminCustomerListItem] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
    pages: int = 0
    summary: AdminCustomerSummary


class AdminCustomerOrderHistoryItem(BaseModel):
    order_id: str
    amount: Decimal
    currency: str
    payment_status: str
    checkout_status: str
    template: str | None = None
    occasion: str | None = None
    created_at: datetime


class AdminCustomerPaymentHistoryItem(BaseModel):
    payment_id: str | None = None
    order_id: str | None = None
    amount: Decimal
    currency: str
    status: str
    provider: str | None = None
    created_at: datetime | None = None


class AdminCustomerExperienceItem(BaseModel):
    id: str
    name: str
    public_url: str | None = None
    published: bool = False
    published_at: datetime | None = None
    created_at: datetime | None = None


class AdminCustomerDetailResponse(BaseModel):
    email: str
    customer_name: str
    phone: str | None = None
    joined_at: datetime
    total_orders: int
    total_spent: Decimal
    currency: str
    latest_order_id: str | None = None
    latest_purchase: datetime | None = None
    latest_experience_url: str | None = None
    uploaded_images_count: int = 0
    purchase_history: list[AdminCustomerOrderHistoryItem] = Field(default_factory=list)
    payment_history: list[AdminCustomerPaymentHistoryItem] = Field(default_factory=list)
    experiences: list[AdminCustomerExperienceItem] = Field(default_factory=list)


class AdminExperienceSummary(BaseModel):
    published: int
    draft: int
    expired: int
    total: int


class AdminExperienceListItem(BaseModel):
    experience_id: str
    customer: str
    customer_email: str | None = None
    occasion: str | None = None
    relationship: str | None = None
    template: str | None = None
    status: str
    experience_status: str | None = None
    published_url: str | None = None
    created_at: datetime


class AdminExperienceFilterOptions(BaseModel):
    occasions: list[str] = Field(default_factory=list)
    relationships: list[str] = Field(default_factory=list)
    templates: list[str] = Field(default_factory=list)


class AdminExperienceListResponse(BaseModel):
    items: list[AdminExperienceListItem] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
    pages: int = 0
    summary: AdminExperienceSummary
    filter_options: AdminExperienceFilterOptions = Field(default_factory=AdminExperienceFilterOptions)


class AdminExperienceDetailResponse(BaseModel):
    experience_id: str
    customer: str
    customer_email: str | None = None
    recipient_name: str | None = None
    occasion: str | None = None
    relationship: str | None = None
    template: str | None = None
    template_slug: str | None = None
    personal_message: str | None = None
    status: str
    experience_status: str | None = None
    published_url: str | None = None
    public_slug: str | None = None
    payment_reference: str | None = None
    checkout_order_id: str | None = None
    photos: list[AdminOrderPhotoItem] = Field(default_factory=list)
    created_at: datetime
    published_at: datetime | None = None


class AdminPaymentSummary(BaseModel):
    total_revenue: Decimal
    todays_revenue: Decimal
    successful_payments: int
    pending_payments: int
    failed_payments: int
    refunded_payments: int
    currency: str = "INR"


class AdminPaymentListItem(BaseModel):
    record_id: str
    payment_id: str | None = None
    order_id: str | None = None
    customer: str
    customer_email: str | None = None
    amount: Decimal
    currency: str
    payment_method: str | None = None
    status: str
    raw_status: str
    gateway: str
    provider: str | None = None
    experience_id: str | None = None
    created_at: datetime


class AdminPaymentFilterOptions(BaseModel):
    gateways: list[str] = Field(default_factory=list)


class AdminPaymentListResponse(BaseModel):
    items: list[AdminPaymentListItem] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 20
    pages: int = 0
    summary: AdminPaymentSummary
    filter_options: AdminPaymentFilterOptions = Field(default_factory=AdminPaymentFilterOptions)
    active_provider: str | None = None


class AdminPaymentDetailResponse(BaseModel):
    record_id: str
    payment_id: str | None = None
    order_id: str | None = None
    customer: str
    customer_email: str | None = None
    amount: Decimal
    currency: str
    payment_method: str | None = None
    status: str
    raw_status: str
    gateway: str
    provider: str | None = None
    transaction_reference: str | None = None
    failure_reason: str | None = None
    experience_id: str | None = None
    experience_name: str | None = None
    experience_url: str | None = None
    verified_at: datetime | None = None
    created_at: datetime


class AdminSearchResultItem(BaseModel):
    entity_type: str
    reference_id: str
    title: str
    subtitle: str
    status: str


class AdminSearchGroup(BaseModel):
    entity_type: str
    label: str
    items: list[AdminSearchResultItem] = Field(default_factory=list)


class AdminSearchResponse(BaseModel):
    query: str
    groups: list[AdminSearchGroup] = Field(default_factory=list)
    total: int = 0


class AdminAnalyticsMetrics(BaseModel):
    revenue: Decimal
    orders: int
    customers: int
    experiences: int
    conversion_rate: Decimal | None = None
    currency: str = "INR"


class AdminAnalyticsTrendPoint(BaseModel):
    label: str
    value: Decimal


class AdminAnalyticsCountItem(BaseModel):
    key: str
    label: str
    count: int


class AdminAnalyticsActivityItem(BaseModel):
    id: str
    type: str
    title: str
    subtitle: str
    occurred_at: datetime


class AdminAnalyticsResponse(BaseModel):
    available: bool = True
    message: str | None = None
    metrics: AdminAnalyticsMetrics | None = None
    revenue_trend: list[AdminAnalyticsTrendPoint] = Field(default_factory=list)
    orders_trend: list[AdminAnalyticsTrendPoint] = Field(default_factory=list)
    daily_purchases: list[AdminAnalyticsTrendPoint] = Field(default_factory=list)
    monthly_revenue: list[AdminAnalyticsTrendPoint] = Field(default_factory=list)
    popular_occasions: list[AdminAnalyticsCountItem] = Field(default_factory=list)
    popular_templates: list[AdminAnalyticsCountItem] = Field(default_factory=list)
    top_occasions: list[AdminAnalyticsCountItem] = Field(default_factory=list)
    top_templates: list[AdminAnalyticsCountItem] = Field(default_factory=list)
    recent_activity: list[AdminAnalyticsActivityItem] = Field(default_factory=list)


class AdminSettingsGeneral(BaseModel):
    platform_name: str
    platform_version: str
    environment: str


class AdminSettingsCloudinary(BaseModel):
    cloud_name: str | None = None
    upload_status: str
    connection_status: str


class AdminSettingsPayment(BaseModel):
    current_gateway: str
    mock_enabled: bool = False
    razorpay_ready: bool = False
    connection_status: str
    webhook_status: str


class AdminSettingsEmail(BaseModel):
    smtp_status: str
    queue_status: str


class AdminSettingsSecurity(BaseModel):
    current_admin: str
    last_login: datetime | None = None
    session_timeout_hours: int


class AdminSettingsMaintenance(BaseModel):
    maintenance_mode: bool = False
    read_only_mode: bool = False


class AdminSettingsBackup(BaseModel):
    future_features: list[str] = Field(default_factory=list)


class AdminSettingsAbout(BaseModel):
    chronivs_version: str
    build_version: str
    deployment_environment: str


class AdminSettingsResponse(BaseModel):
    general: AdminSettingsGeneral
    cloudinary: AdminSettingsCloudinary
    payment: AdminSettingsPayment
    email: AdminSettingsEmail
    security: AdminSettingsSecurity
    maintenance: AdminSettingsMaintenance
    system_health: list[AdminSystemStatusItem] = Field(default_factory=list)
    backup: AdminSettingsBackup
    about: AdminSettingsAbout
