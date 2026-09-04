"""Payment API — create Razorpay order + verify signature. No business logic here."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.payment_api import (
    CreateOrderRequest,
    CreateOrderResponse,
    PaymentFailureRequest,
    PaymentFailureResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
)
from app.services.payment_service import payment_service

router = APIRouter()


@router.post("/create-order", response_model=CreateOrderResponse)
def create_payment_order(
    payload: CreateOrderRequest,
    db: Annotated[Session, Depends(get_db)],
) -> CreateOrderResponse:
    """Create a Razorpay order for a payable experience. Returns public key + order_id."""
    return payment_service.create_order(db, payload.experienceId)


@router.post("/verify", response_model=VerifyPaymentResponse)
def verify_payment(
    payload: VerifyPaymentRequest,
    db: Annotated[Session, Depends(get_db)],
) -> VerifyPaymentResponse:
    """
    Verify Razorpay payment signature server-side.

    Never trust the frontend — signature must validate with KEY_SECRET.
    On success: payment stored, experience → ready_to_publish (not published).
    """
    return payment_service.verify_payment(
        db,
        order_id=payload.order_id.strip(),
        payment_id=payload.payment_id.strip(),
        signature=payload.signature.strip(),
        experience_uuid=payload.experience_id,
        payment_method=payload.payment_method,
    )


@router.post("/failure", response_model=PaymentFailureResponse)
def record_payment_failure(
    payload: PaymentFailureRequest,
    db: Annotated[Session, Depends(get_db)],
) -> PaymentFailureResponse:
    """Record cancelled / failed client-side payment outcomes."""
    return payment_service.record_failure(
        db,
        experience_uuid=payload.experience_id,
        order_id=payload.order_id,
        reason=payload.reason,
        cancelled=payload.cancelled,
        gateway_response=payload.gateway_response,
    )


@router.get("/health")
def payments_health() -> dict[str, str]:
    return {"status": "ok", "service": "payments"}
