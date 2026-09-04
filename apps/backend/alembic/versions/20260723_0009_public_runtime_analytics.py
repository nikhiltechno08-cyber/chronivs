"""Public runtime analytics events

Revision ID: 20260723_0009
Revises: 20260723_0008
Create Date: 2026-07-23

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260723_0009"
down_revision: Union[str, None] = "20260723_0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "experience_analytics_events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("uuid", sa.Uuid(), nullable=False),
        sa.Column("published_experience_id", sa.Integer(), nullable=False),
        sa.Column("public_slug", sa.String(length=128), nullable=False),
        sa.Column("event", sa.String(length=64), nullable=False),
        sa.Column("scene_id", sa.String(length=128), nullable=True),
        sa.Column("watch_ms", sa.Integer(), nullable=True),
        sa.Column("device_type", sa.String(length=64), nullable=True),
        sa.Column("country", sa.String(length=8), nullable=True),
        sa.Column("event_metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["published_experience_id"],
            ["published_experiences.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid"),
    )
    op.create_index(
        "ix_experience_analytics_events_uuid",
        "experience_analytics_events",
        ["uuid"],
        unique=False,
    )
    op.create_index(
        "ix_experience_analytics_events_published_experience_id",
        "experience_analytics_events",
        ["published_experience_id"],
        unique=False,
    )
    op.create_index(
        "ix_experience_analytics_events_public_slug",
        "experience_analytics_events",
        ["public_slug"],
        unique=False,
    )
    op.create_index(
        "ix_experience_analytics_events_event",
        "experience_analytics_events",
        ["event"],
        unique=False,
    )
    op.create_index(
        "ix_experience_analytics_events_created_at",
        "experience_analytics_events",
        ["created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_experience_analytics_events_created_at", table_name="experience_analytics_events")
    op.drop_index("ix_experience_analytics_events_event", table_name="experience_analytics_events")
    op.drop_index("ix_experience_analytics_events_public_slug", table_name="experience_analytics_events")
    op.drop_index(
        "ix_experience_analytics_events_published_experience_id",
        table_name="experience_analytics_events",
    )
    op.drop_index("ix_experience_analytics_events_uuid", table_name="experience_analytics_events")
    op.drop_table("experience_analytics_events")
