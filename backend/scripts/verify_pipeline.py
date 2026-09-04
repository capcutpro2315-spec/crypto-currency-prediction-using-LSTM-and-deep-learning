"""
Stage 2 pipeline verification script.

Downloads real data, runs cleaning + preprocessing, and prints summary stats.
Run from backend/:  python scripts/verify_pipeline.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure backend/ is on sys.path when run as a script
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.services.data_service import fetch_and_prepare  # noqa: E402
from app.services.preprocessing import preprocess_crypto  # noqa: E402


def print_summary(identifier: str) -> None:
    print(f"\n{'=' * 60}")
    print(f"Processing: {identifier}")
    print("=" * 60)

    df, info = fetch_and_prepare(identifier, save=True)
    result = preprocess_crypto(identifier, refresh_data=False)

    print(f"Cryptocurrency : {info.name} ({info.symbol})")
    print(f"Ticker         : {info.ticker}")
    print(f"Date range     : {info.date_range_start} -> {info.date_range_end}")
    print(f"Records        : {info.num_records}")
    print(f"Training rows  : {result.train_size}")
    print(f"Testing rows   : {result.test_size}")
    print(f"Sequence length: {result.sequence_length}")
    print(f"X_train shape  : {result.X_train.shape}")
    print(f"y_train shape  : {result.y_train.shape}")
    print(f"X_test shape   : {result.X_test.shape}")
    print(f"y_test shape   : {result.y_test.shape}")
    print(f"Current price  : {result.current_price:.2f}")
    print(f"Saved CSV      : {info.file_path}")


def main() -> None:
    cryptos = ["BTC-USD", "ETH-USD"]
    for crypto in cryptos:
        print_summary(crypto)

    print(f"\n{'=' * 60}")
    print("Stage 2 pipeline verification complete.")
    print("=" * 60)


if __name__ == "__main__":
    main()
