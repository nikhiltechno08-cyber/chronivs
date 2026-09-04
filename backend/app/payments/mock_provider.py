"""Mock payment provider — local development only."""

from __future__ import annotations

import logging
import secrets
from typing import Any

from app.core.config import settings
from app.payments.base import GatewayOrder

logger = logging.getLogger(__name__)


def _token(nbytes: int = 8) -> str:
    return secrets.token_hex(nbytes)


class MockPaymentProvider:
    """
    Simulates gateway order + signature verification for local end-to-end testing.

    Never use in production (enforced via APP_ENV + PAYMENT_PROVIDER checks).
    """

    provider_name = "mock"

    def __init__(self) -> None:
        settings.validate_payment_provider_config()
        if settings.payment_provider != "mock":
            raise RuntimeError("MockPaymentProvider loaded while PAYMENT_PROVIDER is not mock")

    @property
    def public_key(self) -> str:
        return "mock_key"

    def create_order(
        self,
        *,
        amount_minor: int,
        currency: str,
        receipt: str,
        notes: dict[str, str] | None = None,
    ) -> GatewayOrder:
        logger.info("Mock Payment Started receipt=%s amount=%s", receipt, amount_minor)
        order_id = f"order_mock_{_token()}"
        raw: dict[str, Any] = {
            "id": order_id,
            "amount": int(amount_minor),
            "currency": currency.upper(),
            "receipt": receipt[:40],
            "status": "created",
            "provider": "mock",
            "mock_result": settings.mock_payment_result,
            "notes": notes or {},
        }
        return GatewayOrder(
            order_id=order_id,
            amount=int(amount_minor),
            currency=currency.upper(),
            status="created",
            raw=raw,
        )

    def verify_signature(
        self,
        *,
        order_id: str,
        payment_id: str,
        signature: str,
    ) -> bool:
        result = settings.mock_payment_result

        if result == "cancelled":
            logger.info(
                "Mock Payment Cancelled order_id=%s payment_id=%s",
                order_id,
                payment_id,
            )
            return False

        if result == "failure":
            logger.info(
                "Mock Payment Failed order_id=%s payment_id=%s",
                order_id,
                payment_id,
            )
            return False

        # success
        ok = (
            order_id.startswith("order_mock_")
            and payment_id.startswith("pay_mock_")
            and signature.startswith("mock_signature_")
        )
        if ok:
            logger.info(
                "Mock Payment Success order_id=%s payment_id=%s",
                order_id,
                payment_id,
            )
        else:
            logger.info(
                "Mock Payment Failed invalid mock ids order_id=%s payment_id=%s",
                order_id,
                payment_id,
            )
        return ok

    def fetch_order(self, order_id: str) -> GatewayOrder | None:
        if not order_id.startswith("order_mock_"):
            return None
        return GatewayOrder(
            order_id=order_id,
            amount=0,
            currency="INR",
            status="created",
            raw={"id": order_id, "provider": "mock", "status": "created"},
        )
