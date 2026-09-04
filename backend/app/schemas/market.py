"""
Pydantic schemas for market summary endpoints.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class MarketSummaryResponse(BaseModel):
    """Market summary statistics for a cryptocurrency."""
    cryptocurrency: str = Field(..., description="Full cryptocurrency name")
    ticker: str = Field(..., description="Trading ticker symbol")
    current_price: float = Field(..., description="Most recent closing price in USD")
    latest_date: str = Field(..., description="Date of latest historical observation")
    latest_volume: float = Field(..., description="Most recent daily trading volume")
    historical_high: float = Field(..., description="Maximum High price in dataset")
    historical_low: float = Field(..., description="Minimum Low price in dataset")
