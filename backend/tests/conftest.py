"""Shared pytest fixtures for data pipeline tests."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest


@pytest.fixture
def sample_ohlcv_df() -> pd.DataFrame:
    """
    Small valid OHLCV frame for unit tests (synthetic fixture, not market data).

    400 daily rows — enough for 80/20 split + 60-day sequences.
    """
    n = 400
    dates = pd.date_range("2023-01-01", periods=n, freq="D")
    close = np.linspace(100, 200, n) + np.random.default_rng(42).normal(0, 1, n)
    return pd.DataFrame(
        {
            "Date": dates,
            "Open": close - 1,
            "High": close + 2,
            "Low": close - 2,
            "Close": close,
            "Volume": np.random.default_rng(42).integers(1000, 5000, n),
        }
    )


@pytest.fixture
def tiny_ohlcv_df() -> pd.DataFrame:
    """Too few rows for LSTM preprocessing."""
    n = 50
    dates = pd.date_range("2024-01-01", periods=n, freq="D")
    close = np.linspace(100, 120, n)
    return pd.DataFrame(
        {
            "Date": dates,
            "Open": close,
            "High": close + 1,
            "Low": close - 1,
            "Close": close,
            "Volume": np.full(n, 1000),
        }
    )
