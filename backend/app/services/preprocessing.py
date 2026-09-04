"""
Cryptocurrency time-series preprocessing for LSTM model preparation.

Baseline feature/target: Close -> Close
Chronological train/test split with training-only MinMaxScaler fitting.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

from app.config import (
    DEFAULT_FEATURE_COLUMNS,
    DEFAULT_SEQUENCE_LENGTH,
    DEFAULT_TARGET_COLUMN,
    DEFAULT_TRAIN_TEST_SPLIT,
    MIN_ROWS_FOR_LSTM,
)
from app.exceptions import InsufficientDataError
from app.services.crypto_registry import CryptoAsset, resolve_cryptocurrency
from app.services.data_service import (
    fetch_and_prepare,
    get_or_download_historical_data,
    load_and_prepare,
)


@dataclass
class PreprocessedData:
    """Container for LSTM-ready train/test sequences and metadata."""

    X_train: np.ndarray
    y_train: np.ndarray
    X_test: np.ndarray
    y_test: np.ndarray
    scaler: MinMaxScaler
    feature_names: list[str]
    target_name: str
    sequence_length: int
    train_dates: pd.DatetimeIndex
    test_dates: pd.DatetimeIndex
    asset: CryptoAsset
    current_price: float
    train_size: int
    test_size: int
    num_train_sequences: int
    num_test_sequences: int
    available_history_days: int = 0
    lookback_days: int = 60



def load_cleaned_data(identifier: str, refresh: bool = False) -> pd.DataFrame:
    """
    Load cleaned OHLCV data for a cryptocurrency.

    If refresh=True, re-downloads from yfinance before cleaning.
    If local file is missing, automatically downloads via yfinance.
    """
    if refresh:
        df, _ = fetch_and_prepare(identifier)
    else:
        df, _ = get_or_download_historical_data(identifier)
    return df



def select_features(
    df: pd.DataFrame,
    feature_columns: list[str] | None = None,
) -> pd.DataFrame:
    """Select model input features (baseline: Close only)."""
    cols = feature_columns or DEFAULT_FEATURE_COLUMNS
    missing = [c for c in cols if c not in df.columns]
    if missing:
        raise ValueError(f"Feature columns not found: {', '.join(missing)}")
    return df[cols].copy()


def select_target(
    df: pd.DataFrame,
    target_column: str | None = None,
) -> pd.Series:
    """Select prediction target (baseline: Close)."""
    col = target_column or DEFAULT_TARGET_COLUMN
    if col not in df.columns:
        raise ValueError(f"Target column '{col}' not found in dataset.")
    return df[col].copy()


def chronological_train_test_split(
    df: pd.DataFrame,
    train_ratio: float = DEFAULT_TRAIN_TEST_SPLIT,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split time-series data chronologically (no random shuffling).

    Earlier observations -> training set
    Later observations   -> test set

    This prevents future-data leakage into training.
    """
    if not 0.0 < train_ratio < 1.0:
        raise ValueError("train_ratio must be between 0 and 1.")

    split_idx = int(len(df) * train_ratio)
    if split_idx <= 0 or split_idx >= len(df):
        raise InsufficientDataError(
            "Insufficient historical data available for LSTM forecasting."
        )

    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()
    return train_df, test_df


def fit_scaler_on_train(
    train_values: np.ndarray,
) -> MinMaxScaler:
    """
    Fit MinMaxScaler on training data ONLY.

    IMPORTANT (data-leakage prevention):
    The scaler must never be fit on the full dataset or on test data.
    Test data will be transformed using this training-fitted scaler.
    """
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaler.fit(train_values)
    return scaler


def transform_with_scaler(
    values: np.ndarray,
    scaler: MinMaxScaler,
) -> np.ndarray:
    """Transform values using an already-fitted scaler."""
    return scaler.transform(values)


def create_sequences(
    scaled_values: np.ndarray,
    sequence_length: int = DEFAULT_SEQUENCE_LENGTH,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Create LSTM input sequences from scaled 1D/2D values.

    Example (sequence_length=60):
        Days 1-60  -> predict Day 61
        Days 2-61  -> predict Day 62
        ...

    Returns:
        X: shape (num_samples, sequence_length, num_features)
        y: shape (num_samples,)
    """
    if scaled_values.ndim == 1:
        scaled_values = scaled_values.reshape(-1, 1)

    if len(scaled_values) <= sequence_length:
        raise InsufficientDataError(
            "Insufficient historical data available for LSTM forecasting."
        )

    X_list: list[np.ndarray] = []
    y_list: list[float] = []

    for i in range(sequence_length, len(scaled_values)):
        X_list.append(scaled_values[i - sequence_length : i])
        y_list.append(float(scaled_values[i, 0]))

    X = np.array(X_list)
    y = np.array(y_list)
    return X, y


def compute_adaptive_lookback(available_days: int) -> tuple[int | None, str | None]:
    """
    Compute adaptive lookback window length based on available valid historical days.

    Logic:
        - available_days >= 60 -> lookback_window = 60
        - 30 <= available_days < 60 -> lookback_window = available_days
        - available_days < 30 -> prediction unavailable (min 30 days required)
    """
    from app.config import DEFAULT_LSTM_LOOKBACK, MIN_LSTM_HISTORY_DAYS

    if available_days < MIN_LSTM_HISTORY_DAYS:
        return None, (
            f"At least {MIN_LSTM_HISTORY_DAYS} days of valid historical data is required "
            f"for an initial LSTM forecast (got {available_days} days)."
        )

    if available_days >= DEFAULT_LSTM_LOOKBACK:
        return DEFAULT_LSTM_LOOKBACK, None

    return available_days, None


def verify_sufficient_data(
    num_records: int,
    sequence_length: int = DEFAULT_SEQUENCE_LENGTH,
    train_ratio: float = DEFAULT_TRAIN_TEST_SPLIT,
) -> None:
    """
    Verify enough observations exist for split + sequence generation.
    """
    lookback, err = compute_adaptive_lookback(num_records)
    if err:
        raise InsufficientDataError(err)


def preprocess_crypto(
    identifier: str,
    sequence_length: int | None = None,
    train_ratio: float = DEFAULT_TRAIN_TEST_SPLIT,
    feature_columns: list[str] | None = None,
    target_column: str | None = None,
    refresh_data: bool = False,
) -> PreprocessedData:
    """
    Full adaptive preprocessing pipeline for any supported cryptocurrency.
    """
    asset = resolve_cryptocurrency(identifier)
    features = feature_columns or DEFAULT_FEATURE_COLUMNS
    target = target_column or DEFAULT_TARGET_COLUMN

    if refresh_data:
        df, info = fetch_and_prepare(identifier)
    else:
        try:
            df, info = load_and_prepare(identifier)
        except FileNotFoundError:
            df, info = fetch_and_prepare(identifier)

    available_history_days = len(df)

    if sequence_length is None:
        computed_lookback, err_msg = compute_adaptive_lookback(available_history_days)
        if err_msg or computed_lookback is None:
            raise InsufficientDataError(err_msg or "Insufficient historical data for LSTM prediction.")
        effective_sequence_length = computed_lookback
    else:
        effective_sequence_length = sequence_length

    if available_history_days < effective_sequence_length:
        raise InsufficientDataError(
            f"Insufficient historical data ({available_history_days} days) for lookback window of {effective_sequence_length} days."
        )

    # For datasets with fewer rows (e.g. 30-59 days), ensure train set has at least 1 sequence
    train_df, test_df = chronological_train_test_split(df, train_ratio)

    if len(train_df) <= effective_sequence_length:
        # Fallback split to ensure training sequence exists for smaller datasets
        train_df = df.iloc[: max(effective_sequence_length + 1, int(len(df) * 0.7))].copy()
        test_df = df.iloc[len(train_df) - effective_sequence_length :].copy()

    train_features = select_features(train_df, features).values
    test_features = select_features(test_df, features).values

    # Fit scaler ONLY on training data
    scaler = fit_scaler_on_train(train_features)
    train_scaled = transform_with_scaler(train_features, scaler)
    test_scaled = transform_with_scaler(test_features, scaler)

    X_train, y_train = create_sequences(train_scaled, effective_sequence_length)
    X_test, y_test = create_sequences(test_scaled, effective_sequence_length)

    train_target_dates = train_df["Date"].iloc[effective_sequence_length:].reset_index(drop=True)
    test_target_dates = test_df["Date"].iloc[effective_sequence_length:].reset_index(drop=True) if len(test_df) > effective_sequence_length else train_target_dates[-1:]

    return PreprocessedData(
        X_train=X_train,
        y_train=y_train,
        X_test=X_test,
        y_test=y_test,
        scaler=scaler,
        feature_names=features,
        target_name=target,
        sequence_length=effective_sequence_length,
        train_dates=pd.DatetimeIndex(train_target_dates),
        test_dates=pd.DatetimeIndex(test_target_dates),
        asset=asset,
        current_price=info.current_close,
        train_size=len(train_df),
        test_size=len(test_df),
        num_train_sequences=len(X_train),
        num_test_sequences=len(X_test),
        available_history_days=available_history_days,
        lookback_days=effective_sequence_length,
    )


def process_crypto(identifier: str, **kwargs: Any) -> PreprocessedData:
    """Alias for preprocess_crypto — cryptocurrency-agnostic entry point."""
    return preprocess_crypto(identifier, **kwargs)

