"""
Dynamic cryptocurrency catalog service with external provider integration (CoinGecko)
and local file caching.
"""

from __future__ import annotations

import json
import time
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.config import MODELS_SAVED_DIR
from app.services.crypto_registry import get_registry

CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "cache"
CACHE_FILE = CACHE_DIR / "coin_catalog.json"
CACHE_TTL_SECONDS = 3600  # 1 hour cache TTL

# Default fallback list if offline or rate limited
FALLBACK_CATALOG = [
    {"id": "bitcoin", "name": "Bitcoin", "symbol": "BTC", "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"},
    {"id": "ethereum", "name": "Ethereum", "symbol": "ETH", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"},
    {"id": "solana", "name": "Solana", "symbol": "SOL", "image": "https://assets.coingecko.com/coins/images/4128/large/solana.png"},
    {"id": "dogecoin", "name": "Dogecoin", "symbol": "DOGE", "image": "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"},
    {"id": "ripple", "name": "XRP", "symbol": "XRP", "image": "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"},
    {"id": "cardano", "name": "Cardano", "symbol": "ADA", "image": "https://assets.coingecko.com/coins/images/975/large/cardano.png"},
    {"id": "avalanche-2", "name": "Avalanche", "symbol": "AVAX", "image": "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png"},
    {"id": "chainlink", "name": "Chainlink", "symbol": "LINK", "image": "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png"},
    {"id": "polkadot", "name": "Polkadot", "symbol": "DOT", "image": "https://assets.coingecko.com/coins/images/12171/large/polkadot.png"},
    {"id": "shiba-inu", "name": "Shiba Inu", "symbol": "SHIB", "image": "https://assets.coingecko.com/coins/images/11939/large/shiba.png"},
]


def _check_model_exists(ticker: str) -> bool:
    """Check if a trained .keras model exists for the given ticker."""
    model_path = MODELS_SAVED_DIR / f"{ticker}_lstm.keras"
    return model_path.exists()


def fetch_remote_catalog() -> List[Dict[str, Any]]:
    """Fetch top market cap cryptocurrencies from CoinGecko public API."""
    url = (
        "https://api.coingecko.com/api/v3/coins/markets"
        "?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "CryptoPredictionApp/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        if resp.status == 200:
            raw_data = json.loads(resp.read().decode("utf-8"))
            catalog = []
            for item in raw_data:
                sym = str(item.get("symbol", "")).upper()
                if not sym:
                    continue
                catalog.append({
                    "id": str(item.get("id", "")),
                    "name": str(item.get("name", "")),
                    "symbol": sym,
                    "image": str(item.get("image", "")),
                })
            return catalog
    raise RuntimeError("CoinGecko API returned non-200 response")


def load_cached_catalog() -> List[Dict[str, Any]]:
    """Load cached catalog from disk if valid, otherwise fetch fresh from remote API."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    if CACHE_FILE.exists():
        try:
            with CACHE_FILE.open("r", encoding="utf-8") as f:
                cached = json.load(f)
                timestamp = cached.get("timestamp", 0)
                if time.time() - timestamp < CACHE_TTL_SECONDS and isinstance(cached.get("items"), list):
                    return cached["items"]
        except Exception:
            pass

    # Try fetching fresh remote catalog
    try:
        remote_items = fetch_remote_catalog()
        if remote_items:
            cache_payload = {
                "timestamp": time.time(),
                "items": remote_items,
            }
            with CACHE_FILE.open("w", encoding="utf-8") as f:
                json.dump(cache_payload, f, indent=2)
            return remote_items
    except Exception:
        pass

    # If cache is present but expired and remote call failed, fallback to expired cache
    if CACHE_FILE.exists():
        try:
            with CACHE_FILE.open("r", encoding="utf-8") as f:
                cached = json.load(f)
                if isinstance(cached.get("items"), list):
                    return cached["items"]
        except Exception:
            pass

    return FALLBACK_CATALOG


def get_dynamic_catalog(query: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get the full dynamic cryptocurrency catalog enriched with availability metadata.
    """
    base_items = load_cached_catalog()
    registry = get_registry()

    result = []
    seen_tickers = set()

    # First include registry assets to ensure known tickers are primary
    for registered_asset in registry.list_assets():
        ticker = registered_asset.yahoo_ticker
        seen_tickers.add(ticker)
        has_model = _check_model_exists(ticker)
        training_status = "ready" if has_model else "not_started"
        result.append({
            "id": registered_asset.provider_id.lower(),
            "name": registered_asset.name,
            "symbol": registered_asset.symbol,
            "ticker": ticker,
            "provider_id": registered_asset.provider_id,
            "image": None,
            "historical_data_available": True,
            "market_data_available": True,
            "has_trained_model": has_model,
            "model_available": has_model,
            "training_status": training_status,
        })

    # Append coins from external catalog
    for item in base_items:
        sym = item["symbol"].upper()
        ticker = f"{sym}-USD"
        if ticker in seen_tickers:
            continue
        seen_tickers.add(ticker)

        has_model = _check_model_exists(ticker)
        training_status = "ready" if has_model else "not_started"
        result.append({
            "id": item.get("id", sym.lower()),
            "name": item.get("name", sym),
            "symbol": sym,
            "ticker": ticker,
            "provider_id": item.get("id", sym.lower()),
            "image": item.get("image"),
            "historical_data_available": True,
            "market_data_available": True,
            "has_trained_model": has_model,
            "model_available": has_model,
            "training_status": training_status,
        })

    if query and query.strip():
        q = query.strip().lower()
        result = [
            coin for coin in result
            if q in coin["name"].lower() or q in coin["symbol"].lower() or q in coin["ticker"].lower()
        ]

    return result
