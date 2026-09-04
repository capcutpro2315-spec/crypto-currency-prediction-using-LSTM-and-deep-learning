"""
LSTM prediction and model evaluation REST API routes.
"""

from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, status

from app.exceptions import InsufficientDataError, InvalidCryptocurrencyError, UnsupportedTickerError
from app.schemas.prediction import (
    CryptoDecisionResponse,
    CryptoPredictionResponse,
    ModelEvaluationMetrics,
    PredictionRequest,
)
from app.services.prediction_service import (
    get_actual_vs_predicted_data,
    get_decision_support,
    get_evaluation_metrics,
    get_model_status,
    predict_next_close,
    start_background_training,
)

router = APIRouter(prefix="/api/predictions", tags=["Predictions & Evaluation"])


@router.get(
    "/{ticker}/status",
    summary="Get LSTM Model & Training Status",
    description="Returns availability status, training job state, model age, and freshness metadata for a cryptocurrency ticker.",
)
def get_prediction_status(ticker: str) -> Dict[str, Any]:
    """Retrieve model training lifecycle and artifact status."""
    try:
        return get_model_status(ticker)
    except InvalidCryptocurrencyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Status check error: {e}") from e


@router.post(
    "/{ticker}/train",
    summary="Trigger Asynchronous LSTM Model Training",
    description="Spawns an offline background training thread to build and fit an LSTM model for the ticker without blocking API responses.",
)
def trigger_training(ticker: str, force: bool = False) -> Dict[str, Any]:
    """Trigger non-blocking background model training for a ticker."""
    try:
        return start_background_training(ticker, force=force)
    except InvalidCryptocurrencyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Training trigger error: {e}") from e


@router.post(
    "",
    response_model=CryptoPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Next Closing-Price Forecast (POST)",
    description="Loads the trained LSTM model for the requested cryptocurrency, extracts the latest 60-day historical window, and returns the next daily closing-price prediction in USD scale.",
)
def create_prediction(request: PredictionRequest) -> CryptoPredictionResponse:
    """Generate next daily price prediction for a cryptocurrency."""
    try:
        res = predict_next_close(identifier=request.ticker)
        return CryptoPredictionResponse(**res)
    except (InvalidCryptocurrencyError, UnsupportedTickerError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except FileNotFoundError as e:
        start_background_training(request.ticker)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except InsufficientDataError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction error: {e}") from e


@router.get(
    "/{ticker}",
    response_model=CryptoPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Next Closing-Price Forecast (GET)",
    description="Loads the trained LSTM model for the requested cryptocurrency ticker parameter.",
)
def get_prediction_by_ticker(ticker: str) -> CryptoPredictionResponse:
    """Generate next daily price prediction for a cryptocurrency ticker path parameter."""
    try:
        res = predict_next_close(identifier=ticker)
        return CryptoPredictionResponse(**res)
    except (InvalidCryptocurrencyError, UnsupportedTickerError) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except FileNotFoundError as e:
        start_background_training(ticker)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except InsufficientDataError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction error: {e}") from e


@router.get(
    "/{ticker}/metrics",
    summary="Get Model Evaluation Metrics",
    description="Returns saved regression evaluation metrics (MAE, MSE, RMSE, R²) for the trained LSTM model calculated on test data.",
)
def get_metrics(ticker: str) -> Dict[str, Any]:
    """Retrieve test-set evaluation metrics for a cryptocurrency model."""
    try:
        return get_evaluation_metrics(identifier=ticker)
    except InvalidCryptocurrencyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evaluation metrics not found for '{ticker}'.") from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Metrics retrieval error: {e}") from e


@router.get(
    "/{ticker}/history",
    summary="Get Actual vs Predicted Test History",
    description="Returns held-out test period predictions alongside actual historical closing prices for charting.",
)
def get_prediction_history(ticker: str) -> List[Dict[str, Any]]:
    """Retrieve actual vs predicted dataset for the test period."""
    try:
        df = get_actual_vs_predicted_data(identifier=ticker)
    except InvalidCryptocurrencyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prediction history dataset not found for '{ticker}'.") from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"History retrieval error: {e}") from e

    records: List[Dict[str, Any]] = []
    date_col = "date" if "date" in df.columns else "Date"
    actual_col = "actual_close" if "actual_close" in df.columns else "Actual Close"
    pred_col = "predicted_close" if "predicted_close" in df.columns else "Predicted Close"

    for _, row in df.iterrows():
        date_str = str(row[date_col])[:10]
        records.append(
            {
                "date": date_str,
                "actual_close": float(row[actual_col]),
                "predicted_close": float(row[pred_col]),
            }
        )

    return records


@router.get(
    "/{ticker}/decision",
    response_model=CryptoDecisionResponse,
    summary="Get AI Decision-Support Analysis",
    description="Generates AI decision-support signals (CONSIDER, WAIT, AVOID), model confidence score, risk rating, volatility analysis, and dynamic supporting/risk factors.",
)
def get_decision(ticker: str) -> CryptoDecisionResponse:
    """Retrieve AI decision-support analysis for a cryptocurrency."""
    try:
        res = get_decision_support(identifier=ticker)
        return CryptoDecisionResponse(**res)
    except InvalidCryptocurrencyError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AI decision support will become available after the LSTM model is trained.") from e
    except InsufficientDataError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Decision support calculation error: {e}") from e


