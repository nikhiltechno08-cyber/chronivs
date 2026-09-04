"""Publish engine fields for published_experiences + experiences.published_by

Revision ID: 20260723_0007
Revises: 20260723_0006
Create Date: 2026-07-23

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260723_0007"
down_revision: Union[str, None] = "20260723_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "published_experiences",
        sa.Column(
            "public_uuid",
            sa.Uuid(as_uuid=True),
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
    )
    op.add_column(
        "published_experiences",
        sa.Column("public_url", sa.String(length=2048), nullable=True),
    )
    op.add_column(
        "published_experiences",
        sa.Column("template_id", sa.String(length=128), nullable=True),
    )
    op.add_column(
        "published_experiences",
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "published_experiences",
        sa.Column("status", sa.String(length=32), nullable=False, server_default="published"),
    )
    op.add_column(
        "published_experiences",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "published_experiences",
        sa.Column("published_by", sa.String(length=320), nullable=True),
    )
    op.add_column(
        "published_experiences",
        sa.Column(
            "experience_snapshot",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
    )
    op.add_column(
        "published_experiences",
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_index(
        "ix_published_experiences_public_uuid",
        "published_experiences",
        ["public_uuid"],
        unique=True,
    )
    op.create_index(
        "ix_published_experiences_status",
        "published_experiences",
        ["status"],
        unique=False,
    )
    op.alter_column("published_experiences", "public_uuid", server_default=None)

    op.add_column(
        "experiences",
        sa.Column("published_by", sa.String(length=320), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("experiences", "published_by")
    op.drop_index("ix_published_experiences_status", table_name="published_experiences")
    op.drop_index("ix_published_experiences_public_uuid", table_name="published_experiences")
    op.drop_column("published_experiences", "expires_at")
    op.drop_column("published_experiences", "experience_snapshot")
    op.drop_column("published_experiences", "published_by")
    op.drop_column("published_experiences", "version")
    op.drop_column("published_experiences", "status")
    op.drop_column("published_experiences", "published_at")
    op.drop_column("published_experiences", "template_id")
    op.drop_column("published_experiences", "public_url")
    op.drop_column("published_experiences", "public_uuid")
