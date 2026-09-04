"""
Cryptocurrency listing and historical data REST API routes.
"""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.config import MODELS_SAVED_DIR
from app.exceptions import InvalidCryptocurrencyError, UnsupportedTickerError
from app.schemas.crypto import (
    CryptoAssetSchema,
    HistoricalDataResponse,
    HistoricalRecordSchema,
    SupportedCryptosResponse,
)
from app.services.crypto_catalog_service import crypto_catalog_service
from app.services.crypto_registry import resolve_cryptocurrency
from app.services.preprocessing import load_cleaned_data

router = APIRouter(prefix="/api/cryptocurrencies", tags=["Cryptocurrencies"])


@router.get(
    "",
    response_model=SupportedCryptosResponse,
    summary="List Supported Cryptocurrencies",
    description="Returns the complete dynamic cryptocurrency catalog from external providers, indicating availability and 30-minute caching status.",
)
def list_cryptocurrencies(
    q: Optional[str] = Query(None, description="Search filter query by symbol or name")
) -> SupportedCryptosResponse:
    """List cryptocurrencies from the dynamic catalog."""
    try:
        catalog_data = crypto_catalog_service.get_catalog(query=q)
        items_schema = [CryptoAssetSchema(**item) for item in catalog_data["items"]]

        return SupportedCryptosResponse(
            items=items_schema,
            count=catalog_data["count"],
            source=catalog_data["source"],
            cached=catalog_data["cached"],
            last_updated=catalog_data["last_updated"],
            total=catalog_data["count"],
            cryptocurrencies=items_schema,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Catalog error: {e}") from e


@router.post(
    "/refresh",
    summary="Force Refresh Cryptocurrency Catalog",
    description="Clears local cache, re-fetches the latest paginated catalog from remote providers, and stores the updated catalog.",
)
def refresh_cryptocurrency_catalog() -> dict:
    """Force refresh the dynamic cryptocurrency catalog."""
    try:
        return crypto_catalog_service.force_refresh_catalog()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Catalog refresh error: {e}") from e




@router.get(
    "/{ticker}/history",
    response_model=HistoricalDataResponse,
    summary="Get Historical Price Data",
    description="Returns historical daily OHLCV price observations for the requested cryptocurrency ticker.",
)
def get_crypto_history(
    ticker: str,
    limit: Optional[int] = Query(365, ge=1, le=5000, description="Maximum number of recent daily records to return"),
) -> HistoricalDataResponse:
    """Retrieve historical daily price data."""
    try:
        asset = resolve_cryptocurrency(ticker)
        df = load_cleaned_data(ticker)
    except InvalidCryptocurrencyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except (UnsupportedTickerError, FileNotFoundError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Data loading error: {e}") from e

    if limit and limit < len(df):
        df = df.iloc[-limit:]

    records: List[HistoricalRecordSchema] = []
    for _, row in df.iterrows():
        date_str = row["Date"].strftime("%Y-%m-%d") if hasattr(row["Date"], "strftime") else str(row["Date"])[:10]
        records.append(
            HistoricalRecordSchema(
                date=date_str,
                open=float(row["Open"]),
                high=float(row["High"]),
                low=float(row["Low"]),
                close=float(row["Close"]),
                volume=float(row["Volume"]),
            )
        )

    return HistoricalDataResponse(
        cryptocurrency=asset.name,
        ticker=asset.ticker,
        total_records=len(records),
        records=records,
    )
