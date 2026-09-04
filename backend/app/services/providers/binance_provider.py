"""
Binance market data provider.
"""

from __future__ import annotations

import json
import urllib.request
from datetime import datetime, timezone
from typing import Optional

from app.services.providers.base_provider import BaseMarketDataProvider, NormalizedMarketData

# Common ticker to Binance pair mapping
BINANCE_MAP = {
    "BTC-USD": "BTCUSDT",
    "ETH-USD": "ETHUSDT",
    "SOL-USD": "SOLUSDT",
    "DOGE-USD": "DOGEUSDT",
    "XRP-USD": "XRPUSDT",
    "ADA-USD": "ADAUSDT",
    "AVAX-USD": "AVAXUSDT",
    "LINK-USD": "LINKUSDT",
    "DOT-USD": "DOTUSDT",
    "SHIB-USD": "SHIBUSDT",
}


class BinanceProvider(BaseMarketDataProvider):
    """Fetches live market data from Binance Public API."""

    @property
    def provider_name(self) -> str:
        return "Binance"

    def fetch_live_ticker(self, ticker: str) -> Optional[NormalizedMarketData]:
        pair = BINANCE_MAP.get(ticker.upper())
        if not pair:
            sym = ticker.split("-")[0].upper()
            pair = f"{sym}USDT"

        url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={pair}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "CryptoPredictionApp/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    price = float(data.get("lastPrice") or 0.0)
                    open_price = float(data.get("openPrice") or price)
                    high = float(data.get("highPrice") or price)
                    low = float(data.get("lowPrice") or price)
                    change_24h = float(data.get("priceChangePercent") or 0.0)
                    volume = float(data.get("quoteVolume") or 0.0)
                    sym = ticker.split("-")[0].upper()
                    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

                    return NormalizedMarketData(
                        id=sym.lower(),
                        symbol=sym,
                        name=sym,
                        ticker=ticker,
                        timestamp=now_str,
                        price=price,
                        open=open_price,
                        high=high,
                        low=low,
                        close=price,
                        volume=volume,
                        change_24h=change_24h,
                        source="Binance",
                        freshness="Live market data (updated ~1 min)",
                    )
        except Exception:
            pass
        return None
