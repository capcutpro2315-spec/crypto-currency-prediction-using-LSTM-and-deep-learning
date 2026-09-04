"""
CoinGecko market data provider.
"""

from __future__ import annotations

import json
import urllib.request
from datetime import datetime, timezone
from typing import Optional

from app.services.providers.base_provider import BaseMarketDataProvider, NormalizedMarketData

# Common ticker to CoinGecko ID mapping
COINGECKO_MAP = {
    "BTC-USD": "bitcoin",
    "ETH-USD": "ethereum",
    "SOL-USD": "solana",
    "DOGE-USD": "dogecoin",
    "XRP-USD": "ripple",
    "ADA-USD": "cardano",
    "AVAX-USD": "avalanche-2",
    "LINK-USD": "chainlink",
    "DOT-USD": "polkadot",
    "SHIB-USD": "shiba-inu",
}


class CoinGeckoProvider(BaseMarketDataProvider):
    """Fetches live market data from CoinGecko Public API."""

    @property
    def provider_name(self) -> str:
        return "CoinGecko"

    def fetch_live_ticker(self, ticker: str) -> Optional[NormalizedMarketData]:
        coin_id = COINGECKO_MAP.get(ticker.upper())
        if not coin_id:
            symbol = ticker.split("-")[0].lower()
            coin_id = symbol

        url = f"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={coin_id}&sparkline=false"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "CryptoPredictionApp/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    if isinstance(data, list) and len(data) > 0:
                        item = data[0]
                        price = float(item.get("current_price") or 0.0)
                        high = float(item.get("high_24h") or price)
                        low = float(item.get("low_24h") or price)
                        change_24h = float(item.get("price_change_percentage_24h") or 0.0)
                        volume = float(item.get("total_volume") or 0.0)
                        name = str(item.get("name") or ticker.split("-")[0])
                        sym = str(item.get("symbol") or ticker.split("-")[0]).upper()
                        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

                        return NormalizedMarketData(
                            id=coin_id,
                            symbol=sym,
                            name=name,
                            ticker=ticker,
                            timestamp=now_str,
                            price=price,
                            open=price,  # Approximate
                            high=high,
                            low=low,
                            close=price,
                            volume=volume,
                            change_24h=change_24h,
                            source="CoinGecko",
                            freshness="Live market data (updated ~1 min)",
                        )
        except Exception:
            pass
        return None
