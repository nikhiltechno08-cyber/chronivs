"""Experience creation & storage pipeline

Revision ID: 20260722_0004
Revises: 20260721_0003
Create Date: 2026-07-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260722_0004"
down_revision: Union[str, None] = "20260721_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_NEW_STATUS_VALUES = (
    "preview_ready",
    "checkout_started",
    "ready_for_payment",
    "payment_pending",
    "payment_success",
    "failed",
)


def upgrade() -> None:
    bind = op.get_bind()

    # Expand experience_status enum (must often run outside a transaction on PG).
    with op.get_context().autocommit_block():
        for value in _NEW_STATUS_VALUES:
            op.execute(sa.text(f"ALTER TYPE experience_status ADD VALUE IF NOT EXISTS '{value}'"))

    media_upload_status = postgresql.ENUM(
        "placeholder",
        "pending",
        "uploaded",
        "failed",
        name="media_upload_status",
        create_type=False,
    )
    media_upload_status.create(bind, checkfirst=True)

    op.add_column("experiences", sa.Column("template_slug", sa.String(length=128), nullable=True))
    op.add_column("experiences", sa.Column("customer_name", sa.String(length=60), nullable=True))
    op.add_column("experiences", sa.Column("customer_email", sa.String(length=320), nullable=True))
    op.add_column("experiences", sa.Column("customer_mobile", sa.String(length=15), nullable=True))
    op.add_column(
        "experiences",
        sa.Column("preview_version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column("experiences", sa.Column("published_version", sa.Integer(), nullable=True))
    op.add_column(
        "experiences",
        sa.Column(
            "experience_data",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )
    op.add_column("experiences", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))

    op.alter_column("experiences", "user_id", existing_type=sa.Integer(), nullable=True)
    op.drop_constraint("experiences_user_id_fkey", "experiences", type_="foreignkey")
    op.create_foreign_key(
        "experiences_user_id_fkey",
        "experiences",
        "users",
        ["user_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_index("ix_experiences_template_slug", "experiences", ["template_slug"], unique=False)
    op.create_index("ix_experiences_customer_email", "experiences", ["customer_email"], unique=False)
    op.create_index("ix_experiences_deleted_at", "experiences", ["deleted_at"], unique=False)

    op.add_column("experience_media", sa.Column("uuid", sa.Uuid(), nullable=True))
    op.execute(sa.text("UPDATE experience_media SET uuid = gen_random_uuid() WHERE uuid IS NULL"))
    op.alter_column("experience_media", "uuid", nullable=False)
    op.create_index("ix_experience_media_uuid", "experience_media", ["uuid"], unique=True)

    op.add_column("experience_media", sa.Column("placeholder_url", sa.String(length=2048), nullable=True))
    op.execute(sa.text("UPDATE experience_media SET placeholder_url = file_url WHERE placeholder_url IS NULL"))

    op.add_column(
        "experience_media",
        sa.Column(
            "upload_status",
            postgresql.ENUM(
                "placeholder",
                "pending",
                "uploaded",
                "failed",
                name="media_upload_status",
                create_type=False,
            ),
            nullable=False,
            server_default="placeholder",
        ),
    )
    op.add_column("experience_media", sa.Column("alt_text", sa.String(length=255), nullable=True))
    op.add_column(
        "experience_media",
        sa.Column("cloudinary_public_id", sa.String(length=512), nullable=True),
    )
    op.add_column(
        "experience_media",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
    )

    op.execute(
        sa.text(
            "UPDATE experiences SET status = 'payment_pending' WHERE status = 'pending_payment'",
        ),
    )


def downgrade() -> None:
    op.drop_column("experience_media", "updated_at")
    op.drop_column("experience_media", "cloudinary_public_id")
    op.drop_column("experience_media", "alt_text")
    op.drop_column("experience_media", "upload_status")
    op.drop_column("experience_media", "placeholder_url")
    op.drop_index("ix_experience_media_uuid", table_name="experience_media")
    op.drop_column("experience_media", "uuid")

    op.drop_index("ix_experiences_deleted_at", table_name="experiences")
    op.drop_index("ix_experiences_customer_email", table_name="experiences")
    op.drop_index("ix_experiences_template_slug", table_name="experiences")

    op.drop_constraint("experiences_user_id_fkey", "experiences", type_="foreignkey")
    op.create_foreign_key(
        "experiences_user_id_fkey",
        "experiences",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_column("experiences", "deleted_at")
    op.drop_column("experiences", "experience_data")
    op.drop_column("experiences", "published_version")
    op.drop_column("experiences", "preview_version")
    op.drop_column("experiences", "customer_mobile")
    op.drop_column("experiences", "customer_email")
    op.drop_column("experiences", "customer_name")
    op.drop_column("experiences", "template_slug")

    sa.Enum(name="media_upload_status").drop(op.get_bind(), checkfirst=True)
