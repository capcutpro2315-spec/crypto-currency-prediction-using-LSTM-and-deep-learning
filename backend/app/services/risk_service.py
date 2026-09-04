"""
Market Risk Assessment Service.

Evaluates historical price volatility, drawdowns, dataset coverage length, 
and model prediction error metrics to derive transparent risk ratings, risk scores (0-100),
and dynamic risk factor lists.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd


def evaluate_market_risk(
    close_prices: pd.Series | List[float] | np.ndarray,
    metrics: Optional[Dict[str, Any]] = None,
    available_days: int = 365,
    expected_change_percent: float = 0.0,
) -> Dict[str, Any]:
    """
    Calculate structured market risk metrics for a cryptocurrency.

    Args:
        close_prices: Historical closing price series.
        metrics: Saved model evaluation metrics dictionary.
        available_days: Total usable historical daily records.
        expected_change_percent: Predicted price movement percentage.

    Returns:
        Dictionary containing risk_level (LOW/MEDIUM/HIGH), risk_score (0-100),
        volatility_percent, max_drawdown_percent, factors list, and methodology summary.
    """
    series = pd.Series(close_prices).dropna()
    if len(series) < 5:
        return {
            "risk_level": "HIGH",
            "risk_score": 85.0,
            "volatility_percent": None,
            "max_drawdown_percent": None,
            "factors": ["Insufficient historical price observations to evaluate market risk."],
            "methodology": "Limited data penalty rule.",
        }

    # 1. Historical Volatility (30-day daily return standard deviation annualized / percentage)
    recent_30 = series.iloc[-30:] if len(series) >= 30 else series
    daily_returns = recent_30.pct_change().dropna()
    volatility_pct = float(daily_returns.std() * 100.0) if len(daily_returns) > 0 else 0.0

    # 2. Maximum Drawdown (Peak to Trough over recent series)
    cumulative_max = series.cummax()
    drawdowns = (series - cumulative_max) / cumulative_max
    max_drawdown_pct = float(abs(drawdowns.min() * 100.0)) if len(drawdowns) > 0 else 0.0

    # 3. Model Error / Uncertainty Risk Component
    conf_risk = 25.0
    if metrics and "r2" in metrics:
        r2 = max(0.0, min(1.0, float(metrics.get("r2") or 0.0)))
        conf_risk = (1.0 - r2) * 35.0

    # 4. History Coverage Penalty
    coverage_risk = 0.0
    if available_days < 60:
        coverage_risk = 25.0
    elif available_days < 180:
        coverage_risk = 10.0

    # 5. Composite Risk Score Calculation
    vol_score = min(40.0, volatility_pct * 8.0)
    drawdown_score = min(25.0, max_drawdown_pct * 0.5)
    magnitude_score = min(20.0, abs(expected_change_percent) * 3.0)

    raw_score = vol_score + drawdown_score + conf_risk + coverage_risk + magnitude_score
    risk_score = round(max(0.0, min(100.0, raw_score)), 1)

    if risk_score >= 60.0:
        risk_level = "HIGH"
    elif risk_score >= 35.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Dynamic Risk Factors Generation
    factors: List[str] = []

    if volatility_pct >= 4.0:
        factors.append(f"Elevated 30-day price volatility ({volatility_pct:.2f}% daily std dev).")
    if max_drawdown_pct >= 20.0:
        factors.append(f"Significant historical drawdown peak-to-trough ({max_drawdown_pct:.1f}%).")
    if available_days < 90:
        factors.append(f"Limited historical dataset coverage ({available_days} days).")
    if expected_change_percent < -3.0:
        factors.append(f"LSTM model forecasts a negative price trend ({expected_change_percent:.2f}%).")
    if metrics and metrics.get("r2") is not None and metrics["r2"] < 0.5:
        factors.append("LSTM model test set variance explanation (R²) is below 50%.")

    if not factors:
        factors.append("Market volatility and historical drawdown metrics are within normal parameters.")

    factors.append("Cryptocurrency markets are highly speculative and subject to unexpected external shocks.")

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "volatility_percent": round(volatility_pct, 2),
        "max_drawdown_percent": round(max_drawdown_pct, 2),
        "factors": factors,
        "methodology": "Composite rating based on 30-day return volatility, maximum drawdown, dataset coverage, and test RMSE/R².",
    }

