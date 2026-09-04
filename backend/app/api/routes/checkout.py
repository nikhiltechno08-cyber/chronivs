"""Checkout API routes (placeholder payment — Razorpay later)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.checkout import CheckoutCreateRequest, CheckoutSessionResponse
from app.services.checkout_service import checkout_service

router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.get("/health")
def checkout_health() -> dict[str, str]:
    return {"status": "ok", "module": "checkout"}


@router.post("/create", response_model=CheckoutSessionResponse)
def create_checkout(
    payload: CheckoutCreateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> CheckoutSessionResponse:
    """
    Create a guest checkout session.

    Returns checkout UUID, reserved experience UUID, amount, and status.
    Does not process payment.
    """
    return checkout_service.create_session(db, payload)
