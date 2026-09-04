"""Shared FastAPI dependencies."""

from app.auth.dependencies import get_current_active_user, get_current_user
from app.database.session import get_db

__all__ = ["get_db", "get_current_user", "get_current_active_user"]
