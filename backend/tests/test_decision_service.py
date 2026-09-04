"""
Unit tests for AI Risk, Confidence, and Decision-Support Engine.
"""

from __future__ import annotations

import pytest
import pandas as pd
import numpy as np

from app.services.decision_service import (
    calculate_historical_volatility,
    calculate_model_confidence,
    calculate_risk_level,
    generate_decision_support,
    SIGNAL_CONSIDER,
    SIGNAL_WAIT,
    SIGNAL_AVOID,
    RISK_LOW,
    RISK_MEDIUM,
    RISK_HIGH,
    VOLATILITY_LOW,
    VOLATILITY_HIGH,
)


def test_calculate_historical_volatility_low_and_high():
    """Test volatility calculation for low vs high price return variation."""
    # Stable prices -> Low volatility
    stable_prices = [100.0 + (i * 0.1) for i in range(30)]
    vol_low, label_low = calculate_historical_volatility(stable_prices)
    assert vol_low is not None
    assert vol_low < 2.0
    assert label_low == VOLATILITY_LOW

    # Volatile prices -> High volatility
    volatile_prices = [100.0 * (1.10 if i % 2 == 0 else 0.90) for i in range(30)]
    vol_high, label_high = calculate_historical_volatility(volatile_prices)
    assert vol_high is not None
    assert vol_high > 4.5
    assert label_high == VOLATILITY_HIGH


def test_calculate_model_confidence_scoring():
    """Test confidence scoring derived from R² and RMSE."""
    metrics_good = {"r2": 0.85, "rmse": 1000.0}
    score, label = calculate_model_confidence(metrics_good, current_price=50000.0)
    assert score is not None
    assert score >= 75.0
    assert label == "HIGH"

    # Missing metrics -> None
    score_none, label_none = calculate_model_confidence(None, current_price=50000.0)
    assert score_none is None
    assert "unavailable" in label_none.lower()


def test_calculate_risk_level():
    """Test risk level calculation."""
    # Low volatility, high confidence -> Low risk
    score_low, label_low = calculate_risk_level(
        volatility=1.5,
        volatility_label=VOLATILITY_LOW,
        confidence_score=85.0,
        expected_change_percent=1.2,
    )
    assert label_low == RISK_LOW

    # High volatility, low confidence -> High risk
    score_high, label_high = calculate_risk_level(
        volatility=6.0,
        volatility_label=VOLATILITY_HIGH,
        confidence_score=40.0,
        expected_change_percent=7.5,
    )
    assert label_high == RISK_HIGH


def test_decision_support_positive_forecast_acceptable_confidence():
    """Test positive forecast generates CONSIDER or WAIT signal with supporting factors."""
    prices = [50000.0 + (i * 10.0) for i in range(30)]
    metrics = {"r2": 0.80, "rmse": 1200.0}

    res = generate_decision_support(
        current_price=50000.0,
        predicted_price=51500.0,  # +3.0%
        expected_change_percent=3.0,
        close_prices=prices,
        metrics=metrics,
        cryptocurrency="Bitcoin",
        ticker="BTC-USD",
    )

    assert res["decision"] in (SIGNAL_CONSIDER, SIGNAL_WAIT)
    assert res["decision_score"] >= 60.0
    assert len(res["supporting_factors"]) > 0
    assert any("positive price movement" in s for s in res["supporting_factors"])


def test_decision_support_negative_forecast():
    """Test negative forecast generates AVOID or WAIT signal."""
    prices = [50000.0 - (i * 20.0) for i in range(30)]
    metrics = {"r2": 0.70, "rmse": 1500.0}

    res = generate_decision_support(
        current_price=50000.0,
        predicted_price=47000.0,  # -6.0%
        expected_change_percent=-6.0,
        close_prices=prices,
        metrics=metrics,
        cryptocurrency="Bitcoin",
        ticker="BTC-USD",
    )

    assert res["decision"] in (SIGNAL_AVOID, SIGNAL_WAIT)
    assert res["decision_score"] < 60.0
    assert any("downward" in r for r in res["risk_factors"])


def test_strong_signal_protection_rule():
    """Test that a large positive prediction with LOW confidence is protected to WAIT (not CONSIDER)."""
    prices = [50000.0 * (1.1 if i % 2 == 0 else 0.9) for i in range(30)]
    metrics_weak = {"r2": 0.20, "rmse": 8000.0}  # Weak confidence

    res = generate_decision_support(
        current_price=50000.0,
        predicted_price=55000.0,  # +10% positive forecast
        expected_change_percent=10.0,
        close_prices=prices,
        metrics=metrics_weak,
        cryptocurrency="Bitcoin",
        ticker="BTC-USD",
    )

    # Strong signal protection must override CONSIDER to WAIT
    assert res["decision"] != SIGNAL_CONSIDER
    assert res["decision"] in (SIGNAL_WAIT, SIGNAL_AVOID)


def test_decision_support_missing_confidence_metrics():
    """Test graceful handling when model metrics are missing."""
    prices = [50000.0 + i for i in range(30)]

    res = generate_decision_support(
        current_price=50000.0,
        predicted_price=50500.0,
        expected_change_percent=1.0,
        close_prices=prices,
        metrics=None,  # No metrics
        cryptocurrency="Bitcoin",
        ticker="BTC-USD",
    )

    assert res["confidence_score"] is None
    assert "unavailable" in res["confidence_label"].lower()
    assert res["decision"] in (SIGNAL_CONSIDER, SIGNAL_WAIT, SIGNAL_AVOID)


def test_boundary_values_decision_score_classification():
    """Test decision score boundary value signal classification."""
    prices = [100.0] * 30

    # 1. High score -> CONSIDER
    res_high = generate_decision_support(
        current_price=100.0,
        predicted_price=108.0,
        expected_change_percent=8.0,
        close_prices=prices,
        metrics={"r2": 0.90, "rmse": 1.0},
    )
    assert res_high["decision_score"] >= 75.0
    assert res_high["decision"] in (SIGNAL_CONSIDER, SIGNAL_WAIT)

    # 2. Low score -> AVOID
    res_low = generate_decision_support(
        current_price=100.0,
        predicted_price=85.0,
        expected_change_percent=-15.0,
        close_prices=prices,
        metrics={"r2": 0.30, "rmse": 10.0},
    )
    assert res_low["decision_score"] < 40.0
    assert res_low["decision"] == SIGNAL_AVOID
