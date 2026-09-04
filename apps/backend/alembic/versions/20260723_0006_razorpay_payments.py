"""Razorpay payment fields + status expansions

Revision ID: 20260723_0006
Revises: 20260722_0005
Create Date: 2026-07-23

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260723_0006"
down_revision: Union[str, None] = "20260722_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_NEW_PAYMENT_STATUS = (
    "created",
    "success",
    "cancelled",
)

_NEW_EXPERIENCE_STATUS = (
    "ready_to_publish",
)


def upgrade() -> None:
    with op.get_context().autocommit_block():
        for value in _NEW_PAYMENT_STATUS:
            op.execute(sa.text(f"ALTER TYPE payment_status ADD VALUE IF NOT EXISTS '{value}'"))
        for value in _NEW_EXPERIENCE_STATUS:
            op.execute(sa.text(f"ALTER TYPE experience_status ADD VALUE IF NOT EXISTS '{value}'"))

    op.add_column("payments", sa.Column("signature", sa.String(length=512), nullable=True))
    op.add_column("payments", sa.Column("payment_method", sa.String(length=64), nullable=True))
    op.add_column("payments", sa.Column("failure_reason", sa.Text(), nullable=True))
    op.add_column(
        "payments",
        sa.Column("gateway_response", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.add_column(
        "payments",
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("payments", "verified_at")
    op.drop_column("payments", "gateway_response")
    op.drop_column("payments", "failure_reason")
    op.drop_column("payments", "payment_method")
    op.drop_column("payments", "signature")
    # PostgreSQL cannot easily remove enum values — leave new enum labels in place.
