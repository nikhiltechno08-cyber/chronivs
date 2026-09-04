"""Checkout sessions table

Revision ID: 20260721_0003
Revises: 20260721_0002
Create Date: 2026-07-21

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260721_0003"
down_revision: Union[str, None] = "20260721_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    checkout_status = postgresql.ENUM(
        "pending",
        "ready_for_payment",
        "abandoned",
        "completed",
        name="checkout_status",
        create_type=False,
    )
    op.execute(
        sa.text(
            "DO $$ BEGIN "
            "CREATE TYPE checkout_status AS ENUM "
            "('pending', 'ready_for_payment', 'abandoned', 'completed'); "
            "EXCEPTION WHEN duplicate_object THEN NULL; END $$;"
        )
    )

    op.create_table(
        "checkout_sessions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("experience_uuid", sa.Uuid(), nullable=False),
        sa.Column("customer_name", sa.String(length=60), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("mobile", sa.String(length=15), nullable=False),
        sa.Column("coupon_code", sa.String(length=64), nullable=True),
        sa.Column("template_name", sa.String(length=128), nullable=True),
        sa.Column("occasion", sa.String(length=128), nullable=True),
        sa.Column("relationship", sa.String(length=128), nullable=True),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("total", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False),
        sa.Column("status", checkout_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid"),
        sa.UniqueConstraint("experience_uuid"),
    )
    op.create_index("ix_checkout_sessions_uuid", "checkout_sessions", ["uuid"], unique=False)
    op.create_index(
        "ix_checkout_sessions_experience_uuid",
        "checkout_sessions",
        ["experience_uuid"],
        unique=False,
    )
    op.create_index("ix_checkout_sessions_email", "checkout_sessions", ["email"], unique=False)
    op.create_index("ix_checkout_sessions_status", "checkout_sessions", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_checkout_sessions_status", table_name="checkout_sessions")
    op.drop_index("ix_checkout_sessions_email", table_name="checkout_sessions")
    op.drop_index("ix_checkout_sessions_experience_uuid", table_name="checkout_sessions")
    op.drop_index("ix_checkout_sessions_uuid", table_name="checkout_sessions")
    op.drop_table("checkout_sessions")
    sa.Enum(name="checkout_status").drop(op.get_bind(), checkfirst=True)
