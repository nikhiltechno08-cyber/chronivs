"""Checkout service — creates guest checkout sessions + Experience records."""

from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from sqlalchemy.orm import Session

from app.common.constants import CHECKOUT_BASE_PRICE, CHECKOUT_CURRENCY
from app.common.enums import CheckoutStatus
from app.models.checkout_session import CheckoutSession
from app.schemas.checkout import CheckoutCreateRequest, CheckoutSessionResponse
from app.services.experience_service import experience_service


class CheckoutService:
    """Create checkout sessions and the linked Experience (single source of truth)."""

    def create_session(
        self,
        db: Session,
        payload: CheckoutCreateRequest,
    ) -> CheckoutSessionResponse:
        amount = Decimal(CHECKOUT_BASE_PRICE)
        # Coupon architecture only — no discount applied yet.
        discount = Decimal("0.00")
        total = amount - discount

        if payload.experience_uuid is not None:
            # Link checkout to a pre-created Experience (POST /experiences).
            experience_uuid = payload.experience_uuid
            experience_service.attach_checkout_payload(
                db,
                experience_uuid,
                payload,
                template_slug=getattr(payload, "template_slug", None),
            )
        else:
            experience_uuid = uuid4()
            # Central Experience record — payments/publish/email will attach here later.
            experience_service.create_from_checkout(
                db,
                payload,
                experience_uuid=experience_uuid,
                template_slug=getattr(payload, "template_slug", None),
            )

        session = CheckoutSession(
            uuid=uuid4(),
            experience_uuid=experience_uuid,
            customer_name=payload.customer_name,
            email=payload.email.lower().strip(),
            mobile=payload.mobile,
            coupon_code=payload.coupon_code,
            template_name=payload.template_name,
            occasion=payload.occasion,
            relationship=payload.relationship,
            amount=amount,
            discount_amount=discount,
            total=total,
            currency=CHECKOUT_CURRENCY,
            status=CheckoutStatus.READY_FOR_PAYMENT,
        )
        db.add(session)

        db.commit()
        db.refresh(session)
        return self._to_response(session)

    def _to_response(self, session: CheckoutSession) -> CheckoutSessionResponse:
        return CheckoutSessionResponse(
            checkout_uuid=session.uuid,
            experience_uuid=session.experience_uuid,
            amount=session.amount,
            discount_amount=session.discount_amount,
            total=session.total,
            currency=session.currency,
            status=session.status,
            customer_name=session.customer_name,
            email=session.email,
            mobile=session.mobile,
            coupon_code=session.coupon_code,
            template_name=session.template_name,
            occasion=session.occasion,
            relationship=session.relationship,
            created_at=session.created_at,
        )


checkout_service = CheckoutService()
