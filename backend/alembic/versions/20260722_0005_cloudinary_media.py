"""Cloudinary media fields for experience_media

Revision ID: 20260722_0005
Revises: 20260722_0004
Create Date: 2026-07-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260722_0005"
down_revision: Union[str, None] = "20260722_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "experience_media",
        "experience_id",
        existing_type=sa.Integer(),
        nullable=True,
    )
    op.add_column("experience_media", sa.Column("secure_url", sa.String(length=2048), nullable=True))
    op.add_column("experience_media", sa.Column("width", sa.Integer(), nullable=True))
    op.add_column("experience_media", sa.Column("height", sa.Integer(), nullable=True))
    op.add_column("experience_media", sa.Column("format", sa.String(length=32), nullable=True))
    op.add_column("experience_media", sa.Column("bytes", sa.Integer(), nullable=True))
    op.add_column(
        "experience_media",
        sa.Column("resource_type", sa.String(length=32), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("experience_media", "resource_type")
    op.drop_column("experience_media", "bytes")
    op.drop_column("experience_media", "format")
    op.drop_column("experience_media", "height")
    op.drop_column("experience_media", "width")
    op.drop_column("experience_media", "secure_url")
    op.alter_column(
        "experience_media",
        "experience_id",
        existing_type=sa.Integer(),
        nullable=False,
    )
