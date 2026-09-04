"""
Cryptocurrency registry and ticker resolution.

Maps user-provided identifiers (symbol, name, or Yahoo ticker) to a
provider ticker suitable for yfinance historical data download.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.config import CRYPTO_REGISTRY_PATH, DEFAULT_QUOTE_CURRENCY
from app.exceptions import InvalidCryptocurrencyError, UnsupportedTickerError


@dataclass(frozen=True)
class CryptoAsset:
    """Resolved cryptocurrency metadata."""

    name: str
    symbol: str
    yahoo_ticker: str
    provider_id: str
    provider: str = "yfinance"
    historical_data_available: bool | None = None  # set after provider probe

    @property
    def ticker(self) -> str:
        return self.yahoo_ticker

    @property
    def quote_currency(self) -> str:
        return "USD"


class CryptoRegistry:
    """Configurable registry loaded from JSON; extensible without code changes."""

    def __init__(self, registry_path: Path | None = None) -> None:
        self.registry_path = registry_path or CRYPTO_REGISTRY_PATH
        self._data = self._load_registry()

    def _load_registry(self) -> dict[str, Any]:
        if not self.registry_path.exists():
            raise FileNotFoundError(
                f"Cryptocurrency registry not found: {self.registry_path}"
            )
        with self.registry_path.open(encoding="utf-8") as f:
            return json.load(f)

    @property
    def provider(self) -> str:
        return self._data.get("provider", "yfinance")

    @property
    def quote_currency(self) -> str:
        return self._data.get("quote_currency", DEFAULT_QUOTE_CURRENCY)

    def list_assets(self, active_only: bool = True) -> list[CryptoAsset]:
        """Return all registered assets for future frontend/API listing."""
        assets: list[CryptoAsset] = []
        for entry in self._data.get("assets", []):
            if active_only and not entry.get("active", True):
                continue
            assets.append(self._entry_to_asset(entry))
        return assets

    def get_by_symbol(self, symbol: str) -> CryptoAsset | None:
        symbol = symbol.upper().strip()
        for entry in self._data.get("assets", []):
            if entry.get("symbol", "").upper() == symbol:
                return self._entry_to_asset(entry)
        return None

    def get_by_ticker(self, ticker: str) -> CryptoAsset | None:
        ticker = ticker.upper().strip()
        for entry in self._data.get("assets", []):
            if entry.get("yahoo_ticker", "").upper() == ticker:
                return self._entry_to_asset(entry)
        return None

    def resolve(self, identifier: str) -> CryptoAsset:
        """
        Resolve a user identifier to a CryptoAsset.

        Accepted forms:
        - Registry symbol: "BTC"
        - Yahoo ticker: "BTC-USD"
        - Symbol-quote pattern: resolves via "{SYMBOL}-USD" when not in registry
        """
        if not identifier or not str(identifier).strip():
            raise InvalidCryptocurrencyError(
                "Cryptocurrency identifier is empty or invalid."
            )

        normalized = str(identifier).strip().upper()

        # Direct ticker match in registry
        by_ticker = self.get_by_ticker(normalized)
        if by_ticker:
            return by_ticker

        # Symbol match in registry
        by_symbol = self.get_by_symbol(normalized)
        if by_symbol:
            return by_symbol

        # Yahoo ticker pattern e.g. BTC-USD, DOGE-USD, UNSUPPORTED_COIN_XYZ_123-USD
        if re.match(r"^[A-Z0-9_\-\.]+\-[A-Z]+$", normalized) or normalized.endswith(f"-{self.quote_currency}"):
            symbol = normalized.rsplit("-", 1)[0]
            return CryptoAsset(
                name=symbol,
                symbol=symbol,
                yahoo_ticker=normalized,
                provider_id=normalized,
                provider=self.provider,
            )

        # Bare symbol not in registry: attempt standard Yahoo crypto ticker
        candidate_ticker = f"{normalized}-{self.quote_currency}"
        return CryptoAsset(
            name=normalized,
            symbol=normalized,
            yahoo_ticker=candidate_ticker,
            provider_id=candidate_ticker,
            provider=self.provider,
        )

    def resolve_or_raise(self, identifier: str) -> CryptoAsset:
        """Resolve identifier; raise if format is clearly invalid."""
        try:
            return self.resolve(identifier)
        except InvalidCryptocurrencyError:
            raise
        except Exception as exc:
            raise InvalidCryptocurrencyError(
                f"Unable to resolve cryptocurrency '{identifier}': {exc}"
            ) from exc

    @staticmethod
    def _entry_to_asset(entry: dict[str, Any]) -> CryptoAsset:
        return CryptoAsset(
            name=entry["name"],
            symbol=entry["symbol"].upper(),
            yahoo_ticker=entry["yahoo_ticker"].upper(),
            provider_id=entry.get("provider_id", entry["yahoo_ticker"]).upper(),
            provider=entry.get("provider", "yfinance"),
            historical_data_available=entry.get("historical_data_available"),
        )


# Module-level singleton for convenience
_default_registry: CryptoRegistry | None = None


def get_registry() -> CryptoRegistry:
    global _default_registry
    if _default_registry is None:
        _default_registry = CryptoRegistry()
    return _default_registry


def resolve_cryptocurrency(identifier: str) -> CryptoAsset:
    """Resolve a cryptocurrency identifier to provider metadata."""
    return get_registry().resolve_or_raise(identifier)


def list_available_cryptocurrencies(active_only: bool = True) -> list[CryptoAsset]:
    """List cryptocurrencies from the configurable registry."""
    return get_registry().list_assets(active_only=active_only)


get_supported_cryptocurrencies = list_available_cryptocurrencies
