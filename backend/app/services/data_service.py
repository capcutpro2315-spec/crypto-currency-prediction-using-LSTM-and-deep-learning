"""
Historical cryptocurrency data acquisition, validation, and cleaning.

Uses yfinance for daily OHLCV data. Cryptocurrency-agnostic: the same
functions work for any resolved Yahoo Finance ticker.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import yfinance as yf

from app.config import (
    DATA_RAW_DIR,
    DEFAULT_HISTORICAL_PERIOD,
    DEFAULT_INTERVAL,
    MARKET_COLUMNS,
    REQUIRED_OHLCV_COLUMNS,
)
from app.exceptions import (
    DataProviderError,
    DataValidationError,
    EmptyDatasetError,
    MissingColumnsError,
    UnsupportedTickerError,
)
from app.services.crypto_registry import CryptoAsset, resolve_cryptocurrency


@dataclass
class DatasetInfo:
    """Summary metadata for a cleaned OHLCV dataset."""

    ticker: str
    symbol: str
    name: str
    date_range_start: str
    date_range_end: str
    num_records: int
    columns: list[str]
    current_close: float
    file_path: str | None = None


def ticker_to_filename(ticker: str) -> str:
    """Convert a Yahoo ticker to a safe CSV filename."""
    safe = ticker.upper().replace("/", "-").replace("\\", "-")
    return f"{safe}.csv"


def get_raw_data_path(ticker: str) -> Path:
    """Return the path where raw CSV data for a ticker is stored."""
    DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)
    return DATA_RAW_DIR / ticker_to_filename(ticker)


def resolve_ticker(identifier: str) -> CryptoAsset:
    """Resolve a cryptocurrency identifier to its provider ticker."""
    return resolve_cryptocurrency(identifier)


def download_historical_data(
    identifier: str,
    period: str = DEFAULT_HISTORICAL_PERIOD,
    interval: str = DEFAULT_INTERVAL,
) -> pd.DataFrame:
    """
    Download historical OHLCV data from Yahoo Finance via yfinance.

    Raises:
        UnsupportedTickerError: Ticker resolves but returns no usable data.
        DataProviderError: Network or provider failure.
    """
    asset = resolve_ticker(identifier)
    ticker = asset.yahoo_ticker

    try:
        raw = yf.download(
            ticker,
            period=period,
            interval=interval,
            auto_adjust=False,
            progress=False,
        )
        if raw is None or raw.empty:
            t = yf.Ticker(ticker)
            raw = t.history(period=period, interval=interval, auto_adjust=False)
    except Exception:
        raw = None

    if raw is None or raw.empty:
        # Fallback to existing saved raw CSV dataset if network/provider download is throttled
        raw_csv_path = get_raw_data_path(ticker)
        if raw_csv_path.exists():
            return pd.read_csv(raw_csv_path)

        raise UnsupportedTickerError(
            f"No historical data available for '{ticker}'. "
            "The cryptocurrency may not be supported on Yahoo Finance."
        )

    df = _normalize_yfinance_frame(raw)
    if df.empty:
        raw_csv_path = get_raw_data_path(ticker)
        if raw_csv_path.exists():
            return pd.read_csv(raw_csv_path)
        raise UnsupportedTickerError(
            f"Download returned an empty dataset for '{ticker}'."
        )

    return df


def load_csv_data(ticker: str) -> pd.DataFrame:
    """Load previously saved raw CSV data for a ticker."""
    path = get_raw_data_path(ticker)
    if not path.exists():
        raise FileNotFoundError(
            f"No saved data found for '{ticker}' at {path}. "
            "Download data first."
        )
    df = pd.read_csv(path, parse_dates=["Date"])
    return df


def save_raw_data(df: pd.DataFrame, ticker: str) -> Path:
    """Persist cleaned OHLCV data to backend/data/raw/."""
    path = get_raw_data_path(ticker)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)
    return path


def validate_data(df: pd.DataFrame) -> None:
    """
    Validate OHLCV dataset quality.

    Raises DataValidationError, EmptyDatasetError, or MissingColumnsError
    on failure. Does not silently ignore serious problems.
    """
    if df is None or df.empty:
        raise EmptyDatasetError("Dataset is empty.")

    missing = [col for col in REQUIRED_OHLCV_COLUMNS if col not in df.columns]
    if missing:
        raise MissingColumnsError(
            f"Missing required columns: {', '.join(missing)}"
        )

    if not pd.api.types.is_datetime64_any_dtype(df["Date"]):
        raise DataValidationError("'Date' column must be datetime typed.")

    if df["Date"].isna().any():
        raise DataValidationError("Dataset contains invalid (NaN) dates.")

    if not df["Date"].is_monotonic_increasing:
        raise DataValidationError(
            "Dates must be in chronological order (ascending)."
        )

    if df["Date"].duplicated().any():
        raise DataValidationError(
            "Dataset still contains duplicate dates. Run clean_data() first."
        )

    for col in MARKET_COLUMNS:
        if not pd.api.types.is_numeric_dtype(df[col]):
            raise DataValidationError(f"Column '{col}' must be numeric.")

    if df[MARKET_COLUMNS].isna().any().any():
        raise DataValidationError(
            "Unexpected NaN values remain in OHLCV columns after cleaning."
        )

    if (df["Close"] <= 0).any():
        raise DataValidationError("Close prices must be positive.")

    if (df["Volume"] < 0).any():
        raise DataValidationError("Volume values must be non-negative.")


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean raw OHLCV data: normalize columns, sort, deduplicate, coerce types,
    and handle missing values.
    """
    cleaned = _normalize_yfinance_frame(df.copy())

    # Sort chronologically
    cleaned = cleaned.sort_values("Date").reset_index(drop=True)

    # Remove duplicate dates (keep last observation per day)
    cleaned = cleaned.drop_duplicates(subset=["Date"], keep="last")
    cleaned = cleaned.reset_index(drop=True)

    # Coerce market columns to numeric
    for col in MARKET_COLUMNS:
        cleaned[col] = pd.to_numeric(cleaned[col], errors="coerce")

    # Handle missing values: forward-fill then backward-fill for gaps
    cleaned[MARKET_COLUMNS] = cleaned[MARKET_COLUMNS].ffill().bfill()

    # Drop rows that still have NaN after fill (e.g. all-NaN column)
    cleaned = cleaned.dropna(subset=REQUIRED_OHLCV_COLUMNS)
    cleaned = cleaned.reset_index(drop=True)

    return cleaned


def get_dataset_info(
    df: pd.DataFrame,
    asset: CryptoAsset,
    file_path: Path | None = None,
) -> DatasetInfo:
    """Return useful summary information about a dataset."""
    return DatasetInfo(
        ticker=asset.yahoo_ticker,
        symbol=asset.symbol,
        name=asset.name,
        date_range_start=df["Date"].iloc[0].strftime("%Y-%m-%d"),
        date_range_end=df["Date"].iloc[-1].strftime("%Y-%m-%d"),
        num_records=len(df),
        columns=list(df.columns),
        current_close=float(df["Close"].iloc[-1]),
        file_path=str(file_path) if file_path else None,
    )


def fetch_and_prepare(
    identifier: str,
    period: str = DEFAULT_HISTORICAL_PERIOD,
    interval: str = DEFAULT_INTERVAL,
    save: bool = True,
) -> tuple[pd.DataFrame, DatasetInfo]:
    """
    End-to-end: resolve -> download -> clean -> validate -> optionally save.

    This is the main entry point for data acquisition in Stage 2.
    """
    asset = resolve_ticker(identifier)
    raw_df = download_historical_data(
        asset.yahoo_ticker, period=period, interval=interval
    )
    cleaned = clean_data(raw_df)
    validate_data(cleaned)

    saved_path = None
    if save:
        saved_path = save_raw_data(cleaned, asset.yahoo_ticker)

    info = get_dataset_info(cleaned, asset, saved_path)
    return cleaned, info


def load_and_prepare(identifier: str) -> tuple[pd.DataFrame, DatasetInfo]:
    """Load saved CSV, clean, validate, and return dataset with info."""
    asset = resolve_ticker(identifier)
    raw_df = load_csv_data(asset.yahoo_ticker)
    cleaned = clean_data(raw_df)
    validate_data(cleaned)
    info = get_dataset_info(cleaned, asset, get_raw_data_path(asset.yahoo_ticker))
    return cleaned, info


def get_or_download_historical_data(identifier: str) -> tuple[pd.DataFrame, DatasetInfo]:
    """
    Retrieve local historical data if available, or automatically download via yfinance,
    clean, validate, save to backend/data/raw/, and return.
    """
    asset = resolve_ticker(identifier)
    raw_path = get_raw_data_path(asset.yahoo_ticker)

    if raw_path.exists():
        try:
            return load_and_prepare(identifier)
        except Exception:
            # If saved CSV is corrupt or empty, fallback to downloading fresh data
            pass

    # CSV missing or invalid: automatically download, clean, validate, and save
    try:
        cleaned, info = fetch_and_prepare(identifier, save=True)
        return cleaned, info
    except UnsupportedTickerError as exc:
        raise UnsupportedTickerError(
            f"Historical data is not available for this cryptocurrency ('{asset.ticker}')."
        ) from exc
    except DataProviderError as exc:
        raise DataProviderError(
            f"Unable to retrieve historical data for {asset.ticker} at this time: {exc}"
        ) from exc
    except Exception as exc:
        raise DataProviderError(
            f"Unable to retrieve historical data for {asset.ticker} at this time."
        ) from exc



def _normalize_yfinance_frame(raw: pd.DataFrame) -> pd.DataFrame:
    """Convert yfinance output to standard OHLCV schema with Date column."""
    df = raw.copy()

    # yfinance may return MultiIndex columns for single ticker downloads
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df.reset_index()

    # Standardize date column name
    date_col = None
    for candidate in ("Date", "Datetime", "index"):
        if candidate in df.columns:
            date_col = candidate
            break
    if date_col is None:
        raise MissingColumnsError("Downloaded data has no recognizable date column.")

    df = df.rename(columns={date_col: "Date"})

    # Keep only required columns that exist
    available = [c for c in REQUIRED_OHLCV_COLUMNS if c in df.columns]
    missing = [c for c in REQUIRED_OHLCV_COLUMNS if c not in df.columns]
    if missing:
        raise MissingColumnsError(
            f"Downloaded data missing columns: {', '.join(missing)}"
        )

    df = df[REQUIRED_OHLCV_COLUMNS].copy()
    df["Date"] = pd.to_datetime(df["Date"]).dt.tz_localize(None)
    df["Date"] = df["Date"].dt.normalize()

    for col in MARKET_COLUMNS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df
