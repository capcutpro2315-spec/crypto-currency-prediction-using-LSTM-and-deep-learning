"""
Pydantic schemas for cryptocurrency registry and historical data endpoints.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class CryptoAssetSchema(BaseModel):
    """Supported cryptocurrency metadata."""
    id: Optional[str] = Field(None, description="CoinGecko or provider asset ID (e.g. bitcoin)")
    name: str = Field(..., description="Cryptocurrency name (e.g. Bitcoin)")
    symbol: str = Field(..., description="Base symbol (e.g. BTC)")
    ticker: str = Field(..., description="Yahoo Finance ticker symbol (e.g. BTC-USD)")
    market_cap_rank: Optional[int] = Field(None, description="Market cap rank")
    provider_id: Optional[str] = Field(None, description="Provider identifier")
    image: Optional[str] = Field(None, description="Cryptocurrency logo URL")
    last_updated: Optional[str] = Field(None, description="Last updated ISO timestamp")
    historical_data_available: bool = Field(True, description="Whether historical data is available")
    market_data_available: bool = Field(True, description="Whether market data is available")
    has_trained_model: bool = Field(False, description="Whether a trained LSTM model exists for this asset")
    model_available: bool = Field(False, description="Whether a trained LSTM model exists for this asset")
    training_status: Optional[str] = Field("not_started", description="Training status state: not_started, training, ready, failed, insufficient_data")


class SupportedCryptosResponse(BaseModel):
    """Response wrapper for supported cryptocurrencies dynamic catalog."""
    items: List[CryptoAssetSchema] = Field(..., description="Cryptocurrency items list")
    count: int = Field(..., description="Total count of cryptocurrencies in catalog")
    source: str = Field("CoinGecko Public API", description="Catalog data provider source")
    cached: bool = Field(True, description="Whether catalog was loaded from cache")
    last_updated: str = Field(..., description="Timestamp when catalog was last refreshed")
    total: Optional[int] = Field(None, description="Backwards compatibility total count")
    cryptocurrencies: Optional[List[CryptoAssetSchema]] = Field(None, description="Backwards compatibility cryptocurrencies array")



class HistoricalRecordSchema(BaseModel):
    """Daily OHLCV record."""
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class HistoricalDataResponse(BaseModel):
    """Response wrapper for historical OHLCV data."""
    cryptocurrency: str
    ticker: str
    total_records: int
    records: List[HistoricalRecordSchema]
