"""EmailLog repository — persistence only."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.email_log import EmailLog


class EmailLogRepository:
    def get_latest_for_experience(
        self,
        db: Session,
        experience_id: int,
        *,
        email_type: str = "experience_ready",
    ) -> EmailLog | None:
        return db.scalars(
            select(EmailLog)
            .where(
                EmailLog.experience_id == experience_id,
                EmailLog.email_type == email_type,
            )
            .order_by(EmailLog.id.desc())
        ).first()

    def list_for_experience(self, db: Session, experience_id: int) -> list[EmailLog]:
        return list(
            db.scalars(
                select(EmailLog)
                .where(EmailLog.experience_id == experience_id)
                .order_by(EmailLog.id.desc())
            ).all()
        )

    def add(self, db: Session, row: EmailLog) -> EmailLog:
        db.add(row)
        db.flush()
        return row

    def save(self, db: Session, row: EmailLog) -> EmailLog:
        db.add(row)
        db.flush()
        return row


email_log_repository = EmailLogRepository()
