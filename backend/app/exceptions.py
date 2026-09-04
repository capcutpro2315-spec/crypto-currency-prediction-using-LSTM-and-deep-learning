"""Custom exceptions for the cryptocurrency data pipeline."""


class CryptoPipelineError(Exception):
    """Base exception for data pipeline errors."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class InvalidCryptocurrencyError(CryptoPipelineError):
    """Raised when a cryptocurrency identifier cannot be parsed or resolved."""


class UnsupportedTickerError(CryptoPipelineError):
    """Raised when a ticker is not supported or has no Yahoo Finance mapping."""


class DataProviderError(CryptoPipelineError):
    """Raised when the market data provider fails (network, API, etc.)."""


class EmptyDatasetError(CryptoPipelineError):
    """Raised when a dataset contains no records."""


class MissingColumnsError(CryptoPipelineError):
    """Raised when required OHLCV columns are missing."""


class DataValidationError(CryptoPipelineError):
    """Raised when data fails quality validation checks."""


class InsufficientDataError(CryptoPipelineError):
    """Raised when there is not enough historical data for LSTM preprocessing."""
