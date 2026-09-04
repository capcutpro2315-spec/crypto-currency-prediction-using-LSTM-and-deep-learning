"""
Integration tests for FastAPI REST API endpoints using TestClient.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_api_health_endpoint():
    """Test GET /api/health returns 200 OK and status 'ok'."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "1.0.0"


def test_list_cryptocurrencies_endpoint():
    """Test GET /api/cryptocurrencies returns list of supported assets."""
    response = client.get("/api/cryptocurrencies")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "cryptocurrencies" in data
    assert data["total"] > 0
    tickers = [c["ticker"] for c in data["cryptocurrencies"]]
    assert "BTC-USD" in tickers


def test_get_crypto_history_endpoint():
    """Test GET /api/cryptocurrencies/BTC-USD/history returns historical OHLCV data."""
    response = client.get("/api/cryptocurrencies/BTC-USD/history?limit=30")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "BTC-USD"
    assert len(data["records"]) <= 30
    assert "close" in data["records"][0]
    assert "volume" in data["records"][0]


def test_get_market_summary_endpoint():
    """Test GET /api/market/BTC-USD/summary returns market summary statistics."""
    response = client.get("/api/market/BTC-USD/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "BTC-USD"
    assert "current_price" in data
    assert "historical_high" in data
    assert "historical_low" in data
    assert data["historical_high"] >= data["current_price"]


def test_create_prediction_endpoint():
    """Test POST /api/predictions generates real forecast using trained BTC model."""
    response = client.post("/api/predictions", json={"ticker": "BTC-USD"})
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "BTC-USD"
    assert data["cryptocurrency"] == "Bitcoin"
    assert "current_price" in data
    assert "predicted_price" in data
    assert "expected_change_percent" in data
    assert data["current_price"] > 0
    assert data["predicted_price"] > 0


def test_get_prediction_metrics_endpoint():
    """Test GET /api/predictions/BTC-USD/metrics returns test metrics."""
    response = client.get("/api/predictions/BTC-USD/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "BTC-USD"
    assert "metrics" in data or "mae" in data


def test_get_prediction_history_endpoint():
    """Test GET /api/predictions/BTC-USD/history returns actual vs predicted test history."""
    response = client.get("/api/predictions/BTC-USD/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "actual_close" in data[0]
    assert "predicted_close" in data[0]


def test_get_prediction_decision_endpoint():
    """Test GET /api/predictions/BTC-USD/decision returns AI decision support response."""
    response = client.get("/api/predictions/BTC-USD/decision")
    assert response.status_code == 200
    data = response.json()
    assert data["ticker"] == "BTC-USD"
    assert "decision" in data
    assert data["decision"] in ("CONSIDER", "WAIT", "AVOID")
    assert "decision_score" in data
    assert "confidence_label" in data
    assert "risk_label" in data
    assert isinstance(data["supporting_factors"], list)
    assert isinstance(data["risk_factors"], list)


def test_api_invalid_ticker_handling():
    """Test GET /api/cryptocurrencies/INVALID_SYMBOL/history returns 404 Not Found."""
    response = client.get("/api/cryptocurrencies/INVALID_SYMBOL_XYZ/history")
    assert response.status_code in (400, 404)
    data = response.json()
    assert "detail" in data



def test_api_missing_model_handling():
    """Test POST /api/predictions with a ticker having no trained model returns 404 Not Found."""
    from app.config import MODELS_SAVED_DIR
    for p in MODELS_SAVED_DIR.glob("SHIB-USD_lstm*.keras"):
        if p.exists():
            p.unlink()

    response = client.post("/api/predictions", json={"ticker": "SHIB-USD"})
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "Training LSTM model" in data["detail"]

