"""
Base interface and normalized market data structure for cryptocurrency data providers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class NormalizedMarketData:
    """Standardized market data structure returned by all data providers."""

    id: str
    symbol: str
    name: str
    ticker: str
    timestamp: str
    price: float
    open: float
    high: float
    low: float
    close: float
    volume: float
    change_24h: float
    source: str
    freshness: str = "Live market data (updated ~1 min)"

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON API responses."""
        return {
            "id": self.id,
            "symbol": self.symbol,
            "name": self.name,
            "ticker": self.ticker,
            "timestamp": self.timestamp,
            "price": self.price,
            "open": self.open,
            "high": self.high,
            "low": self.low,
            "close": self.close,
            "volume": self.volume,
            "change_24h": self.change_24h,
            "source": self.source,
            "freshness": self.freshness,
        }


class BaseMarketDataProvider(ABC):
    """Abstract base class for crypto market data providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return provider identifier name."""
        pass

    @abstractmethod
    def fetch_live_ticker(self, ticker: str) -> Optional[NormalizedMarketData]:
        """
        Fetch live 24h ticker data for a cryptocurrency.
        Returns None if not supported or request fails.
        """
        pass
