"""
LSTM Deep Learning Model Architecture for Cryptocurrency Price Forecasting.

Baseline Architecture:
  Input (sequence_length, num_features)
    ↓
  LSTM (64 units, return_sequences=True)
    ↓
  Dropout (0.2)
    ↓
  LSTM (32 units, return_sequences=False)
    ↓
  Dropout (0.2)
    ↓
  Dense (16 units, activation='relu')
    ↓
  Output (1 unit, activation='linear')

Why Mean Squared Error (MSE) as Loss:
------------------------------------
1. Smooth & Differentiable: MSE is a continuous, strictly convex loss function with smooth 
   gradients, which accelerates convergence using gradient-descent optimization (Adam).
2. Penalizes Large Errors: Squaring error terms (y_true - y_pred)^2 penalizes large prediction 
   outliers more heavily than small ones. In financial price forecasting, large mispredictions 
   carry higher economic risk, making MSE an ideal baseline loss function.
3. Natural Regression Objective: Unbounded continuous target values (scaled 0..1) map directly 
   to a standard L2 distance optimization objective.
"""

from __future__ import annotations

from pathlib import Path
from typing import Tuple

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, optimizers

from app.config import DEFAULT_SEQUENCE_LENGTH, MODELS_SAVED_DIR


def build_lstm_model(
    input_shape: Tuple[int, int] = (DEFAULT_SEQUENCE_LENGTH, 1),
    lstm_units_1: int = 64,
    lstm_units_2: int = 32,
    dropout_rate: float = 0.2,
    dense_units: int = 16,
    dense_activation: str = "relu",
    learning_rate: float = 0.001,
) -> keras.Model:
    """
    Build and compile a reusable LSTM model for cryptocurrency price regression.

    Args:
        input_shape: (sequence_length, num_features), e.g., (60, 1)
        lstm_units_1: Number of hidden units in the first LSTM layer
        lstm_units_2: Number of hidden units in the second LSTM layer
        dropout_rate: Fraction of units to drop for regularization (0.0 to 1.0)
        dense_units: Number of units in the fully-connected dense layer
        dense_activation: Activation function for the dense layer ('relu', etc.)
        learning_rate: Learning rate for the Adam optimizer

    Returns:
        Compiled Keras Model instance ready for training or evaluation.
    """
    if len(input_shape) != 2:
        raise ValueError(f"input_shape must be a 2-tuple (sequence_length, num_features), got {input_shape}")
    if input_shape[0] <= 0 or input_shape[1] <= 0:
        raise ValueError(f"input_shape dimensions must be positive integers, got {input_shape}")

    model = models.Sequential(
        [
            # Input layer enforcing expected sequence dimensions
            layers.Input(shape=input_shape, name="input_sequence"),
            # First LSTM layer: extracts sequential temporal features across all time steps
            layers.LSTM(
                units=lstm_units_1,
                return_sequences=True,
                name="lstm_layer_1",
            ),
            # Dropout 1: prevents co-adaptation of hidden units and reduces overfitting
            layers.Dropout(rate=dropout_rate, name="dropout_1"),
            # Second LSTM layer: aggregates temporal features into a single summary vector
            layers.LSTM(
                units=lstm_units_2,
                return_sequences=False,
                name="lstm_layer_2",
            ),
            # Dropout 2: additional regularization before final regression layers
            layers.Dropout(rate=dropout_rate, name="dropout_2"),
            # Dense hidden layer: non-linear feature representation
            layers.Dense(
                units=dense_units,
                activation=dense_activation,
                name="dense_layer",
            ),
            # Output layer: 1 continuous numerical prediction (linear activation for regression)
            layers.Dense(
                units=1,
                activation="linear",
                name="output_price",
            ),
        ],
        name="crypto_lstm_forecaster",
    )

    # Model Compilation:
    # Optimizer: Adam (adaptive moment estimation with default/configurable lr)
    # Loss: Mean Squared Error (MSE) - smooth L2 loss suitable for regression tasks
    # Metrics: Mean Absolute Error (MAE) - interpretable secondary error tracking
    optimizer = optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss="mean_squared_error",
        metrics=["mae"],
    )

    return model


def save_trained_model(model: keras.Model, filepath: Path | str) -> Path:
    """Save a compiled/trained Keras model to disk (.keras format)."""
    save_path = Path(filepath)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    model.save(save_path)
    return save_path


def load_trained_model(filepath: Path | str) -> keras.Model:
    """Load a saved Keras model from disk."""
    load_path = Path(filepath)
    if not load_path.exists():
        raise FileNotFoundError(f"Trained LSTM model artifact not found at: {load_path}")
    return models.load_model(load_path)
