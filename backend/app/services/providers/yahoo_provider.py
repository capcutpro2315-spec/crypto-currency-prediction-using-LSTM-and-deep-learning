"""
Yahoo Finance market data provider fallback.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

import yfinance as yf

from app.services.providers.base_provider import BaseMarketDataProvider, NormalizedMarketData


class YahooProvider(BaseMarketDataProvider):
    """Fetches live market data from Yahoo Finance via yfinance."""

    @property
    def provider_name(self) -> str:
        return "Yahoo Finance"

    def fetch_live_ticker(self, ticker: str) -> Optional[NormalizedMarketData]:
        try:
            yticker = yf.Ticker(ticker)
            fast_info = getattr(yticker, "fast_info", None)
            if fast_info and hasattr(fast_info, "last_price") and fast_info.last_price:
                price = float(fast_info.last_price)
                prev_close = float(getattr(fast_info, "previous_close", price))
                change_24h = ((price - prev_close) / prev_close * 100.0) if prev_close > 0 else 0.0
                volume = float(getattr(fast_info, "last_volume", 0.0))
                sym = ticker.split("-")[0].upper()
                now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

                return NormalizedMarketData(
                    id=sym.lower(),
                    symbol=sym,
                    name=sym,
                    ticker=ticker,
                    timestamp=now_str,
                    price=price,
                    open=prev_close,
                    high=float(getattr(fast_info, "day_high", price)),
                    low=float(getattr(fast_info, "day_low", price)),
                    close=price,
                    volume=volume,
                    change_24h=change_24h,
                    source="Yahoo Finance",
                    freshness="Live market data (updated ~1 min)",
                )

            # Fallback to 1-day history call
            df = yticker.history(period="2d", interval="1d")
            if not df.empty:
                latest = df.iloc[-1]
                price = float(latest["Close"])
                prev_close = float(df.iloc[-2]["Close"]) if len(df) > 1 else float(latest["Open"])
                change_24h = ((price - prev_close) / prev_close * 100.0) if prev_close > 0 else 0.0
                sym = ticker.split("-")[0].upper()
                now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

                return NormalizedMarketData(
                    id=sym.lower(),
                    symbol=sym,
                    name=sym,
                    ticker=ticker,
                    timestamp=now_str,
                    price=price,
                    open=float(latest["Open"]),
                    high=float(latest["High"]),
                    low=float(latest["Low"]),
                    close=price,
                    volume=float(latest["Volume"]),
                    change_24h=change_24h,
                    source="Yahoo Finance",
                    freshness="Live market data (updated ~1 min)",
                )
        except Exception:
            pass
        return None
