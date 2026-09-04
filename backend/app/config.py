"""
Application configuration for the cryptocurrency data pipeline.

Centralizes paths, historical data settings, preprocessing defaults,
and the location of the cryptocurrency registry file.
"""

from pathlib import Path

# ---------------------------------------------------------------------------
# Paths (relative to backend/)
# ---------------------------------------------------------------------------
BACKEND_ROOT = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BACKEND_ROOT / "data" / "raw"
DATA_PROCESSED_DIR = BACKEND_ROOT / "data" / "processed"
MODELS_SAVED_DIR = BACKEND_ROOT / "models" / "saved"
CRYPTO_REGISTRY_PATH = BACKEND_ROOT / "data" / "crypto_registry.json"

# Ensure runtime persistence directories exist for ephemeral cloud environments
DATA_RAW_DIR.mkdir(parents=True, exist_ok=True)
DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
MODELS_SAVED_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Market data defaults
# ---------------------------------------------------------------------------
DEFAULT_HISTORICAL_PERIOD = "3y"  # ~3 years of daily data via yfinance
DEFAULT_INTERVAL = "1d"
DEFAULT_QUOTE_CURRENCY = "USD"

# ---------------------------------------------------------------------------
# Preprocessing defaults (Stage 2 baseline: Close -> Close)
# ---------------------------------------------------------------------------
DEFAULT_FEATURE_COLUMNS = ["Close"]
DEFAULT_TARGET_COLUMN = "Close"
DEFAULT_SEQUENCE_LENGTH = 60
DEFAULT_TRAIN_TEST_SPLIT = 0.8  # 80% train (earlier), 20% test (later)

# ---------------------------------------------------------------------------
# Adaptive LSTM Lookback Window Settings
# ---------------------------------------------------------------------------
MIN_LSTM_HISTORY_DAYS = 30
DEFAULT_LSTM_LOOKBACK = 60
MIN_TRAINING_SAMPLES = 10

# Minimum rows required after cleaning to produce train/test LSTM sequences.
# Derived from: both splits need at least (sequence_length + 1) rows each.
MIN_ROWS_FOR_LSTM = int(
    (DEFAULT_SEQUENCE_LENGTH + 1) / (1 - DEFAULT_TRAIN_TEST_SPLIT)
) + DEFAULT_SEQUENCE_LENGTH + 1


# ---------------------------------------------------------------------------
# Required OHLCV schema
# ---------------------------------------------------------------------------
REQUIRED_OHLCV_COLUMNS = ["Date", "Open", "High", "Low", "Close", "Volume"]
OHLC_COLUMNS = ["Open", "High", "Low", "Close"]
MARKET_COLUMNS = OHLC_COLUMNS + ["Volume"]

# Default cryptocurrency for development and notebooks
DEFAULT_CRYPTO = "BTC"
