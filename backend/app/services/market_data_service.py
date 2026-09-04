"""
Market Data Service providing provider resolution fallback (CoinGecko -> Binance -> Yahoo Finance)
and normalized crypto market data responses.
"""

from __future__ import annotations

import time
from typing import Dict, List, Optional

from app.services.crypto_registry import resolve_cryptocurrency
from app.services.providers.base_provider import BaseMarketDataProvider, NormalizedMarketData
from app.services.providers.binance_provider import BinanceProvider
from app.services.providers.coingecko_provider import CoinGeckoProvider
from app.services.providers.yahoo_provider import YahooProvider

# Short in-memory cache for live ticker data to prevent rate limits
_LIVE_CACHE: Dict[str, tuple[float, NormalizedMarketData]] = {}
CACHE_TTL_SECONDS = 30.0


class MarketDataService:
    """Orchestrates provider resolution and live market data fetching."""

    def __init__(self, providers: Optional[List[BaseMarketDataProvider]] = None):
        if providers is None:
            self.providers = [
                CoinGeckoProvider(),
                BinanceProvider(),
                YahooProvider(),
            ]
        else:
            self.providers = providers

    def get_live_market_data(self, identifier: str) -> NormalizedMarketData:
        """
        Fetch normalized live market data for a given cryptocurrency identifier.
        Uses provider fallback: CoinGecko -> Binance -> Yahoo Finance.
        """
        asset = resolve_cryptocurrency(identifier)
        ticker = asset.ticker

        # Check short in-memory cache
        now = time.time()
        if ticker in _LIVE_CACHE:
            ts, cached_data = _LIVE_CACHE[ticker]
            if now - ts < CACHE_TTL_SECONDS:
                return cached_data

        # Try each provider in priority order
        for provider in self.providers:
            try:
                data = provider.fetch_live_ticker(ticker)
                if data is not None:
                    # Enrich asset metadata
                    data.name = asset.name
                    data.symbol = asset.symbol
                    data.ticker = ticker
                    _LIVE_CACHE[ticker] = (now, data)
                    return data
            except Exception:
                continue

        # Fallback if all providers fail (e.g. offline fallback from local CSV)
        from app.services.preprocessing import load_cleaned_data
        df = load_cleaned_data(ticker)
        latest_row = df.iloc[-1]
        prev_row = df.iloc[-2] if len(df) > 1 else latest_row
        price = float(latest_row["Close"])
        prev_close = float(prev_row["Close"])
        change_24h = ((price - prev_close) / prev_close * 100.0) if prev_close > 0 else 0.0

        fallback_data = NormalizedMarketData(
            id=asset.symbol.lower(),
            symbol=asset.symbol,
            name=asset.name,
            ticker=ticker,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            price=price,
            open=float(latest_row["Open"]),
            high=float(latest_row["High"]),
            low=float(latest_row["Low"]),
            close=price,
            volume=float(latest_row["Volume"]),
            change_24h=change_24h,
            source="Local Cached Data",
            freshness="Updated ~1 min",
        )
        _LIVE_CACHE[ticker] = (now, fallback_data)
        return fallback_data


# Global service instance
market_data_service = MarketDataService()
