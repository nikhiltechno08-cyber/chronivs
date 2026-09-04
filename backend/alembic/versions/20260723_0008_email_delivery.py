"""Email delivery fields on email_logs

Revision ID: 20260723_0008
Revises: 20260723_0007
Create Date: 2026-07-23

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260723_0008"
down_revision: Union[str, None] = "20260723_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "email_logs",
        sa.Column("provider", sa.String(length=64), nullable=True),
    )
    op.add_column(
        "email_logs",
        sa.Column("message_id", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "email_logs",
        sa.Column("error", sa.Text(), nullable=True),
    )
    op.add_column(
        "email_logs",
        sa.Column("retry_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "email_logs",
        sa.Column("email_type", sa.String(length=64), nullable=False, server_default="experience_ready"),
    )
    op.create_index("ix_email_logs_message_id", "email_logs", ["message_id"], unique=False)
    op.create_index("ix_email_logs_email_type", "email_logs", ["email_type"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_email_logs_email_type", table_name="email_logs")
    op.drop_index("ix_email_logs_message_id", table_name="email_logs")
    op.drop_column("email_logs", "email_type")
    op.drop_column("email_logs", "retry_count")
    op.drop_column("email_logs", "error")
    op.drop_column("email_logs", "message_id")
    op.drop_column("email_logs", "provider")
