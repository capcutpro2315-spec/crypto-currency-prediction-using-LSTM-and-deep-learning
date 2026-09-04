"""
FastAPI Backend Application Entry Point.

Wires REST API routes, CORS middleware, error handlers, and Swagger documentation
for the Cryptocurrency Price Prediction AI system.
"""

from __future__ import annotations

import os
from typing import Dict, Any
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.exceptions import InsufficientDataError, InvalidCryptocurrencyError, UnsupportedTickerError
from app.routes.crypto import router as crypto_router
from app.routes.market import router as market_router
from app.routes.prediction import router as prediction_router

# Configure CORS origins from environment variables (supports FRONTEND_ORIGIN, FRONTEND_URL, or ALLOWED_ORIGINS)
raw_origins = (
    os.getenv("FRONTEND_ORIGIN")
    or os.getenv("FRONTEND_URL")
    or os.getenv("ALLOWED_ORIGINS")
    or "http://localhost:3000,http://127.0.0.1:3000,https://crypto-price-prediction.vercel.app"
)
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app = FastAPI(
    title="Cryptocurrency Price Prediction API",
    description="LSTM Deep Learning & Time-Series Cryptocurrency Price Forecasting Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Enable CORS for Next.js frontend (local development or Vercel production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API routers
app.include_router(crypto_router)
app.include_router(market_router)
app.include_router(prediction_router)


# Global Exception Handlers
@app.exception_handler(InvalidCryptocurrencyError)
async def invalid_crypto_handler(request: Request, exc: InvalidCryptocurrencyError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


@app.exception_handler(UnsupportedTickerError)
async def unsupported_ticker_handler(request: Request, exc: UnsupportedTickerError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )


@app.exception_handler(InsufficientDataError)
async def insufficient_data_handler(request: Request, exc: InsufficientDataError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": str(exc)},
    )


@app.exception_handler(FileNotFoundError)
async def file_not_found_handler(request: Request, exc: FileNotFoundError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )


# Health Check Endpoints (Root & /health & /api/health)
@app.get("/", tags=["Health"], summary="API Root Status")
@app.get("/health", tags=["Health"], summary="Cloud Health Check Probe")
@app.get(
    "/api/health",
    tags=["Health"],
    summary="API Health Check",
    description="Returns backend service health status and API version info without executing expensive ML ops.",
)
def health_check() -> Dict[str, Any]:
    """Lightweight health check endpoint for platform monitoring probes."""
    return {
        "status": "ok",
        "service": "Cryptocurrency Price Prediction Backend API",
        "version": "1.0.0",
        "environment": os.getenv("ENV", "production"),
    }


@app.get(
    "/api/system/status",
    tags=["Health"],
    summary="Detailed System Status",
    description="Returns telemetry metrics for backend status, data provider connectivity, and model registry availability.",
)
def system_status() -> Dict[str, Any]:
    """Detailed system and data pipeline status telemetry."""
    from app.config import MODELS_SAVED_DIR, DATA_RAW_DIR
    from app.services.crypto_registry import get_crypto_registry

    registry = get_crypto_registry()
    assets = registry.list_active_assets()
    saved_models = list(MODELS_SAVED_DIR.glob("*.keras"))

    return {
        "status": "operational",
        "version": "1.0.0",
        "backend": "FastAPI",
        "providers": ["CoinGecko", "Binance", "Yahoo Finance"],
        "active_cryptocurrencies_count": len(assets),
        "saved_lstm_models_count": len(saved_models),
        "raw_data_dir_exists": DATA_RAW_DIR.exists(),
        "models_dir_exists": MODELS_SAVED_DIR.exists(),
    }
