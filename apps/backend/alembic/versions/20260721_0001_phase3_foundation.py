"""Phase 3 foundation tables

Revision ID: 20260721_0001
Revises:
Create Date: 2026-07-21

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260721_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # postgresql.ENUM + create_type=False prevents duplicate CREATE TYPE on CREATE TABLE.
    experience_status = postgresql.ENUM(
        "draft",
        "pending_payment",
        "published",
        "archived",
        name="experience_status",
        create_type=False,
    )
    media_type = postgresql.ENUM(
        "photo",
        "audio",
        "video",
        "cover",
        name="media_type",
        create_type=False,
    )
    payment_status = postgresql.ENUM(
        "pending",
        "paid",
        "failed",
        "refunded",
        name="payment_status",
        create_type=False,
    )
    email_log_status = postgresql.ENUM(
        "pending",
        "sent",
        "failed",
        name="email_log_status",
        create_type=False,
    )

    op.execute(
        sa.text(
            "DO $$ BEGIN "
            "CREATE TYPE experience_status AS ENUM "
            "('draft', 'pending_payment', 'published', 'archived'); "
            "EXCEPTION WHEN duplicate_object THEN NULL; END $$;"
        )
    )
    op.execute(
        sa.text(
            "DO $$ BEGIN "
            "CREATE TYPE media_type AS ENUM ('photo', 'audio', 'video', 'cover'); "
            "EXCEPTION WHEN duplicate_object THEN NULL; END $$;"
        )
    )
    op.execute(
        sa.text(
            "DO $$ BEGIN "
            "CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded'); "
            "EXCEPTION WHEN duplicate_object THEN NULL; END $$;"
        )
    )
    op.execute(
        sa.text(
            "DO $$ BEGIN "
            "CREATE TYPE email_log_status AS ENUM ('pending', 'sent', 'failed'); "
            "EXCEPTION WHEN duplicate_object THEN NULL; END $$;"
        )
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("avatar", sa.String(length=1024), nullable=True),
        sa.Column("provider", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_uuid", "users", ["uuid"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=False)

    op.create_table(
        "experiences",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("occasion", sa.String(length=128), nullable=True),
        sa.Column("relationship", sa.String(length=128), nullable=True),
        sa.Column("template_name", sa.String(length=128), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("status", experience_status, nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid"),
    )
    op.create_index("ix_experiences_uuid", "experiences", ["uuid"], unique=False)
    op.create_index("ix_experiences_user_id", "experiences", ["user_id"], unique=False)
    op.create_index("ix_experiences_status", "experiences", ["status"], unique=False)

    op.create_table(
        "experience_media",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("experience_id", sa.Integer(), nullable=False),
        sa.Column("media_type", media_type, nullable=False),
        sa.Column("file_url", sa.String(length=2048), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["experience_id"], ["experiences.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_experience_media_experience_id",
        "experience_media",
        ["experience_id"],
        unique=False,
    )

    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("experience_id", sa.Integer(), nullable=False),
        sa.Column("provider", sa.String(length=64), nullable=True),
        sa.Column("order_id", sa.String(length=255), nullable=True),
        sa.Column("payment_id", sa.String(length=255), nullable=True),
        sa.Column("amount", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=8), nullable=False),
        sa.Column("status", payment_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["experience_id"], ["experiences.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("experience_id"),
    )
    op.create_index("ix_payments_experience_id", "payments", ["experience_id"], unique=False)
    op.create_index("ix_payments_order_id", "payments", ["order_id"], unique=False)
    op.create_index("ix_payments_payment_id", "payments", ["payment_id"], unique=False)
    op.create_index("ix_payments_status", "payments", ["status"], unique=False)

    op.create_table(
        "published_experiences",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("experience_id", sa.Integer(), nullable=False),
        sa.Column("public_slug", sa.String(length=128), nullable=False),
        sa.Column("qr_code_url", sa.String(length=2048), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["experience_id"], ["experiences.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("experience_id"),
        sa.UniqueConstraint("public_slug"),
    )
    op.create_index(
        "ix_published_experiences_experience_id",
        "published_experiences",
        ["experience_id"],
        unique=False,
    )
    op.create_index(
        "ix_published_experiences_public_slug",
        "published_experiences",
        ["public_slug"],
        unique=False,
    )

    op.create_table(
        "email_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("experience_id", sa.Integer(), nullable=False),
        sa.Column("recipient", sa.String(length=320), nullable=False),
        sa.Column("subject", sa.String(length=512), nullable=False),
        sa.Column("status", email_log_status, nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["experience_id"], ["experiences.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_email_logs_experience_id", "email_logs", ["experience_id"], unique=False)
    op.create_index("ix_email_logs_status", "email_logs", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_email_logs_status", table_name="email_logs")
    op.drop_index("ix_email_logs_experience_id", table_name="email_logs")
    op.drop_table("email_logs")

    op.drop_index("ix_published_experiences_public_slug", table_name="published_experiences")
    op.drop_index("ix_published_experiences_experience_id", table_name="published_experiences")
    op.drop_table("published_experiences")

    op.drop_index("ix_payments_status", table_name="payments")
    op.drop_index("ix_payments_payment_id", table_name="payments")
    op.drop_index("ix_payments_order_id", table_name="payments")
    op.drop_index("ix_payments_experience_id", table_name="payments")
    op.drop_table("payments")

    op.drop_index("ix_experience_media_experience_id", table_name="experience_media")
    op.drop_table("experience_media")

    op.drop_index("ix_experiences_status", table_name="experiences")
    op.drop_index("ix_experiences_user_id", table_name="experiences")
    op.drop_index("ix_experiences_uuid", table_name="experiences")
    op.drop_table("experiences")

    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_uuid", table_name="users")
    op.drop_table("users")

    sa.Enum(name="email_log_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="payment_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="media_type").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="experience_status").drop(op.get_bind(), checkfirst=True)
