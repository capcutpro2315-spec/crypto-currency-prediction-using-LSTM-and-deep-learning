"""
Evaluation Visualization Script for Trained Crypto LSTM Models.

Generates an Actual vs Predicted closing price plot for the test period and saves
the resulting chart as an image under backend/data/processed/{ticker}_actual_vs_predicted.png.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless execution
import matplotlib.pyplot as plt
import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import DEFAULT_CRYPTO, DATA_PROCESSED_DIR
from app.services.prediction_service import get_actual_vs_predicted_data, get_evaluation_metrics


def generate_evaluation_chart(identifier: str = DEFAULT_CRYPTO) -> Path:
    """
    Generate and save an Actual vs Predicted price evaluation chart.

    Args:
        identifier: Cryptocurrency symbol or ticker (e.g. 'BTC-USD', 'BTC')

    Returns:
        Path to the saved plot image (.png)
    """
    df = get_actual_vs_predicted_data(identifier)
    metrics_info = get_evaluation_metrics(identifier)

    ticker = metrics_info.get("ticker", identifier)
    crypto_name = metrics_info.get("cryptocurrency", ticker)

    # Detect column names (lowercase or capitalized)
    date_col = "date" if "date" in df.columns else "Date"
    actual_col = "actual_close" if "actual_close" in df.columns else "Actual Close"
    pred_col = "predicted_close" if "predicted_close" in df.columns else "Predicted Close"

    df[date_col] = pd.to_datetime(df[date_col])

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(df[date_col], df[actual_col], label="Actual Close", color="#1f77b4", linewidth=2)
    ax.plot(df[date_col], df[pred_col], label="Predicted Close", color="#ff7f0e", linestyle="--", linewidth=2)

    # Title & Labels
    ax.set_title(f"{crypto_name} ({ticker}) — LSTM Actual vs Predicted Closing Prices (Test Period)", fontsize=14, fontweight="bold", pad=15)
    ax.set_xlabel("Date", fontsize=12, labelpad=10)
    ax.set_ylabel("Price (USD)", fontsize=12, labelpad=10)
    ax.yaxis.set_major_formatter("${x:,.0f}")

    # Grid & Legend
    ax.grid(True, linestyle=":", alpha=0.6)
    ax.legend(loc="upper left", fontsize=11, frameon=True)

    # Metrics annotation box
    metrics = metrics_info.get("metrics", metrics_info)
    mae = metrics.get("mae", 0.0)
    rmse = metrics.get("rmse", 0.0)
    r2 = metrics.get("r2", 0.0)
    text_str = f"Test Metrics:\nMAE: ${mae:,.2f}\nRMSE: ${rmse:,.2f}\nR²: {r2:.4f}"
    props = dict(boxstyle="round,pad=0.5", facecolor="white", alpha=0.8, edgecolor="gray")
    ax.text(0.98, 0.05, text_str, transform=ax.transAxes, fontsize=10, verticalalignment="bottom", horizontalalignment="right", bbox=props)

    plt.tight_layout()

    DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    save_path = DATA_PROCESSED_DIR / f"{ticker}_actual_vs_predicted.png"
    plt.savefig(save_path, dpi=150)
    plt.close(fig)

    print(f"Saved evaluation chart to: {save_path}")
    return save_path


def main():
    parser = argparse.ArgumentParser(description="Generate evaluation chart for trained LSTM model.")
    parser.add_argument("--ticker", type=str, default=DEFAULT_CRYPTO, help="Crypto ticker symbol (e.g. BTC-USD)")
    args = parser.parse_args()

    try:
        generate_evaluation_chart(args.ticker)
    except Exception as e:
        print(f"Error generating evaluation chart: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
