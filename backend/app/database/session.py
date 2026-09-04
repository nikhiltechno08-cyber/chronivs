"""SQLAlchemy engine, session factory, and FastAPI dependency."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


def resolve_database_url() -> str:
    """Return configured DATABASE_URL or a local placeholder for import-time use."""
    if settings.DATABASE_URL.strip():
        return settings.DATABASE_URL.strip()
    # Placeholder so the app module can import without a configured .env.
    # Set DATABASE_URL before connecting or running migrations.
    return "postgresql+psycopg2://postgres:postgres@localhost:5432/chronivs"


engine = create_engine(
    resolve_database_url(),
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=Session,
)


def get_db() -> Generator[Session, None, None]:
    """Yield a database session for FastAPI route dependencies."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
