"""Cross-entity admin search orchestration."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.admin.customers_service import admin_customers_service
from app.admin.experiences_service import admin_experiences_service
from app.admin.orders_service import admin_orders_service
from app.admin.payments_service import admin_payments_service
from app.admin.schemas import AdminSearchGroup, AdminSearchResponse, AdminSearchResultItem

_GROUP_LABELS = {
    "order": "Orders",
    "customer": "Customers",
    "experience": "Experiences",
    "payment": "Payments",
}

_DEFAULT_GROUP_ORDER = ("order", "customer", "experience", "payment")

_INTENT_GROUP_ORDER: dict[str, tuple[str, ...]] = {
    "order_id": ("order", "payment", "experience", "customer"),
    "payment_id": ("payment", "order", "experience", "customer"),
    "experience_id": ("experience", "order", "payment", "customer"),
    "email": ("customer", "order", "payment", "experience"),
    "name": ("customer", "order", "experience", "payment"),
    "occasion": ("experience", "order", "customer", "payment"),
    "template": ("experience", "order", "customer", "payment"),
}


def _normalize_intent(intent: str | None) -> str:
    key = (intent or "general").strip().lower()
    if key in _INTENT_GROUP_ORDER:
        return key
    return "general"


def _order_group(entity_type: str, intent: str) -> int:
    order = _INTENT_GROUP_ORDER.get(intent, _DEFAULT_GROUP_ORDER)
    try:
        return order.index(entity_type)
    except ValueError:
        return len(order)


class AdminSearchService:
    def search(
        self,
        db: Session,
        *,
        q: str,
        limit: int = 5,
        intent: str | None = None,
    ) -> AdminSearchResponse:
        term = q.strip()
        if not term:
            return AdminSearchResponse(query="", groups=[], total=0)

        limit = min(max(limit, 1), 10)
        normalized_intent = _normalize_intent(intent)

        groups: list[AdminSearchGroup] = []

        orders = admin_orders_service.list_orders(db, page=1, page_size=limit, q=term)
        if orders.items:
            groups.append(
                AdminSearchGroup(
                    entity_type="order",
                    label=_GROUP_LABELS["order"],
                    items=[
                        AdminSearchResultItem(
                            entity_type="order",
                            reference_id=item.order_id,
                            title=item.customer_name or "Order",
                            subtitle=f"Order {item.order_id[:8]}… · {item.email or 'No email'}",
                            status=item.payment_status,
                        )
                        for item in orders.items
                    ],
                )
            )

        customers = admin_customers_service.list_customers(db, page=1, page_size=limit, q=term)
        if customers.items:
            groups.append(
                AdminSearchGroup(
                    entity_type="customer",
                    label=_GROUP_LABELS["customer"],
                    items=[
                        AdminSearchResultItem(
                            entity_type="customer",
                            reference_id=item.email,
                            title=item.customer_name or item.email,
                            subtitle=f"{item.email} · {item.total_orders} order{'s' if item.total_orders != 1 else ''}",
                            status="repeat" if item.is_repeat else "customer",
                        )
                        for item in customers.items
                    ],
                )
            )

        experiences = admin_experiences_service.list_experiences(db, page=1, page_size=limit, q=term)
        if experiences.items:
            groups.append(
                AdminSearchGroup(
                    entity_type="experience",
                    label=_GROUP_LABELS["experience"],
                    items=[
                        AdminSearchResultItem(
                            entity_type="experience",
                            reference_id=item.experience_id,
                            title=item.template or item.customer or "Experience",
                            subtitle=" · ".join(
                                part
                                for part in [
                                    item.customer,
                                    item.occasion,
                                    item.template,
                                ]
                                if part
                            )
                            or item.experience_id[:8] + "…",
                            status=item.status,
                        )
                        for item in experiences.items
                    ],
                )
            )

        payments = admin_payments_service.list_payments(db, page=1, page_size=limit, q=term)
        if payments.items:
            groups.append(
                AdminSearchGroup(
                    entity_type="payment",
                    label=_GROUP_LABELS["payment"],
                    items=[
                        AdminSearchResultItem(
                            entity_type="payment",
                            reference_id=item.payment_id or item.record_id,
                            title=item.customer or "Payment",
                            subtitle=" · ".join(
                                part
                                for part in [
                                    item.payment_id or f"#{item.record_id}",
                                    f"{item.currency} {item.amount}",
                                    item.gateway,
                                ]
                                if part
                            ),
                            status=item.status,
                        )
                        for item in payments.items
                    ],
                )
            )

        groups.sort(key=lambda group: _order_group(group.entity_type, normalized_intent))
        total = sum(len(group.items) for group in groups)

        return AdminSearchResponse(query=term, groups=groups, total=total)


admin_search_service = AdminSearchService()
