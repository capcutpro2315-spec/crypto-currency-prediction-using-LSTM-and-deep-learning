"""
Market summary and live market data REST API routes.
"""

from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status

from app.exceptions import InvalidCryptocurrencyError, UnsupportedTickerError
from app.schemas.market import MarketSummaryResponse
from app.services.crypto_registry import resolve_cryptocurrency
from app.services.market_data_service import market_data_service
from app.services.preprocessing import load_cleaned_data

router = APIRouter(prefix="/api/market", tags=["Market Summary"])


@router.get(
    "/{ticker}/live",
    summary="Get Live Cryptocurrency Market Data",
    description="Returns live normalized market price, 24h change, volume, timestamp, provider source, and freshness data.",
)
def get_live_market(ticker: str) -> Dict[str, Any]:
    """Retrieve live market data from external data provider abstraction."""
    try:
        data = market_data_service.get_live_market_data(ticker)
        return data.to_dict()
    except InvalidCryptocurrencyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Live market data fetch error for '{ticker}': {e}",
        ) from e


@router.get(
    "/{ticker}/summary",
    response_model=MarketSummaryResponse,
    summary="Get Market Summary Statistics",
    description="Returns current price, volume, latest observation date, and historical high/low statistics for a cryptocurrency.",
)
def get_market_summary(ticker: str) -> MarketSummaryResponse:
    """Retrieve market summary statistics for a cryptocurrency."""
    try:
        asset = resolve_cryptocurrency(ticker)
        df = load_cleaned_data(ticker)
    except InvalidCryptocurrencyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except (UnsupportedTickerError, FileNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Market data loading error: {e}") from e

    if df.empty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No market data available for '{ticker}'.")

    # Try live price first, fallback to historical close
    try:
        live_data = market_data_service.get_live_market_data(ticker)
        current_price = live_data.price
        volume = live_data.volume if live_data.volume > 0 else float(df.iloc[-1]["Volume"])
    except Exception:
        latest_row = df.iloc[-1]
        current_price = float(latest_row["Close"])
        volume = float(latest_row["Volume"])

    latest_row = df.iloc[-1]
    latest_date_str = latest_row["Date"].strftime("%Y-%m-%d") if hasattr(latest_row["Date"], "strftime") else str(latest_row["Date"])[:10]

    return MarketSummaryResponse(
        cryptocurrency=asset.name,
        ticker=asset.ticker,
        current_price=current_price,
        latest_date=latest_date_str,
        latest_volume=volume,
        historical_high=float(df["High"].max()),
        historical_low=float(df["Low"].min()),
    )

