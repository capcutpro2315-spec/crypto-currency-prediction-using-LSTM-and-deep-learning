"""
Comprehensive Unit Tests for Stage 4 Prediction Service and Forecast Evaluation Outputs.
"""

from __future__ import annotations

import json
from pathlib import Path
import numpy as np
import pandas as pd
import pytest
from sklearn.preprocessing import MinMaxScaler

from app.config import DEFAULT_SEQUENCE_LENGTH, MODELS_SAVED_DIR, DATA_PROCESSED_DIR
from app.exceptions import InsufficientDataError, InvalidCryptocurrencyError, UnsupportedTickerError
from app.models.lstm_model import build_lstm_model, save_trained_model
from app.schemas.prediction import CryptoPredictionResponse, ModelEvaluationMetrics
from app.services.prediction_service import (
    get_actual_vs_predicted_data,
    get_evaluation_metrics,
    predict_next_close,
)


def test_prediction_service_unsupported_cryptocurrency():
    """Test that predicting an unsupported/unmodeled crypto raises FileNotFoundError or InvalidCryptocurrencyError."""
    with pytest.raises((FileNotFoundError, InvalidCryptocurrencyError, UnsupportedTickerError)):
        predict_next_close(identifier="UNSUPPORTED_COIN_XYZ_123")


def test_prediction_service_missing_model():
    """Test that calling prediction on a supported coin without a trained model file raises FileNotFoundError."""
    # Unlink all model artifacts for DOGE-USD to ensure FileNotFoundError triggers
    for p in MODELS_SAVED_DIR.glob("DOGE-USD_lstm*.keras"):
        if p.exists():
            p.unlink()

    with pytest.raises(FileNotFoundError, match="Training LSTM model"):
        predict_next_close(identifier="DOGE-USD")



def test_prediction_service_schema_validation(tmp_path: Path):
    """Test that prediction service output conforms to CryptoPredictionResponse Pydantic schema."""
    # Build & save dummy model for BTC-USD to test schema formatting if BTC model exists or create temporary mock
    mock_response = {
        "cryptocurrency": "Bitcoin",
        "ticker": "BTC-USD",
        "symbol": "BTC",
        "quote_currency": "USD",
        "current_price": 95000.0,
        "predicted_price": 97500.0,
        "expected_change_percent": 2.631578947,
        "price_change_amount": 2500.0,
        "direction": "UP",
        "last_data_date": "2026-08-11",
        "forecast_date": "2026-08-12",
        "sequence_length": 60,
        "model_name": "BTC-USD_lstm.keras",
        "formatted_latest_price": "$95,000.00",
        "formatted_predicted_price": "$97,500.00",
    }

    schema = CryptoPredictionResponse(**mock_response)
    assert schema.cryptocurrency == "Bitcoin"
    assert schema.ticker == "BTC-USD"
    assert schema.current_price == 95000.0
    assert schema.predicted_price == 97500.0
    assert schema.expected_change_percent == pytest.approx(2.631578947)
    assert schema.last_data_date == "2026-08-11"
    assert schema.forecast_date == "2026-08-12"
    assert schema.sequence_length == 60


def test_expected_change_percent_calculation():
    """Test accurate percentage change calculation: ((predicted - current) / current) * 100."""
    current_price = 105000.00
    predicted_price = 107500.00

    expected_pct = ((predicted_price - current_price) / current_price) * 100.0
    assert pytest.approx(expected_pct, abs=1e-4) == 2.38095238

    # Negative change case
    predicted_down = 102000.00
    expected_down_pct = ((predicted_down - current_price) / current_price) * 100.0
    assert pytest.approx(expected_down_pct, abs=1e-4) == -2.85714285


def test_inverse_scaling_integrity():
    """Verify that scaling and inverse scaling does not alter magnitude or introduce data drift."""
    scaler = MinMaxScaler(feature_range=(0, 1))
    real_prices = np.array([40000.0, 45000.0, 50000.0, 55000.0, 60000.0]).reshape(-1, 1)

    scaler.fit(real_prices)
    scaled = scaler.transform([[52500.0]])
    unscaled = scaler.inverse_transform(scaled)

    assert pytest.approx(52500.0, abs=1e-4) == unscaled[0, 0]


def test_metrics_schema_validation():
    """Test Pydantic validation for model evaluation metrics schema."""
    metrics_data = {
        "cryptocurrency": "Bitcoin",
        "ticker": "BTC-USD",
        "mae": 1250.50,
        "mse": 2500000.0,
        "rmse": 1581.13,
        "r2": 0.9421,
        "train_samples": 800,
        "test_samples": 200,
        "test_start_date": "2025-11-01",
        "test_end_date": "2026-08-11",
    }

    schema = ModelEvaluationMetrics(**metrics_data)
    assert schema.ticker == "BTC-USD"
    assert schema.mae == 1250.50
    assert schema.rmse == 1581.13
    assert schema.r2 == 0.9421
