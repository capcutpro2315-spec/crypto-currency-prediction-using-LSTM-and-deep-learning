"""
Unit tests for Stage 3 LSTM Deep Learning model architecture, saving/loading,
inverse transformation, and prediction service.
"""

from __future__ import annotations

from pathlib import Path
import numpy as np
import pytest
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf

from app.models.lstm_model import build_lstm_model, save_trained_model, load_trained_model
from app.services.prediction_service import predict_next_close
from app.exceptions import InsufficientDataError, InvalidCryptocurrencyError


def test_build_lstm_model_structure():
    """Test that build_lstm_model creates a compiled model with expected layers and output shape."""
    model = build_lstm_model(input_shape=(60, 1), lstm_units_1=64, lstm_units_2=32)

    assert model is not None
    assert model.name == "crypto_lstm_forecaster"
    assert model.compiled is True

    # Verify layer structure
    layer_names = [layer.name for layer in model.layers]
    assert "lstm_layer_1" in layer_names
    assert "dropout_1" in layer_names
    assert "lstm_layer_2" in layer_names
    assert "dropout_2" in layer_names
    assert "dense_layer" in layer_names
    assert "output_price" in layer_names


def test_lstm_model_input_output_shape():
    """Test that model accepts (batch_size, 60, 1) input and outputs (batch_size, 1)."""
    model = build_lstm_model(input_shape=(60, 1))

    batch_size = 4
    dummy_input = np.random.uniform(0, 1, size=(batch_size, 60, 1)).astype(np.float32)

    output = model(dummy_input)

    assert output.shape == (batch_size, 1)
    assert not np.isnan(output.numpy()).any()


def test_lstm_forward_prediction():
    """Test forward pass prediction on a single 60-day sequence."""
    model = build_lstm_model(input_shape=(60, 1))

    dummy_sequence = np.linspace(0.1, 0.9, 60).reshape(1, 60, 1).astype(np.float32)
    pred = model.predict(dummy_sequence, verbose=0)

    assert pred.shape == (1, 1)
    assert isinstance(float(pred[0, 0]), float)
    assert not np.isnan(pred[0, 0])


def test_save_and_load_trained_model(tmp_path: Path):
    """Test saving a trained Keras model and loading it back."""
    model = build_lstm_model(input_shape=(60, 1))
    dummy_sequence = np.ones((1, 60, 1), dtype=np.float32)
    initial_pred = float(model.predict(dummy_sequence, verbose=0)[0, 0])

    model_filepath = tmp_path / "test_lstm.keras"
    save_path = save_trained_model(model, model_filepath)

    assert save_path.exists()

    loaded_model = load_trained_model(save_path)
    assert loaded_model is not None

    loaded_pred = float(loaded_model.predict(dummy_sequence, verbose=0)[0, 0])
    assert pytest.approx(initial_pred, abs=1e-5) == loaded_pred


def test_inverse_transformation_to_original_price_scale():
    """Test scaling and inverse-transforming predictions back to original USD price scale."""
    prices = np.array([50000.0, 52000.0, 51000.0, 55000.0, 60000.0]).reshape(-1, 1)

    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_prices = scaler.fit_transform(prices)

    # Simulated scaled prediction from LSTM
    simulated_scaled_pred = 0.72

    # Inverse transform
    unscaled_pred = float(scaler.inverse_transform([[simulated_scaled_pred]])[0, 0])

    # Unscaled prediction must be within min and max price range of training data
    min_price, max_price = float(prices.min()), float(prices.max())
    assert min_price <= unscaled_pred <= max_price
    assert unscaled_pred != simulated_scaled_pred
    assert unscaled_pred > 1000.0  # Sanity check for USD price magnitude


from app.exceptions import InvalidCryptocurrencyError, UnsupportedTickerError


def test_prediction_service_error_handling():
    """Test prediction service raises clear exception if ticker is invalid or unsupported."""
    with pytest.raises((FileNotFoundError, InvalidCryptocurrencyError, UnsupportedTickerError)):
        predict_next_close(identifier="NONEXISTENT_TICKER_xyz")

