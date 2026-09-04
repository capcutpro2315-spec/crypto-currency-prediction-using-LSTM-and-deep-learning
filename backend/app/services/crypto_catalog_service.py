"""
Dynamic Cryptocurrency Catalog Discovery Service.

Fetches the complete cryptocurrency catalog from external providers (CoinGecko API)
across multiple paginated requests, caches results locally for 30 minutes, and supports
force refresh and dynamic catalog queries.
"""

from __future__ import annotations

import json
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.config import MODELS_SAVED_DIR

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "cache"
CACHE_FILE = CACHE_DIR / "crypto_catalog.json"
CRYPTO_CATALOG_REFRESH_MINUTES = 30
CACHE_TTL_SECONDS = CRYPTO_CATALOG_REFRESH_MINUTES * 60  # 1800 seconds (30 mins)

# Offline fallback dataset containing major top coins if external provider is completely unreachable
FALLBACK_ITEMS = [
    {"id": "bitcoin", "name": "Bitcoin", "symbol": "BTC", "ticker": "BTC-USD", "market_cap_rank": 1, "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"},
    {"id": "ethereum", "name": "Ethereum", "symbol": "ETH", "ticker": "ETH-USD", "market_cap_rank": 2, "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"},
    {"id": "tether", "name": "Tether", "symbol": "USDT", "ticker": "USDT-USD", "market_cap_rank": 3, "image": "https://assets.coingecko.com/coins/images/325/large/Tether.png"},
    {"id": "binancecoin", "name": "BNB", "symbol": "BNB", "ticker": "BNB-USD", "market_cap_rank": 4, "image": "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"},
    {"id": "solana", "name": "Solana", "symbol": "SOL", "ticker": "SOL-USD", "market_cap_rank": 5, "image": "https://assets.coingecko.com/coins/images/4128/large/solana.png"},
    {"id": "ripple", "name": "XRP", "symbol": "XRP", "ticker": "XRP-USD", "market_cap_rank": 6, "image": "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"},
    {"id": "cardano", "name": "Cardano", "symbol": "ADA", "ticker": "ADA-USD", "market_cap_rank": 7, "image": "https://assets.coingecko.com/coins/images/975/large/cardano.png"},
    {"id": "dogecoin", "name": "Dogecoin", "symbol": "DOGE", "ticker": "DOGE-USD", "market_cap_rank": 8, "image": "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"},
    {"id": "avalanche-2", "name": "Avalanche", "symbol": "AVAX", "ticker": "AVAX-USD", "market_cap_rank": 9, "image": "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png"},
    {"id": "shiba-inu", "name": "Shiba Inu", "symbol": "SHIB", "ticker": "SHIB-USD", "market_cap_rank": 10, "image": "https://assets.coingecko.com/coins/images/11939/large/shiba.png"},
    {"id": "pepe", "name": "Pepe", "symbol": "PEPE", "ticker": "PEPE-USD", "market_cap_rank": 20, "image": "https://assets.coingecko.com/coins/images/29850/large/pepe-token.png"},
    {"id": "sui", "name": "Sui", "symbol": "SUI", "ticker": "SUI-USD", "market_cap_rank": 25, "image": "https://assets.coingecko.com/coins/images/26375/large/sui-ocean-square.png"},
]


def _check_model_exists(ticker: str) -> bool:
    """Check if a trained .keras model artifact exists on disk."""
    model_path = MODELS_SAVED_DIR / f"{ticker}_lstm.keras"
    return model_path.exists()


class CryptoCatalogService:
    """Service to discover, fetch, cache, and search the complete cryptocurrency catalog."""

    def fetch_paginated_remote_catalog(self, max_pages: int = 5, per_page: int = 250) -> List[Dict[str, Any]]:
        """
        Fetch cryptocurrencies across multiple pages from CoinGecko Markets API.
        """
        all_coins: List[Dict[str, Any]] = []
        seen_ids = set()
        headers = {"User-Agent": "CryptoPredictionApp/1.0"}

        for page in range(1, max_pages + 1):
            url = (
                f"https://api.coingecko.com/api/v3/coins/markets"
                f"?vs_currency=usd&order=market_cap_desc&per_page={per_page}&page={page}&sparkline=false"
            )
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as resp:
                    if resp.status == 200:
                        raw_data = json.loads(resp.read().decode("utf-8"))
                        if not isinstance(raw_data, list) or len(raw_data) == 0:
                            break

                        for item in raw_data:
                            coin_id = str(item.get("id", "")).strip()
                            sym = str(item.get("symbol", "")).strip().upper()
                            name = str(item.get("name", "")).strip()
                            if not coin_id or not sym or coin_id in seen_ids:
                                continue

                            seen_ids.add(coin_id)
                            ticker = f"{sym}-USD"
                            all_coins.append({
                                "id": coin_id,
                                "name": name,
                                "symbol": sym,
                                "ticker": ticker,
                                "market_cap_rank": item.get("market_cap_rank"),
                                "image": str(item.get("image", "")),
                                "last_updated": str(item.get("last_updated") or datetime.now(timezone.utc).isoformat()),
                            })
                    else:
                        break
            except Exception:
                # If a page fails or rate limits, break and return accumulated results
                break

            # Sleep slightly between page fetches to respect API limits
            time.sleep(0.2)

        if not all_coins:
            raise RuntimeError("Failed to fetch remote catalog from CoinGecko API.")

        return all_coins

    def load_catalog_data(self, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Load cached catalog if valid (<30 mins old), otherwise fetch fresh paginated catalog.
        """
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        now = time.time()
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        # 1. Check valid cache on disk if not force_refresh
        if not force_refresh and CACHE_FILE.exists():
            try:
                with CACHE_FILE.open("r", encoding="utf-8") as f:
                    cached = json.load(f)
                    ts = cached.get("timestamp", 0)
                    items = cached.get("items")
                    if now - ts < CACHE_TTL_SECONDS and isinstance(items, list) and len(items) > 0:
                        return {
                            "items": items,
                            "count": len(items),
                            "source": cached.get("source", "Cached Catalog"),
                            "cached": True,
                            "last_updated": cached.get("last_updated", now_iso),
                        }
            except Exception:
                pass

        # 2. Fetch fresh remote catalog
        try:
            items = self.fetch_paginated_remote_catalog()
            payload = {
                "timestamp": now,
                "last_updated": now_iso,
                "source": "CoinGecko Public API",
                "items": items,
            }
            with CACHE_FILE.open("w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)

            return {
                "items": items,
                "count": len(items),
                "source": "CoinGecko Public API",
                "cached": False,
                "last_updated": now_iso,
            }
        except Exception:
            pass

        # 3. Fallback to expired cache if available
        if CACHE_FILE.exists():
            try:
                with CACHE_FILE.open("r", encoding="utf-8") as f:
                    cached = json.load(f)
                    items = cached.get("items")
                    if isinstance(items, list) and len(items) > 0:
                        return {
                            "items": items,
                            "count": len(items),
                            "source": "Cached Catalog (Offline Fallback)",
                            "cached": True,
                            "last_updated": cached.get("last_updated", now_iso),
                        }
            except Exception:
                pass

        # 4. Fallback to built-in items
        return {
            "items": FALLBACK_ITEMS,
            "count": len(FALLBACK_ITEMS),
            "source": "Default Offline Fallback",
            "cached": True,
            "last_updated": now_iso,
        }

    def get_catalog(self, query: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Retrieve the dynamic cryptocurrency catalog enriched with model availability metadata.
        """
        raw = self.load_catalog_data(force_refresh=force_refresh)
        items = raw["items"]

        enriched_items = []
        for item in items:
            ticker = item["ticker"]
            has_model = _check_model_exists(ticker)
            training_status = "ready" if has_model else "not_started"

            enriched_items.append({
                "id": item["id"],
                "name": item["name"],
                "symbol": item["symbol"],
                "ticker": ticker,
                "market_cap_rank": item.get("market_cap_rank"),
                "image": item.get("image"),
                "last_updated": item.get("last_updated"),
                "historical_data_available": True,
                "market_data_available": True,
                "has_trained_model": has_model,
                "model_available": has_model,
                "training_status": training_status,
            })

        # Apply search filter if query string provided
        if query and query.strip():
            q = query.strip().lower()
            enriched_items = [
                coin for coin in enriched_items
                if q in coin["name"].lower() or q in coin["symbol"].lower() or q in coin["ticker"].lower() or q in coin["id"].lower()
            ]

        return {
            "items": enriched_items,
            "count": len(enriched_items),
            "source": raw["source"],
            "cached": raw["cached"],
            "last_updated": raw["last_updated"],
        }

    def force_refresh_catalog(self) -> Dict[str, Any]:
        """
        Explicitly clear cache and re-fetch fresh catalog from remote provider.
        """
        raw = self.load_catalog_data(force_refresh=True)
        return {
            "status": "success",
            "cryptocurrency_count": raw["count"],
            "refreshed_at": raw["last_updated"],
            "source": raw["source"],
        }


# Global singleton instance
crypto_catalog_service = CryptoCatalogService()
