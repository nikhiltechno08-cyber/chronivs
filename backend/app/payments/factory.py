"""Resolve the active payment provider (mock / razorpay; stripe later)."""

from __future__ import annotations

from functools import lru_cache

from app.core.config import settings
from app.payments.base import PaymentGateway
from app.payments.mock_provider import MockPaymentProvider
from app.payments.razorpay_gateway import RazorpayGateway

# Spec aliases — Checkout never imports these directly.
PaymentProvider = PaymentGateway
RazorpayProvider = RazorpayGateway


@lru_cache
def get_payment_gateway() -> PaymentGateway:
    """
    Return the configured payment provider.

    Controlled by PAYMENT_PROVIDER. Production refuses mock.
    """
    settings.validate_payment_provider_config()
    provider = settings.payment_provider

    if provider == "mock":
        return MockPaymentProvider()

    if provider == "razorpay":
        return RazorpayGateway()

    raise RuntimeError(f"Unsupported PAYMENT_PROVIDER={provider!r}")


def clear_payment_gateway_cache() -> None:
    """Test helper — drop the cached provider instance."""
    get_payment_gateway.cache_clear()
