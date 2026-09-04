"""
Offline LSTM Training Pipeline for Cryptocurrency Price Forecasting.

Runs independently of FastAPI API routes. Reuses Stage 2 preprocessing pipeline,
builds & compiles the LSTM architecture, trains with EarlyStopping and ModelCheckpoint,
evaluates regression metrics on test data, and saves model artifacts (.keras),
metadata (.json), and actual-vs-predicted price datasets (.csv).
"""

from __future__ import annotations

import argparse
import sys
import json
from pathlib import Path
from typing import Any, Dict

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Ensure backend root is on sys.path when running script directly
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import (
    DEFAULT_CRYPTO,
    DEFAULT_SEQUENCE_LENGTH,
    DEFAULT_TRAIN_TEST_SPLIT,
    MIN_TRAINING_SAMPLES,
    DATA_PROCESSED_DIR,
    MODELS_SAVED_DIR,
)
from app.exceptions import InsufficientDataError, InvalidCryptocurrencyError
from app.models.lstm_model import build_lstm_model, save_trained_model
from app.services.preprocessing import PreprocessedData, preprocess_crypto


def train_crypto_lstm(
    identifier: str = DEFAULT_CRYPTO,
    epochs: int = 50,
    batch_size: int = 32,
    sequence_length: int | None = None,
    train_ratio: float = DEFAULT_TRAIN_TEST_SPLIT,
    patience: int = 10,
    refresh_data: bool = False,
    verbose: int = 1,
) -> Dict[str, Any]:
    """
    Train an adaptive LSTM model for a specific cryptocurrency.
    """
    print(f"\n==================================================")
    print(f"       LSTM MODEL TRAINING — {identifier.upper()}")
    print(f"==================================================")

    # Step 1: Preprocess historical data using adaptive lookback pipeline
    print(f"[1/6] Running preprocessing pipeline for '{identifier}'...")
    data: PreprocessedData = preprocess_crypto(
        identifier=identifier,
        sequence_length=sequence_length,
        train_ratio=train_ratio,
        refresh_data=refresh_data,
    )

    ticker = data.asset.ticker
    crypto_name = data.asset.name
    X_train, y_train = data.X_train, data.y_train
    X_test, y_test = data.X_test, data.y_test
    scaler = data.scaler
    lookback_days = data.lookback_days

    if len(X_train) < MIN_TRAINING_SAMPLES:
        raise InsufficientDataError(
            f"Historical data is available ({data.available_history_days} days), "
            f"but there are not enough training sequences ({len(X_train)}) for a reliable LSTM forecast (minimum {MIN_TRAINING_SAMPLES} required)."
        )

    print(f"      - Cryptocurrency:  {crypto_name} ({ticker})")
    print(f"      - Available History: {data.available_history_days} days")
    print(f"      - Lookback Window:  {lookback_days} days")
    print(f"      - Training rows:     {data.train_size} (Sequences: {len(X_train)})")
    print(f"      - Testing rows:      {data.test_size} (Sequences: {len(X_test)})")
    print(f"      - Input shape:       {X_train.shape}")
    print(f"      - Train Date Range: {data.train_dates[0].strftime('%Y-%m-%d')} -> {data.train_dates[-1].strftime('%Y-%m-%d')}")
    print(f"      - Test Date Range:  {data.test_dates[0].strftime('%Y-%m-%d')} -> {data.test_dates[-1].strftime('%Y-%m-%d')}")

    # Step 2: Build baseline LSTM model
    print(f"\n[2/6] Building LSTM architecture...")
    input_shape = (X_train.shape[1], X_train.shape[2])
    model = build_lstm_model(input_shape=input_shape)

    if verbose > 0:
        model.summary()

    # Step 3: Setup Callbacks (EarlyStopping & ModelCheckpoint)
    MODELS_SAVED_DIR.mkdir(parents=True, exist_ok=True)
    DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    model_filename = f"{ticker}_lstm_{lookback_days}d.keras"
    model_path = MODELS_SAVED_DIR / model_filename
    legacy_model_path = MODELS_SAVED_DIR / f"{ticker}_lstm.keras"

    metadata_filename = f"{ticker}_lstm_{lookback_days}d_metadata.json"
    metadata_path = MODELS_SAVED_DIR / metadata_filename
    legacy_metadata_path = MODELS_SAVED_DIR / f"{ticker}_lstm_metadata.json"

    actual_vs_pred_filename = f"{ticker}_actual_vs_predicted.csv"
    actual_vs_pred_path = DATA_PROCESSED_DIR / actual_vs_pred_filename


    callbacks = [
        EarlyStopping(
            monitor="val_loss",
            patience=patience,
            restore_best_weights=True,
            verbose=verbose,
        ),
        ModelCheckpoint(
            filepath=str(model_path),
            monitor="val_loss",
            save_best_only=True,
            verbose=0,
        ),
    ]

    # Step 4: Train Model (Chronological sequence - shuffle=False)
    print(f"\n[3/6] Training LSTM model (Max Epochs: {epochs}, Batch Size: {batch_size}, Patience: {patience})...")
    # Note: validation_data uses chronological X_test/y_test to evaluate on later time steps without future data leakage
    history = model.fit(
        X_train,
        y_train,
        validation_data=(X_test, y_test),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        shuffle=False,  # CRITICAL for time-series sequence training
        verbose=verbose,
    )

    epochs_completed = len(history.history["loss"])
    final_train_loss = float(history.history["loss"][-1])
    final_val_loss = float(history.history["val_loss"][-1])

    print(f"\n[4/6] Training completed in {epochs_completed} epochs.")
    print(f"      - Final Training Loss (MSE):   {final_train_loss:.6f}")
    print(f"      - Final Validation Loss (MSE): {final_val_loss:.6f}")

    # Ensure best checkpoint model is saved & loaded
    save_trained_model(model, model_path)
    save_trained_model(model, legacy_model_path)
    print(f"      - Saved model weights to: {model_path}")

    # Step 5: Model Evaluation on Test Set (Scaled -> Original USD Price Scale)
    print(f"\n[5/6] Evaluating predictions against test set...")
    y_pred_scaled = model.predict(X_test, verbose=0).flatten()

    y_test_orig = scaler.inverse_transform(y_test.reshape(-1, 1)).flatten()
    y_pred_orig = scaler.inverse_transform(y_pred_scaled.reshape(-1, 1)).flatten()

    mae = float(mean_absolute_error(y_test_orig, y_pred_orig))
    mse = float(mean_squared_error(y_test_orig, y_pred_orig))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test_orig, y_pred_orig))

    print(f"      - Test MAE:  ${mae:,.2f}")
    print(f"      - Test MSE:  ${mse:,.2f}")
    print(f"      - Test RMSE: ${rmse:,.2f}")
    print(f"      - Test R²:   {r2:.4f}")

    # Step 6: Save Actual vs Predicted CSV and Model Metadata JSON
    print(f"\n[6/6] Generating evaluation artifacts and metadata...")

    predictions_df = pd.DataFrame(
        {
            "date": data.test_dates.strftime("%Y-%m-%d"),
            "actual_close": y_test_orig,
            "predicted_close": y_pred_orig,
        }
    )

    pred_csv_path = DATA_PROCESSED_DIR / f"{ticker}_predictions.csv"
    predictions_df.to_csv(pred_csv_path, index=False)
    predictions_df.to_csv(actual_vs_pred_path, index=False)
    print(f"      - Saved Predictions CSV:        {pred_csv_path}")

    metrics_json = {
        "cryptocurrency": data.asset.name,
        "ticker": ticker,
        "mae": mae,
        "mse": mse,
        "rmse": rmse,
        "r2": r2,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "available_history_days": data.available_history_days,
        "lookback_days": lookback_days,
        "test_start_date": data.test_dates[0].strftime("%Y-%m-%d"),
        "test_end_date": data.test_dates[-1].strftime("%Y-%m-%d"),
    }
    metrics_json_path = DATA_PROCESSED_DIR / f"{ticker}_metrics.json"
    with open(metrics_json_path, "w", encoding="utf-8") as f:
        json.dump(metrics_json, f, indent=2)
    print(f"      - Saved Metrics JSON:           {metrics_json_path}")

    # Comprehensive Adaptive Metadata JSON
    metadata = {
        "crypto_id": getattr(data.asset, "id", None) or getattr(data.asset, "provider_id", None) or ticker,
        "symbol": data.asset.symbol,
        "market_ticker": ticker,
        "cryptocurrency": data.asset.name,
        "ticker": ticker,
        "quote_currency": data.asset.quote_currency,
        "available_history_days": data.available_history_days,
        "lookback_days": lookback_days,
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "training_date": data.train_dates[-1].strftime("%Y-%m-%d"),
        "data_start": data.train_dates[0].strftime("%Y-%m-%d"),
        "data_end": data.test_dates[-1].strftime("%Y-%m-%d"),
        "feature_names": data.feature_names,
        "target_name": data.target_name,
        "sequence_length": lookback_days,
        "training_date_range": {
            "start": data.train_dates[0].strftime("%Y-%m-%d"),
            "end": data.train_dates[-1].strftime("%Y-%m-%d"),
        },
        "test_date_range": {
            "start": data.test_dates[0].strftime("%Y-%m-%d"),
            "end": data.test_dates[-1].strftime("%Y-%m-%d"),
        },
        "model_architecture": {
            "type": "LSTM",
            "layers": [
                {"name": "LSTM_1", "units": 64, "return_sequences": True},
                {"name": "Dropout_1", "rate": 0.2},
                {"name": "LSTM_2", "units": 32, "return_sequences": False},
                {"name": "Dropout_2", "rate": 0.2},
                {"name": "Dense_1", "units": 16, "activation": "relu"},
                {"name": "Output", "units": 1, "activation": "linear"},
            ],
            "optimizer": "Adam",
            "loss_function": "MeanSquaredError",
        },
        "training_config": {
            "epochs_requested": epochs,
            "epochs_completed": epochs_completed,
            "batch_size": batch_size,
            "patience": patience,
            "train_ratio": train_ratio,
        },
        "loss_summary": {
            "final_train_loss_scaled_mse": final_train_loss,
            "final_val_loss_scaled_mse": final_val_loss,
        },
        "test_metrics_original_scale": {
            "mae": mae,
            "mse": mse,
            "rmse": rmse,
            "r2": r2,
        },
        "latest_historical_close": float(data.current_price),
        "saved_model_file": model_filename,
        "saved_metadata_file": metadata_filename,
        "saved_actual_vs_pred_file": actual_vs_pred_filename,
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    with open(legacy_metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"      - Saved Model Metadata JSON:    {metadata_path}")


    print(f"\n==================================================")
    print(f"       TRAINING SUCCESSFULLY COMPLETED FOR {ticker}")
    print(f"==================================================\n")

    return {
        "ticker": ticker,
        "model_path": str(model_path),
        "metadata_path": str(metadata_path),
        "actual_vs_pred_path": str(actual_vs_pred_path),
        "epochs_completed": epochs_completed,
        "final_train_loss": final_train_loss,
        "final_val_loss": final_val_loss,
        "metrics": {
            "mae": mae,
            "mse": mse,
            "rmse": rmse,
            "r2": r2,
        },
        "input_shape": input_shape,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "latest_price": float(data.current_price),
    }


def main():
    parser = argparse.ArgumentParser(description="Train LSTM Deep Learning model for crypto price forecasting.")
    parser.add_argument("--ticker", type=str, default=DEFAULT_CRYPTO, help="Crypto symbol or name (e.g. BTC-USD, ETH-USD)")
    parser.add_argument("--epochs", type=int, default=50, help="Maximum epochs (default: 50)")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size (default: 32)")
    parser.add_argument("--patience", type=int, default=10, help="Early stopping patience (default: 10)")
    parser.add_argument("--refresh", action="store_true", help="Force re-fetch historical data from yfinance")

    args = parser.parse_args()

    try:
        train_crypto_lstm(
            identifier=args.ticker,
            epochs=args.epochs,
            batch_size=args.batch_size,
            patience=args.patience,
            refresh_data=args.refresh,
        )
    except Exception as e:
        print(f"\n[ERROR] Model training failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
