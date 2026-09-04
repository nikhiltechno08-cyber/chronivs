"""Gateway-agnostic payment provider contract."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol


@dataclass(frozen=True)
class GatewayOrder:
    order_id: str
    amount: int  # minor units (paise for INR)
    currency: str
    status: str | None = None
    raw: dict[str, Any] = field(default_factory=dict)


class PaymentGateway(Protocol):
    """Future Stripe / PayPal / PhonePe adapters implement this protocol."""

    provider_name: str

    def create_order(
        self,
        *,
        amount_minor: int,
        currency: str,
        receipt: str,
        notes: dict[str, str] | None = None,
    ) -> GatewayOrder: ...

    def verify_signature(
        self,
        *,
        order_id: str,
        payment_id: str,
        signature: str,
    ) -> bool: ...

    def fetch_order(self, order_id: str) -> GatewayOrder | None: ...

    @property
    def public_key(self) -> str: ...
