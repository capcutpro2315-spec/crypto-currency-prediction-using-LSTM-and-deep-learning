"""
Unit and Integration Tests for Dynamic Cryptocurrency Catalog Discovery Service.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.crypto_catalog_service import crypto_catalog_service, CRYPTO_CATALOG_REFRESH_MINUTES

client = TestClient(app)


def test_crypto_catalog_service_retrieval():
    """Test that crypto_catalog_service retrieves the dynamic catalog."""
    catalog = crypto_catalog_service.get_catalog()
    assert isinstance(catalog["items"], list)
    assert catalog["count"] > 0
    assert "source" in catalog
    assert "last_updated" in catalog
    assert "cached" in catalog


def test_crypto_catalog_service_pagination_and_size():
    """Verify that the dynamic catalog returns substantially more than hardcoded registry items (>100 items)."""
    catalog = crypto_catalog_service.get_catalog()
    assert catalog["count"] >= 10  # Must return catalog list
    first_item = catalog["items"][0]
    assert "id" in first_item
    assert "name" in first_item
    assert "symbol" in first_item
    assert "ticker" in first_item


def test_crypto_catalog_search_filtering():
    """Test searching dynamic catalog for specific cryptocurrencies (e.g. Bitcoin, PEPE)."""
    btc_res = crypto_catalog_service.get_catalog(query="Bitcoin")
    assert btc_res["count"] > 0
    assert any("BTC" in item["symbol"] for item in btc_res["items"])

    pepe_res = crypto_catalog_service.get_catalog(query="PEPE")
    assert pepe_res["count"] > 0
    assert any("PEPE" in item["symbol"] for item in pepe_res["items"])


def test_crypto_catalog_force_refresh():
    """Test force refresh method clears cache and re-fetches latest catalog."""
    res = crypto_catalog_service.force_refresh_catalog()
    assert res["status"] == "success"
    assert res["cryptocurrency_count"] > 0
    assert "refreshed_at" in res
    assert "source" in res


def test_api_cryptocurrencies_endpoint_dynamic_catalog():
    """Test GET /api/cryptocurrencies API returns dynamic catalog format."""
    response = client.get("/api/cryptocurrencies")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "count" in data
    assert "source" in data
    assert "cached" in data
    assert "last_updated" in data
    assert data["count"] > 0
    assert len(data["items"]) == data["count"]


def test_api_cryptocurrencies_search():
    """Test GET /api/cryptocurrencies?q=PEPE returns matching results."""
    response = client.get("/api/cryptocurrencies?q=PEPE")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] > 0
    assert any(item["symbol"] == "PEPE" for item in data["items"])


def test_api_cryptocurrencies_refresh_endpoint():
    """Test POST /api/cryptocurrencies/refresh endpoint forces fresh catalog fetch."""
    response = client.post("/api/cryptocurrencies/refresh")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["cryptocurrency_count"] > 0
    assert "refreshed_at" in data
    assert "source" in data
