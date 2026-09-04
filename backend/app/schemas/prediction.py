"""
Pydantic schemas for cryptocurrency price prediction and evaluation metrics outputs.

Designed for future FastAPI route response validation.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Input payload for generating price predictions."""
    ticker: str = Field(..., description="Cryptocurrency ticker symbol or name (e.g. BTC-USD, BTC, Bitcoin)")


class ModelStatusResponse(BaseModel):
    """Pydantic schema for model status endpoint response."""
    ticker: str
    cryptocurrency: str
    data_available: bool
    model_available: bool
    prediction_available: bool = True
    training_status: str
    available_history_days: Optional[int] = None
    lookback_days: Optional[int] = None
    model_age_hours: Optional[float] = None
    is_stale: Optional[bool] = False
    message: str


class CryptoPredictionResponse(BaseModel):
    """
    Pydantic schema for single-cryptocurrency price forecast output.
    """
    cryptocurrency: str = Field(..., description="Full cryptocurrency name (e.g. Bitcoin)")
    ticker: str = Field(..., description="Trading ticker symbol (e.g. BTC-USD)")
    symbol: str = Field(..., description="Base asset symbol (e.g. BTC)")
    quote_currency: str = Field(..., description="Quote currency (e.g. USD)")
    current_price: float = Field(..., description="Most recent actual historical closing price")
    predicted_price: float = Field(..., description="Model predicted next closing price in USD scale")
    expected_change_percent: float = Field(..., description="Percentage difference between predicted and current price")
    last_data_date: str = Field(..., description="Date of latest historical observation (YYYY-MM-DD)")
    forecast_date: str = Field(..., description="Target forecast date (YYYY-MM-DD)")
    sequence_length: int = Field(60, description="Input lookback sequence length in days")
    available_history_days: Optional[int] = Field(None, description="Total valid historical days available")
    lookback_days: Optional[int] = Field(None, description="Selected adaptive lookback window in days")
    prediction_available: bool = Field(True, description="Whether an LSTM prediction is available")
    model_name: str = Field(..., description="Trained model artifact filename")
    scenarios: Optional[Dict[str, Any]] = Field(None, description="Scenario analysis (best, expected, worst case)")
    sources: Optional[Dict[str, Any]] = Field(None, description="Source metadata for market, historical, and model inputs")
    data_used: Optional[Dict[str, Any]] = Field(None, description="Detailed analysis input parameters and limitations")

    class Config:
        json_schema_extra = {
            "example": {
                "cryptocurrency": "Bitcoin",
                "ticker": "BTC-USD",
                "symbol": "BTC",
                "quote_currency": "USD",
                "current_price": 95432.50,
                "predicted_price": 97850.25,
                "expected_change_percent": 2.53,
                "last_data_date": "2026-08-11",
                "forecast_date": "2026-08-12",
                "sequence_length": 60,
                "available_history_days": 365,
                "lookback_days": 60,
                "prediction_available": True,
                "model_name": "BTC-USD_lstm_60d.keras"
            }
        }


class ModelEvaluationMetrics(BaseModel):
    """
    Pydantic schema for test-set evaluation metrics.
    """
    cryptocurrency: str
    ticker: str
    mae: float = Field(..., description="Mean Absolute Error in original USD scale")
    mse: float = Field(..., description="Mean Squared Error in original USD scale")
    rmse: float = Field(..., description="Root Mean Squared Error in original USD scale")
    r2: float = Field(..., description="Coefficient of Determination (R²) score")
    train_samples: int
    test_samples: int
    test_start_date: str
    test_end_date: str


class CryptoDecisionResponse(BaseModel):
    """
    Pydantic schema for AI Decision-Support Endpoint.
    """
    cryptocurrency: str = Field(..., description="Cryptocurrency name")
    ticker: str = Field(..., description="Yahoo Finance ticker symbol")
    current_price: float = Field(..., description="Latest actual close price in USD")
    predicted_price: Optional[float] = Field(None, description="LSTM predicted next close price in USD")
    expected_change_percent: Optional[float] = Field(None, description="Expected percentage movement")
    confidence_score: Optional[float] = Field(None, description="Model confidence score [0-100]")
    confidence_label: str = Field(..., description="Confidence label (HIGH, MODERATE, LOW)")
    volatility: Optional[float] = Field(None, description="Historical daily returns volatility percentage")
    volatility_label: str = Field(..., description="Volatility rating (LOW, MEDIUM, HIGH)")
    risk_score: Optional[float] = Field(None, description="Risk rating score [0-100]")
    risk_label: str = Field(..., description="Risk rating (LOW, MEDIUM, HIGH)")
    decision_score: float = Field(..., description="Overall decision score [0-100]")
    decision: str = Field(..., description="Decision support signal: CONSIDER, WAIT, AVOID, or UNAVAILABLE")
    signal_summary: Optional[str] = Field(None, description="Plain-language dynamic summary sentence for the signal")
    supporting_factors: List[str] = Field(..., description="Dynamically generated supporting factors")
    risk_factors: List[str] = Field(..., description="Dynamically generated risk factors")
    last_available_date: Optional[str] = Field(None, description="Latest observation date string")
    forecast_date: Optional[str] = Field(None, description="Target prediction date string")
    prediction_available: bool = Field(True, description="Whether prediction and decision support are available")


