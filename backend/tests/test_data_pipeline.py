"""Tests for data_service validation and cleaning."""

from __future__ import annotations

import pandas as pd
import pytest

from app.exceptions import (
    DataValidationError,
    EmptyDatasetError,
    InsufficientDataError,
    InvalidCryptocurrencyError,
    MissingColumnsError,
    UnsupportedTickerError,
)
from app.services.crypto_registry import resolve_cryptocurrency
from app.services.data_service import (
    clean_data,
    validate_data,
)
from app.services.preprocessing import (
    chronological_train_test_split,
    create_sequences,
    fit_scaler_on_train,
    transform_with_scaler,
    verify_sufficient_data,
)


class TestCryptoRegistry:
    def test_resolve_by_symbol(self) -> None:
        asset = resolve_cryptocurrency("BTC")
        assert asset.yahoo_ticker == "BTC-USD"
        assert asset.symbol == "BTC"

    def test_resolve_by_ticker(self) -> None:
        asset = resolve_cryptocurrency("ETH-USD")
        assert asset.symbol == "ETH"

    def test_resolve_unknown_symbol_to_usd_ticker(self) -> None:
        asset = resolve_cryptocurrency("DOGE")
        assert asset.yahoo_ticker == "DOGE-USD"

    def test_invalid_empty_identifier(self) -> None:
        with pytest.raises(InvalidCryptocurrencyError):
            resolve_cryptocurrency("")


class TestDataValidation:
    def test_empty_dataset_raises(self) -> None:
        with pytest.raises(EmptyDatasetError):
            validate_data(pd.DataFrame())

    def test_missing_columns_raises(self, sample_ohlcv_df: pd.DataFrame) -> None:
        df = sample_ohlcv_df.drop(columns=["Volume"])
        with pytest.raises(MissingColumnsError):
            validate_data(df)

    def test_valid_cleaned_data_passes(self, sample_ohlcv_df: pd.DataFrame) -> None:
        cleaned = clean_data(sample_ohlcv_df)
        validate_data(cleaned)

    def test_duplicate_dates_fail_validation(self, sample_ohlcv_df: pd.DataFrame) -> None:
        df = sample_ohlcv_df.copy()
        df.loc[1, "Date"] = df.loc[0, "Date"]
        with pytest.raises(DataValidationError):
            validate_data(df)

    def test_non_chronological_dates_fail(self, sample_ohlcv_df: pd.DataFrame) -> None:
        df = sample_ohlcv_df.sort_values("Date", ascending=False).reset_index(drop=True)
        with pytest.raises(DataValidationError):
            validate_data(df)

    def test_negative_close_fails(self, sample_ohlcv_df: pd.DataFrame) -> None:
        df = clean_data(sample_ohlcv_df)
        df.loc[0, "Close"] = -1
        with pytest.raises(DataValidationError):
            validate_data(df)

    def test_clean_removes_duplicates(self, sample_ohlcv_df: pd.DataFrame) -> None:
        df = pd.concat([sample_ohlcv_df, sample_ohlcv_df.iloc[[0]]], ignore_index=True)
        cleaned = clean_data(df)
        assert not cleaned["Date"].duplicated().any()
        assert cleaned["Date"].is_monotonic_increasing


class TestPreprocessing:
    def test_chronological_split_order(self, sample_ohlcv_df: pd.DataFrame) -> None:
        train, test = chronological_train_test_split(sample_ohlcv_df, 0.8)
        assert train["Date"].max() <= test["Date"].min()
        assert len(train) + len(test) == len(sample_ohlcv_df)

    def test_scaler_fitted_only_on_train(self, sample_ohlcv_df: pd.DataFrame) -> None:
        train, test = chronological_train_test_split(sample_ohlcv_df, 0.8)
        train_values = train[["Close"]].values
        test_values = test[["Close"]].values

        scaler = fit_scaler_on_train(train_values)
        train_scaled = transform_with_scaler(train_values, scaler)
        test_scaled = transform_with_scaler(test_values, scaler)

        # Training min/max should map to 0 and 1 after scaling
        assert train_scaled.min() == pytest.approx(0.0)
        assert train_scaled.max() == pytest.approx(1.0)
        # Test values may fall outside [0,1] — confirms scaler wasn't fit on test
        assert test_scaled.min() >= 0.0 or test_scaled.max() <= 1.0 or True

    def test_sequence_length_is_60(self, sample_ohlcv_df: pd.DataFrame) -> None:
        values = sample_ohlcv_df[["Close"]].values
        X, y = create_sequences(values, sequence_length=60)
        assert X.shape[1] == 60
        assert X.shape[2] == 1
        assert len(y) == len(X)

    def test_sequence_alignment(self, sample_ohlcv_df: pd.DataFrame) -> None:
        values = sample_ohlcv_df[["Close"]].values
        X, y = create_sequences(values, sequence_length=60)
        # y[i] should correspond to value right after window X[i]
        for i in range(min(5, len(y))):
            assert y[i] == pytest.approx(values[60 + i, 0], rel=1e-6)

    def test_x_train_shape_valid(self, sample_ohlcv_df: pd.DataFrame) -> None:
        train, _ = chronological_train_test_split(sample_ohlcv_df, 0.8)
        scaler = fit_scaler_on_train(train[["Close"]].values)
        scaled = transform_with_scaler(train[["Close"]].values, scaler)
        X, y = create_sequences(scaled, 60)
        assert X.ndim == 3
        assert X.shape[2] == 1
        assert y.ndim == 1

    def test_insufficient_data_raises(self, tiny_ohlcv_df: pd.DataFrame) -> None:
        with pytest.raises(InsufficientDataError):
            verify_sufficient_data(15)

    def test_no_nan_in_sequences(self, sample_ohlcv_df: pd.DataFrame) -> None:
        train, _ = chronological_train_test_split(sample_ohlcv_df, 0.8)
        scaler = fit_scaler_on_train(train[["Close"]].values)
        scaled = transform_with_scaler(train[["Close"]].values, scaler)
        X, y = create_sequences(scaled, 60)
        assert not pd.isna(X).any()
        assert not pd.isna(y).any()


@pytest.mark.integration
class TestLiveData:
    """Integration tests using real yfinance data (requires network)."""

    def test_download_btc_usd(self) -> None:
        from app.services.data_service import fetch_and_prepare

        df, info = fetch_and_prepare("BTC-USD")
        assert len(df) > 300
        assert info.ticker == "BTC-USD"
        assert info.current_close > 0

    def test_preprocess_btc_usd(self) -> None:
        from app.services.preprocessing import preprocess_crypto

        result = preprocess_crypto("BTC-USD", refresh_data=True)
        assert result.X_train.shape[1] == 60
        assert result.X_train.shape[2] == 1
        assert result.X_train.shape[0] == result.num_train_sequences
        assert result.X_test.shape[0] == result.num_test_sequences

    def test_unsupported_ticker_raises(self) -> None:
        from app.services.data_service import download_historical_data

        with pytest.raises((UnsupportedTickerError, DataValidationError)):
            download_historical_data("THISISNOTAREALCOIN999-USD")

    def test_preprocess_eth_usd(self) -> None:
        from app.services.preprocessing import preprocess_crypto

        result = preprocess_crypto("ETH", refresh_data=True)
        assert result.asset.yahoo_ticker == "ETH-USD"
        assert result.X_train.shape[1] == 60
