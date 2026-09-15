"""Razorpay PaymentGateway implementation."""

from __future__ import annotations

import logging
from typing import Any

import razorpay
from razorpay.errors import SignatureVerificationError

from app.common.exceptions import PaymentException
from app.core.config import settings
from app.payments.base import GatewayOrder

logger = logging.getLogger(__name__)


class RazorpayGateway:
    provider_name = "razorpay"

    def __init__(
        self,
        *,
        key_id: str | None = None,
        key_secret: str | None = None,
        client: Any | None = None,
    ) -> None:
        self._key_id = (key_id if key_id is not None else settings.razorpay_key_id).strip()
        self._key_secret = (
            key_secret if key_secret is not None else settings.razorpay_key_secret
        ).strip()
        if client is not None:
            self._client = client
        else:
            missing = settings.razorpay_missing()
            if missing:
                raise PaymentException(
                    "Payment gateway is not configured. Set Razorpay keys in the deployment "
                    "environment "
                    f"({', '.join(missing)}).",
                    code="razorpay_not_configured",
                    details={"missing": missing},
                )
            self._client = razorpay.Client(auth=(self._key_id, self._key_secret))

    @property
    def public_key(self) -> str:
        return self._key_id

    def create_order(
        self,
        *,
        amount_minor: int,
        currency: str,
        receipt: str,
        notes: dict[str, str] | None = None,
    ) -> GatewayOrder:
        payload: dict[str, Any] = {
            "amount": int(amount_minor),
            "currency": currency.upper(),
            "receipt": receipt[:40],
            "payment_capture": 1,
        }
        if notes:
            payload["notes"] = notes

        raw = self._client.order.create(data=payload)
        order_id = str(raw.get("id") or "")
        if not order_id:
            raise RuntimeError("Razorpay did not return an order id")

        logger.info(
            "Razorpay order created order_id=%s amount=%s currency=%s",
            order_id,
            amount_minor,
            currency,
        )
        return GatewayOrder(
            order_id=order_id,
            amount=int(raw.get("amount") or amount_minor),
            currency=str(raw.get("currency") or currency).upper(),
            status=str(raw.get("status") or "") or None,
            raw=dict(raw) if isinstance(raw, dict) else {"raw": raw},
        )

    def verify_signature(
        self,
        *,
        order_id: str,
        payment_id: str,
        signature: str,
    ) -> bool:
        try:
            self._client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": order_id,
                    "razorpay_payment_id": payment_id,
                    "razorpay_signature": signature,
                }
            )
            return True
        except SignatureVerificationError:
            return False
        except Exception:
            logger.exception(
                "Unexpected Razorpay signature verification error order_id=%s",
                order_id,
            )
            return False

    def fetch_order(self, order_id: str) -> GatewayOrder | None:
        try:
            raw = self._client.order.fetch(order_id)
        except Exception:
            logger.exception("Failed to fetch Razorpay order order_id=%s", order_id)
            return None
        if not isinstance(raw, dict):
            return None
        return GatewayOrder(
            order_id=str(raw.get("id") or order_id),
            amount=int(raw.get("amount") or 0),
            currency=str(raw.get("currency") or "INR").upper(),
            status=str(raw.get("status") or "") or None,
            raw=raw,
        )
