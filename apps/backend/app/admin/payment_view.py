"""Gateway-agnostic admin payment presentation layer."""

from __future__ import annotations

from typing import Protocol

from app.common.enums import PaymentStatus
from app.models.payment import Payment


class AdminPaymentViewAdapter(Protocol):
    def normalize_gateway(self, provider: str | None) -> str: ...

    def normalize_status(self, status: PaymentStatus) -> str: ...

    def transaction_reference(self, payment: Payment) -> str | None: ...


class GatewayAgnosticPaymentView:
    """Maps stored payment records to admin UI fields without gateway SDK imports."""

    _GATEWAY_LABELS = {
        "mock": "Mock",
        "razorpay": "Razorpay",
    }

    def normalize_gateway(self, provider: str | None) -> str:
        if not provider:
            return "Unknown"
        return self._GATEWAY_LABELS.get(provider.strip().lower(), provider.title())

    def normalize_status(self, status: PaymentStatus) -> str:
        value = status.value if isinstance(status, PaymentStatus) else str(status)
        normalized = value.lower()
        if normalized in {PaymentStatus.SUCCESS.value, PaymentStatus.PAID.value}:
            return "success"
        if normalized in {PaymentStatus.CREATED.value, PaymentStatus.PENDING.value}:
            return "pending"
        if normalized in {PaymentStatus.FAILED.value, PaymentStatus.CANCELLED.value}:
            return "failed"
        if normalized == PaymentStatus.REFUNDED.value:
            return "refunded"
        return normalized

    def transaction_reference(self, payment: Payment) -> str | None:
        return payment.payment_id or payment.order_id


admin_payment_view = GatewayAgnosticPaymentView()
