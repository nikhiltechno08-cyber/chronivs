"""Mock payment provider unit tests."""

from __future__ import annotations

import pytest

from app.core import config as config_mod
from app.payments import factory as factory_mod
from app.payments import mock_provider as mock_mod
from app.payments.factory import clear_payment_gateway_cache, get_payment_gateway
from app.payments.mock_provider import MockPaymentProvider


def _reload_settings(monkeypatch: pytest.MonkeyPatch, **env: str) -> None:
    for key, value in env.items():
        monkeypatch.setenv(key, value)
    config_mod.get_settings.cache_clear()
    clear_payment_gateway_cache()
    fresh = config_mod.get_settings()
    monkeypatch.setattr(config_mod, "settings", fresh)
    monkeypatch.setattr(mock_mod, "settings", fresh)
    monkeypatch.setattr(factory_mod, "settings", fresh)


@pytest.fixture(autouse=True)
def _dev_mock_defaults(monkeypatch: pytest.MonkeyPatch):
    _reload_settings(
        monkeypatch,
        APP_ENV="development",
        PAYMENT_PROVIDER="mock",
        MOCK_PAYMENT_RESULT="success",
    )
    yield
    config_mod.get_settings.cache_clear()
    clear_payment_gateway_cache()


def test_factory_returns_mock_in_development():
    gateway = get_payment_gateway()
    assert gateway.provider_name == "mock"
    assert isinstance(gateway, MockPaymentProvider)


def test_mock_create_order_ids():
    provider = MockPaymentProvider()
    order = provider.create_order(
        amount_minor=19900,
        currency="INR",
        receipt="exp_test",
        notes={"experience_id": "x"},
    )
    assert order.order_id.startswith("order_mock_")
    assert order.amount == 19900
    assert order.currency == "INR"


def test_mock_verify_success():
    provider = MockPaymentProvider()
    assert (
        provider.verify_signature(
            order_id="order_mock_abc",
            payment_id="pay_mock_abc",
            signature="mock_signature_abc",
        )
        is True
    )


def test_mock_verify_failure(monkeypatch: pytest.MonkeyPatch):
    _reload_settings(
        monkeypatch,
        APP_ENV="development",
        PAYMENT_PROVIDER="mock",
        MOCK_PAYMENT_RESULT="failure",
    )
    provider = MockPaymentProvider()
    assert (
        provider.verify_signature(
            order_id="order_mock_abc",
            payment_id="pay_mock_abc",
            signature="mock_signature_abc",
        )
        is False
    )


def test_production_rejects_mock(monkeypatch: pytest.MonkeyPatch):
    _reload_settings(
        monkeypatch,
        APP_ENV="production",
        PAYMENT_PROVIDER="mock",
        MOCK_PAYMENT_RESULT="success",
    )
    with pytest.raises(RuntimeError, match="not allowed when APP_ENV=production"):
        get_payment_gateway()
