"""Auth user fields and token blacklist

Revision ID: 20260721_0002
Revises: 20260721_0001
Create Date: 2026-07-21

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260721_0002"
down_revision: Union[str, None] = "20260721_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.add_column(
        "users",
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "users",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.add_column("users", sa.Column("last_login", sa.DateTime(timezone=True), nullable=True))

    op.create_table(
        "token_blacklist",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("jti", sa.String(length=64), nullable=False),
        sa.Column("token_type", sa.String(length=32), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("jti"),
    )
    op.create_index("ix_token_blacklist_jti", "token_blacklist", ["jti"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_token_blacklist_jti", table_name="token_blacklist")
    op.drop_table("token_blacklist")
    op.drop_column("users", "last_login")
    op.drop_column("users", "is_active")
    op.drop_column("users", "is_verified")
    op.drop_column("users", "password_hash")
