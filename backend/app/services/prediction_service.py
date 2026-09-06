"""
LSTM Inference Orchestration & Model Lifecycle Service.

Loads a saved trained Keras model artifact, fetches and preprocesses recent 
cryptocurrency price data, executes non-blocking background model training for 
unmodelled tickers, and generates closing-price predictions.
"""

from __future__ import annotations

import json
import threading
import time
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
import tensorflow as tf

from app.config import DEFAULT_CRYPTO, DEFAULT_SEQUENCE_LENGTH, DATA_PROCESSED_DIR, MODELS_SAVED_DIR
from app.exceptions import InsufficientDataError, InvalidCryptocurrencyError
from app.models.lstm_model import load_trained_model
from app.services.crypto_registry import resolve_cryptocurrency
from app.services.preprocessing import preprocess_crypto

# Simple in-memory model cache to prevent re-reading identical model weights during single session
_MODEL_CACHE: Dict[str, Any] = {}

# Background training job registry and threading lock
_TRAINING_JOBS: Dict[str, str] = {}
_TRAINING_LOCK = threading.Lock()
MODEL_RETRAIN_INTERVAL_HOURS = 24.0


def load_cached_model(model_path: Path) -> Any:
    """Load a model artifact with caching."""
    path_str = str(model_path.resolve())
    if path_str not in _MODEL_CACHE:
        _MODEL_CACHE[path_str] = load_trained_model(model_path)
    return _MODEL_CACHE[path_str]


def get_model_status(identifier: str) -> Dict[str, Any]:
    """Retrieve adaptive model training lifecycle and artifact status for a cryptocurrency."""
    asset = resolve_cryptocurrency(identifier)
    ticker = asset.ticker

    # Check historical data availability and compute adaptive lookback
    available_history_days = 0
    lookback_days = None
    try:
        from app.services.data_service import get_or_download_historical_data
        df, _ = get_or_download_historical_data(ticker)
        available_history_days = len(df)
        from app.services.preprocessing import compute_adaptive_lookback
        lookback_days, err_msg = compute_adaptive_lookback(available_history_days)
    except Exception as e:
        return {
            "ticker": ticker,
            "cryptocurrency": asset.name,
            "data_available": False,
            "model_available": False,
            "prediction_available": False,
            "training_status": "failed",
            "available_history_days": 0,
            "lookback_days": None,
            "model_age_hours": None,
            "is_stale": False,
            "message": f"Historical data acquisition failed for {asset.name}: {e}",
        }

    if lookback_days is None or available_history_days < 30:
        return {
            "ticker": ticker,
            "cryptocurrency": asset.name,
            "data_available": True,
            "model_available": False,
            "prediction_available": False,
            "training_status": "insufficient_data",
            "available_history_days": available_history_days,
            "lookback_days": None,
            "model_age_hours": None,
            "is_stale": False,
            "message": f"At least 30 days of valid historical data is required for an initial LSTM forecast (got {available_history_days} days).",
        }

    # Check for adaptive or default trained model artifact
    model_path_adaptive = MODELS_SAVED_DIR / f"{ticker}_lstm_{lookback_days}d.keras"
    model_path_legacy = MODELS_SAVED_DIR / f"{ticker}_lstm.keras"
    model_path = model_path_adaptive if model_path_adaptive.exists() else model_path_legacy

    with _TRAINING_LOCK:
        job_status = _TRAINING_JOBS.get(ticker)

    if job_status == "training":
        return {
            "ticker": ticker,
            "cryptocurrency": asset.name,
            "data_available": True,
            "model_available": False,
            "prediction_available": False,
            "training_status": "training",
            "available_history_days": available_history_days,
            "lookback_days": lookback_days,
            "model_age_hours": None,
            "is_stale": False,
            "message": f"Training {lookback_days}-day LSTM model for {asset.name}... This may take a few minutes.",
        }

    if model_path.exists():
        age_hours = (time.time() - model_path.stat().st_mtime) / 3600.0
        is_stale = age_hours > MODEL_RETRAIN_INTERVAL_HOURS
        return {
            "ticker": ticker,
            "cryptocurrency": asset.name,
            "data_available": True,
            "model_available": True,
            "prediction_available": True,
            "training_status": "ready",
            "available_history_days": available_history_days,
            "lookback_days": lookback_days,
            "model_age_hours": round(age_hours, 2),
            "is_stale": is_stale,
            "message": f"Trained {lookback_days}-day LSTM model ready for {asset.name}.",
        }

    if job_status == "failed":
        return {
            "ticker": ticker,
            "cryptocurrency": asset.name,
            "data_available": True,
            "model_available": False,
            "prediction_available": False,
            "training_status": "failed",
            "available_history_days": available_history_days,
            "lookback_days": lookback_days,
            "model_age_hours": None,
            "is_stale": False,
            "message": f"Previous model training attempt failed for {asset.name}.",
        }

    return {
        "ticker": ticker,
        "cryptocurrency": asset.name,
        "data_available": True,
        "model_available": False,
        "prediction_available": False,
        "training_status": "not_started",
        "available_history_days": available_history_days,
        "lookback_days": lookback_days,
        "model_age_hours": None,
        "is_stale": False,
        "message": f"Historical data available ({available_history_days} days). {lookback_days}-day model not yet trained for {asset.name}.",
    }



def start_background_training(identifier: str, force: bool = False) -> Dict[str, Any]:
    """
    Asynchronously spawn an offline LSTM training job for a cryptocurrency without blocking API requests.
    """
    asset = resolve_cryptocurrency(identifier)
    ticker = asset.ticker

    status = get_model_status(ticker)
    if status["training_status"] == "ready" and not force and not status.get("is_stale", False):
        return status

    with _TRAINING_LOCK:
        if _TRAINING_JOBS.get(ticker) == "training":
            return status
        _TRAINING_JOBS[ticker] = "training"

    def _worker():
        try:
            from training.train_lstm import train_crypto_lstm
            train_crypto_lstm(identifier=ticker, epochs=40, batch_size=32, verbose=0)
            with _TRAINING_LOCK:
                _TRAINING_JOBS[ticker] = "ready"
                # Clear cached model if re-trained
                target_path = str((MODELS_SAVED_DIR / f"{ticker}_lstm.keras").resolve())
                _MODEL_CACHE.pop(target_path, None)
        except Exception as exc:
            print(f"[BACKGROUND TRAINING ERROR] Training failed for {ticker}: {exc}")
            with _TRAINING_LOCK:
                _TRAINING_JOBS[ticker] = "failed"

    t = threading.Thread(target=_worker, daemon=True)
    t.start()

    return {
        "ticker": ticker,
        "cryptocurrency": asset.name,
        "data_available": True,
        "model_available": False,
        "training_status": "training",
        "model_age_hours": None,
        "is_stale": False,
        "message": f"Started background LSTM training for {asset.name}.",
    }


def predict_next_close(
    identifier: str = DEFAULT_CRYPTO,
    model_path: Optional[Path | str] = None,
    use_cache: bool = True,
) -> Dict[str, Any]:
    """
    Generate next closing price prediction for a given cryptocurrency using adaptive lookback.
    Enforces model identity protection, scenario bounds calculation, and source transparency.
    """
    asset = resolve_cryptocurrency(identifier)
    ticker = asset.ticker
    crypto_name = asset.name

    data = preprocess_crypto(identifier=identifier)
    lookback_days = data.lookback_days
    available_history_days = data.available_history_days
    scaler = data.scaler

    if model_path is None:
        target_model_path_adaptive = MODELS_SAVED_DIR / f"{ticker}_lstm_{lookback_days}d.keras"
        target_model_path_legacy = MODELS_SAVED_DIR / f"{ticker}_lstm.keras"
        target_model_path = target_model_path_adaptive if target_model_path_adaptive.exists() else target_model_path_legacy
    else:
        target_model_path = Path(model_path)

    if not target_model_path.exists():
        start_background_training(ticker)
        raise FileNotFoundError(
            f"Training LSTM model for {crypto_name}... This may take a few minutes."
        )

    # 1. Identity Protection Check against saved metadata
    metadata_path = MODELS_SAVED_DIR / f"{ticker}_lstm_metadata.json"
    rmse_val: Optional[float] = None
    if metadata_path.exists():
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
                meta_ticker = meta.get("ticker", "").upper()
                if meta_ticker and meta_ticker != ticker.upper():
                    raise RuntimeError(f"Model identity mismatch: requested '{ticker}' but metadata specifies '{meta_ticker}'.")
                rmse_val = float(meta.get("test_metrics_original_scale", {}).get("rmse") or 0.0)
        except Exception as e:
            print(f"[IDENTITY CHECK WARNING] {e}")

    try:
        if use_cache:
            model = load_cached_model(target_model_path)
        else:
            model = load_trained_model(target_model_path)
    except Exception as e:
        raise RuntimeError(f"Failed to load trained model artifact '{target_model_path}': {e}") from e

    if len(data.X_test) == 0:
        raise InsufficientDataError(f"Insufficient test sequence data available for inference on '{ticker}'.")

    latest_sequence = data.X_test[-1:]
    pred_scaled = float(model.predict(latest_sequence, verbose=0)[0, 0])

    pred_original_arr = scaler.inverse_transform([[pred_scaled]])
    predicted_next_close = float(pred_original_arr[0, 0])

    latest_actual_close = float(data.current_price)
    latest_date = data.test_dates[-1]
    target_date = latest_date + pd.Timedelta(days=1)

    price_change_amount = predicted_next_close - latest_actual_close
    expected_change_percent = float(((predicted_next_close - latest_actual_close) / latest_actual_close) * 100.0)
    direction = "UP" if price_change_amount > 0 else ("DOWN" if price_change_amount < 0 else "FLAT")

    # 2. Calculate Scenarios (Best / Expected / Worst Case) based on RMSE uncertainty bounds
    scenarios_available = False
    best_case = None
    expected_case = predicted_next_close
    worst_case = None

    if rmse_val is not None and rmse_val > 0:
        scenarios_available = True
        best_case = predicted_next_close + (1.25 * rmse_val)
        worst_case = max(0.0, predicted_next_close - (1.25 * rmse_val))

    # 3. Source Metadata
    sources = {
        "market": "Yahoo Finance / Market Feed",
        "historical": "Yahoo Finance (Daily OHLCV Series)",
        "model": f"Local Trained LSTM ({target_model_path.name})",
        "last_updated": latest_date.strftime("%Y-%m-%d"),
    }

    # 4. Data Used Summary ("What the AI Used")
    data_used = {
        "market_info": {
            "current_price": latest_actual_close,
            "latest_date": latest_date.strftime("%Y-%m-%d"),
            "price_field": "Close",
        },
        "historical_info": {
            "available_history_days": available_history_days,
            "lookback_days": lookback_days,
            "sequence_window": f"Sliding {lookback_days}-day window",
        },
        "model_info": {
            "type": "Stacked LSTM Neural Network",
            "model_id": target_model_path.name,
            "forecast_horizon": "1 day ahead",
        },
        "limitations": [
            "Does not process unannounced macroeconomic news or regulatory policy shifts.",
            "Does not process social media sentiment or exchange order-book depth.",
            "Forecast assumes continuation of historical time-series momentum patterns.",
        ],
    }

    return {
        "cryptocurrency": crypto_name,
        "ticker": ticker,
        "symbol": asset.symbol,
        "quote_currency": asset.quote_currency,
        "current_price": latest_actual_close,
        "predicted_price": predicted_next_close,
        "expected_change_percent": expected_change_percent,
        "price_change_amount": price_change_amount,
        "direction": direction,
        "last_data_date": latest_date.strftime("%Y-%m-%d"),
        "forecast_date": target_date.strftime("%Y-%m-%d"),
        "sequence_length": lookback_days,
        "available_history_days": available_history_days,
        "lookback_days": lookback_days,
        "model_available": True,
        "prediction_available": True,
        "model_name": target_model_path.name,
        "formatted_latest_price": f"${latest_actual_close:,.2f}",
        "formatted_predicted_price": f"${predicted_next_close:,.2f}",
        "scenarios": {
            "available": scenarios_available,
            "best_case": round(best_case, 2) if best_case is not None else None,
            "expected_case": round(expected_case, 2),
            "worst_case": round(worst_case, 2) if worst_case is not None else None,
        },
        "sources": sources,
        "data_used": data_used,
    }


def get_evaluation_metrics(identifier: str = DEFAULT_CRYPTO) -> Dict[str, Any]:
    """Retrieve stored model evaluation metrics (MAE, MSE, RMSE, R²) for a cryptocurrency."""
    asset = resolve_cryptocurrency(identifier)
    ticker = asset.ticker

    metadata_path = MODELS_SAVED_DIR / f"{ticker}_lstm_metadata.json"
    metrics_path = DATA_PROCESSED_DIR / f"{ticker}_metrics.json"

    res: Optional[Dict[str, Any]] = None
    if metrics_path.exists():
        try:
            with open(metrics_path, "r", encoding="utf-8") as f:
                res = json.load(f)
        except Exception:
            res = None

    if res is None and metadata_path.exists():
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
            res = {
                "cryptocurrency": meta.get("cryptocurrency", asset.name),
                "ticker": ticker,
                "metrics": meta.get("test_metrics_original_scale", {}),
                "training_date_range": meta.get("training_date_range", {}),
                "test_date_range": meta.get("test_date_range", {}),
            }
        except Exception:
            res = None

    # Fallback: trigger dynamic generation if metrics missing
    if res is None:
        try:
            get_actual_vs_predicted_data(ticker)
            if metrics_path.exists():
                with open(metrics_path, "r", encoding="utf-8") as f:
                    res = json.load(f)
        except Exception:
            pass

    if res is None:
        raise FileNotFoundError(f"No evaluation metrics artifact found for '{ticker}'.")

    # Standardize output: ensure both flat top-level metrics (mae, mse, rmse, r2) AND nested 'metrics' dictionary key exist
    metrics_dict = res.get("metrics") or {}
    mae = res.get("mae") if res.get("mae") is not None else metrics_dict.get("mae")
    mse = res.get("mse") if res.get("mse") is not None else metrics_dict.get("mse")
    rmse = res.get("rmse") if res.get("rmse") is not None else metrics_dict.get("rmse")
    r2 = res.get("r2") if res.get("r2") is not None else (res.get("r2_score") if res.get("r2_score") is not None else metrics_dict.get("r2"))

    res["mae"] = mae
    res["mse"] = mse
    res["rmse"] = rmse
    res["r2"] = r2
    res["metrics"] = {
        "mae": mae,
        "mse": mse,
        "rmse": rmse,
        "r2": r2,
    }
    return res


def get_actual_vs_predicted_data(identifier: str = DEFAULT_CRYPTO) -> pd.DataFrame:
    """Retrieve stored Actual vs Predicted dataset (Date, Actual Close, Predicted Close) for a cryptocurrency."""
    asset = resolve_cryptocurrency(identifier)
    ticker = asset.ticker

    pred_csv_path = DATA_PROCESSED_DIR / f"{ticker}_predictions.csv"
    alt_csv_path = DATA_PROCESSED_DIR / f"{ticker}_actual_vs_predicted.csv"

    if pred_csv_path.exists():
        return pd.read_csv(pred_csv_path)
    elif alt_csv_path.exists():
        return pd.read_csv(alt_csv_path)

    # Dynamic fallback: generate actual vs predicted evaluation dataset using available trained model artifact
    try:
        data = preprocess_crypto(identifier=ticker)
        lookback_days = data.lookback_days
        model_path_adaptive = MODELS_SAVED_DIR / f"{ticker}_lstm_{lookback_days}d.keras"
        model_path_legacy = MODELS_SAVED_DIR / f"{ticker}_lstm.keras"
        model_path = model_path_adaptive if model_path_adaptive.exists() else model_path_legacy

        if model_path.exists() and len(data.X_test) > 0:
            model = load_cached_model(model_path)
            test_preds_scaled = model.predict(data.X_test, verbose=0)

            y_test_reshaped = data.y_test.reshape(-1, 1)
            y_actual_orig = data.scaler.inverse_transform(y_test_reshaped).flatten()
            y_pred_orig = data.scaler.inverse_transform(test_preds_scaled).flatten()

            dates_str = [d.strftime("%Y-%m-%d") for d in data.test_dates]

            history_df = pd.DataFrame({
                "Date": dates_str,
                "Actual Close": y_actual_orig,
                "Predicted Close": y_pred_orig,
            })

            DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
            history_df.to_csv(pred_csv_path, index=False)

            # Compute and save metrics JSON if missing
            metrics_path = DATA_PROCESSED_DIR / f"{ticker}_metrics.json"
            if not metrics_path.exists():
                mae_val = float(np.mean(np.abs(y_actual_orig - y_pred_orig)))
                mse_val = float(np.mean((y_actual_orig - y_pred_orig) ** 2))
                rmse_val = float(np.sqrt(mse_val))
                ss_res = float(np.sum((y_actual_orig - y_pred_orig) ** 2))
                ss_tot = float(np.sum((y_actual_orig - np.mean(y_actual_orig)) ** 2))
                r2_val = float(1.0 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0

                metrics_data = {
                    "cryptocurrency": asset.name,
                    "ticker": ticker,
                    "mae": mae_val,
                    "mse": mse_val,
                    "rmse": rmse_val,
                    "r2": r2_val,
                    "metrics": {
                        "mae": mae_val,
                        "mse": mse_val,
                        "rmse": rmse_val,
                        "r2": r2_val,
                    },
                    "test_samples": len(y_actual_orig),
                    "test_start_date": dates_str[0] if dates_str else "",
                    "test_end_date": dates_str[-1] if dates_str else "",
                }
                with open(metrics_path, "w", encoding="utf-8") as f:
                    json.dump(metrics_data, f, indent=2)

            return history_df
    except Exception as e:
        print(f"[DYNAMIC EVALUATION ERROR] Failed generating history for {ticker}: {e}")

    raise FileNotFoundError(f"No prediction history dataset found for '{ticker}'.")


def get_decision_support(identifier: str = DEFAULT_CRYPTO) -> Dict[str, Any]:
    """Generate decision-support analysis for a cryptocurrency using prediction and decision services."""
    from app.services.decision_service import generate_decision_support
    from app.services.preprocessing import load_cleaned_data

    asset = resolve_cryptocurrency(identifier)
    ticker = asset.ticker

    try:
        pred_res = predict_next_close(identifier=ticker)
    except (InsufficientDataError, FileNotFoundError) as err:
        try:
            df = load_cleaned_data(ticker)
            last_date_str = df["Date"].iloc[-1].strftime("%Y-%m-%d") if hasattr(df["Date"].iloc[-1], "strftime") else str(df["Date"].iloc[-1])[:10]
            current_close = float(df["Close"].iloc[-1])
        except Exception:
            last_date_str = None
            current_close = 0.0

        return {
            "cryptocurrency": asset.name,
            "ticker": ticker,
            "current_price": current_close,
            "predicted_price": None,
            "expected_change_percent": None,
            "confidence_score": None,
            "confidence_label": "Unavailable",
            "volatility": 0.0,
            "volatility_label": "N/A",
            "risk_score": 0.0,
            "risk_label": "N/A",
            "decision_score": 0.0,
            "decision": "UNAVAILABLE",
            "supporting_factors": [],
            "risk_factors": [
                "AI decision support is unavailable because insufficient historical data is available for LSTM forecasting."
            ],
            "last_available_date": last_date_str,
            "forecast_date": None,
            "prediction_available": False,
        }

    df = load_cleaned_data(ticker)
    close_prices = df["Close"]

    try:
        metrics_meta = get_evaluation_metrics(ticker)
        metrics = metrics_meta.get("metrics") or metrics_meta
    except Exception:
        metrics = None

    decision_res = generate_decision_support(
        current_price=pred_res["current_price"],
        predicted_price=pred_res["predicted_price"],
        expected_change_percent=pred_res["expected_change_percent"],
        close_prices=close_prices,
        metrics=metrics,
        cryptocurrency=asset.name,
        ticker=ticker,
        last_available_date=pred_res["last_data_date"],
        forecast_date=pred_res["forecast_date"],
    )
    decision_res["prediction_available"] = True
    return decision_res


