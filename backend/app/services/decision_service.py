"""
AI Risk, Confidence, and Investment Decision-Support Engine.

Analyzes LSTM model price forecasts, historical market volatility, and statistical
evaluation metrics to generate structured decision-support signals (CONSIDER, WAIT, AVOID),
confidence scores, risk ratings, and human-readable explanations.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

# Decision signal constants
SIGNAL_CONSIDER = "CONSIDER"
SIGNAL_WAIT = "WAIT"
SIGNAL_AVOID = "AVOID"

# Risk rating constants
RISK_LOW = "LOW"
RISK_MEDIUM = "MEDIUM"
RISK_HIGH = "HIGH"

# Volatility rating constants
VOLATILITY_LOW = "LOW"
VOLATILITY_MEDIUM = "MEDIUM"
VOLATILITY_HIGH = "HIGH"


def calculate_historical_volatility(
    close_prices: pd.Series | List[float] | np.ndarray,
    window: int = 30,
) -> Tuple[Optional[float], str]:
    """
    Calculate simple historical volatility from daily percentage returns.

    Args:
        close_prices: Historical closing price series
        window: Number of recent daily observations to use (default 30)

    Returns:
        Tuple of (volatility_percent, volatility_label)
    """
    series = pd.Series(close_prices).dropna()
    if len(series) < 5:
        return None, "UNKNOWN"

    recent_series = series.iloc[-window:] if len(series) > window else series
    daily_returns = recent_series.pct_change().dropna()

    if len(daily_returns) == 0:
        return None, "UNKNOWN"

    std_dev = float(daily_returns.std())
    volatility_percent = std_dev * 100.0

    if volatility_percent < 2.0:
        label = VOLATILITY_LOW
    elif volatility_percent <= 4.5:
        label = VOLATILITY_MEDIUM
    else:
        label = VOLATILITY_HIGH

    return round(volatility_percent, 2), label


def calculate_model_confidence(
    metrics: Optional[Dict[str, Any]],
    current_price: float,
) -> Tuple[Optional[float], str]:
    """
    Calculate a transparent Model Confidence Score based on historical test performance.

    Confidence represents how reliable the model has historically been under test conditions,
    NOT a statistical probability of future market outcomes.

    Args:
        metrics: Saved model evaluation metrics dictionary (MAE, MSE, RMSE, R2)
        current_price: Current asset closing price in USD

    Returns:
        Tuple of (confidence_score [0-100], confidence_label)
    """
    if not metrics or "rmse" not in metrics:
        return None, "Confidence unavailable (insufficient evaluation metrics)"

    r2 = metrics.get("r2", 0.0)
    rmse = metrics.get("rmse", 0.0)

    if current_price <= 0:
        return None, "Confidence unavailable (invalid current price)"

    # 1. Base score derived from test set R² (variance explained)
    r2_clamped = max(0.0, min(1.0, r2 if r2 is not None else 0.0))
    base_score = r2_clamped * 100.0

    # 2. Relative RMSE penalty (% of current price)
    rel_rmse_percent = (rmse / current_price) * 100.0
    error_penalty = min(40.0, rel_rmse_percent * 5.0)

    # 3. Final score clamped 0 - 100
    confidence_score = max(0.0, min(100.0, base_score - error_penalty))
    confidence_score = round(confidence_score, 1)

    if confidence_score >= 75.0:
        label = "HIGH"
    elif confidence_score >= 50.0:
        label = "MODERATE"
    else:
        label = "LOW"

    return confidence_score, label


def calculate_risk_level(
    volatility: Optional[float],
    volatility_label: str,
    confidence_score: Optional[float],
    expected_change_percent: float,
) -> Tuple[float, str]:
    """
    Calculate a transparent Risk Rating combining volatility, confidence, and forecast magnitude.

    Returns:
        Tuple of (risk_score [0-100], risk_label)
    """
    # Volatility penalty component
    if volatility_label == VOLATILITY_HIGH:
        vol_score = 40.0
    elif volatility_label == VOLATILITY_MEDIUM:
        vol_score = 25.0
    else:
        vol_score = 10.0

    # Confidence component (lower confidence -> higher risk)
    if confidence_score is not None:
        conf_risk = max(0.0, (100.0 - confidence_score) * 0.4)
    else:
        conf_risk = 30.0  # Default penalty when confidence is unknown

    # Forecast magnitude risk (large price swings increase risk profile)
    magnitude_risk = min(30.0, abs(expected_change_percent) * 4.0)

    risk_score = round(max(0.0, min(100.0, vol_score + conf_risk + magnitude_risk)), 1)

    if risk_score >= 60.0:
        risk_label = RISK_HIGH
    elif risk_score >= 35.0:
        risk_label = RISK_MEDIUM
    else:
        risk_label = RISK_LOW

    return risk_score, risk_label


def generate_decision_support(
    current_price: float,
    predicted_price: float,
    expected_change_percent: float,
    close_prices: pd.Series | List[float] | np.ndarray,
    metrics: Optional[Dict[str, Any]] = None,
    cryptocurrency: str = "Cryptocurrency",
    ticker: str = "ASSET-USD",
    last_available_date: str = "",
    forecast_date: str = "",
) -> Dict[str, Any]:
    """
    Generate complete AI Decision Support analysis for a cryptocurrency forecast.

    Args:
        current_price: Latest actual closing price in USD
        predicted_price: LSTM model predicted next closing price in USD
        expected_change_percent: Percentage change from current to predicted price
        close_prices: Historical closing price sequence for volatility analysis
        metrics: Optional saved evaluation metrics dictionary
        cryptocurrency: Cryptocurrency name (e.g. Bitcoin)
        ticker: Symbol ticker (e.g. BTC-USD)
        last_available_date: Date string of latest observation
        forecast_date: Target prediction date string

    Returns:
        Structured decision response dictionary matching DecisionResponse schema.
    """
    # 1. Volatility
    volatility, volatility_label = calculate_historical_volatility(close_prices)

    # 2. Confidence
    confidence_score, confidence_label = calculate_model_confidence(metrics, current_price)

    # 3. Risk Rating
    risk_score, risk_label = calculate_risk_level(
        volatility, volatility_label, confidence_score, expected_change_percent
    )

    # 4. Decision Score Calculation (0 - 100)
    base_score = 50.0

    # Forecast movement component (+/- points)
    if expected_change_percent >= 0:
        forecast_component = min(35.0, expected_change_percent * 4.0)
    else:
        forecast_component = max(-40.0, expected_change_percent * 5.0)

    # Confidence component
    if confidence_score is not None:
        conf_component = (confidence_score - 50.0) * 0.3
    else:
        conf_component = -10.0

    # Risk penalty component
    if risk_label == RISK_HIGH:
        risk_penalty = 25.0
    elif risk_label == RISK_MEDIUM:
        risk_penalty = 10.0
    else:
        risk_penalty = 0.0

    raw_decision_score = base_score + forecast_component + conf_component - risk_penalty
    decision_score = round(max(0.0, min(100.0, raw_decision_score)), 1)

    # 5. Signal Mapping
    if decision_score >= 80.0:
        decision_signal = SIGNAL_CONSIDER
    elif decision_score >= 60.0:
        decision_signal = SIGNAL_WAIT
    elif decision_score >= 40.0:
        decision_signal = SIGNAL_WAIT
    else:
        decision_signal = SIGNAL_AVOID

    # 6. Strong Signal Protection Rule
    # Overly positive predicted increase MUST NOT produce CONSIDER if confidence is low or risk is high
    if decision_signal == SIGNAL_CONSIDER:
        if (confidence_score is not None and confidence_score < 60.0) or risk_label == RISK_HIGH:
            decision_signal = SIGNAL_WAIT

    # 7. Generate Dynamic Human-Readable Factors & Overall Signal Summary
    supporting_factors: List[str] = []
    risk_factors: List[str] = []

    # Dynamic supporting factors (plain language)
    if expected_change_percent > 0:
        supporting_factors.append(
            f"The AI analysis currently expects positive price movement (+{expected_change_percent:.2f}%)."
        )
    if confidence_score is not None and confidence_score >= 60.0:
        supporting_factors.append(
            f"The AI model has shown a solid ability to follow {cryptocurrency}'s past price movements."
        )
    if metrics and metrics.get("r2") is not None and metrics["r2"] > 0.5:
        supporting_factors.append(
            "The model successfully captured most of the price trends during historical testing."
        )
    if volatility_label == VOLATILITY_LOW:
        supporting_factors.append(
            "Recent price movements have been relatively stable, so the coin has not been swinging sharply."
        )
    if not supporting_factors:
        supporting_factors.append(
            f"Historical price series for {cryptocurrency} is currently being tracked against sequence patterns."
        )

    # Dynamic risk factors (plain language)
    if expected_change_percent < 0:
        risk_factors.append(
            f"The AI analysis currently expects downward price movement ({expected_change_percent:.2f}%)."
        )
    elif abs(expected_change_percent) <= 1.0:
        risk_factors.append(
            "The expected price movement is small, so the signal is not strongly positive."
        )
    if volatility_label == VOLATILITY_HIGH:
        risk_factors.append(
            "Recent trading has shown high price volatility, increasing short-term uncertainty."
        )
    if risk_label == RISK_HIGH:
        risk_factors.append(
            "The overall risk profile is elevated due to market volatility or model uncertainty."
        )
    if confidence_score is not None and confidence_score < 50.0:
        risk_factors.append(
            "The model's historical test performance showed lower consistency on past data."
        )
    elif confidence_score is None:
        risk_factors.append(
            "Model confidence is unavailable due to missing test set evaluation metrics."
        )

    risk_factors.append(
        "Cryptocurrency prices can change rapidly due to unexpected market events or news."
    )

    # 8. Dynamic One-Sentence Signal Summary
    if decision_signal == SIGNAL_CONSIDER:
        signal_summary = f"Overall, the current analysis is positive because the AI forecasts upward price movement with acceptable model performance for {cryptocurrency}."
    elif decision_signal == SIGNAL_WAIT:
        if abs(expected_change_percent) <= 1.5:
            signal_summary = f"Overall, the current analysis suggests waiting because the expected price movement for {cryptocurrency} is small and the market remains uncertain."
        else:
            signal_summary = f"Overall, the current analysis suggests caution for {cryptocurrency} due to elevated market volatility or mixed model indicators."
    else:
        signal_summary = f"Overall, the current analysis advises caution for {cryptocurrency} because the forecast points downward or market risk is high."

    return {
        "cryptocurrency": cryptocurrency,
        "ticker": ticker,
        "current_price": current_price,
        "predicted_price": predicted_price,
        "expected_change_percent": round(expected_change_percent, 2),
        "confidence_score": confidence_score,
        "confidence_label": confidence_label,
        "volatility": volatility,
        "volatility_label": volatility_label,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "decision_score": decision_score,
        "decision": decision_signal,
        "signal_summary": signal_summary,
        "supporting_factors": supporting_factors,
        "risk_factors": risk_factors,
        "last_available_date": last_available_date,
        "forecast_date": forecast_date,
    }
