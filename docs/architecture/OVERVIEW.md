# Architecture Overview

## High-Level System Flow

```
             CRYPTO CATALOG (CoinGecko / Registry)
                               ↓
                       USER SELECTS COIN
                               ↓
          ┌────────────────────┴────────────────────┐
          ↓                                         ↓
    LIVE MARKET DATA                         HISTORICAL DATA
 (CoinGecko → Binance → Yahoo)               (Local Cache / yfinance)
     Refreshed every ~60s                           ↓
          ↓                                    PREPROCESSING
          ↓                                   (MinMax Scaler)
          ↓                                         ↓
          ↓                                    LSTM MODEL
          ↓                            (Background Thread if missing)
          ↓                                         ↓
          └────────────────────┬────────────────────┘
                               ↓
                          PREDICTION
                               ↓
                      AI DECISION SUPPORT
                               ↓
                     CONSIDER / WAIT / AVOID
```

## Live Market Data & Provider Abstraction Layer

```
API Route (GET /api/market/{ticker}/live)
                  ↓
       Market Data Service
                  ↓
       Provider Resolver (Priority Fallback)
                  ↓
  1. CoinGecko API (Catalog, live price, 24h change, volume)
  2. Binance Public API (1-min OHLCV / ticker for supported pairs)
  3. Yahoo Finance API (Daily OHLCV fallback)
                  ↓
       Normalized Market Data Object
```

### Key Architectural Rules for Live Market Data
1. **60-Second Refresh Frequency**: The selected cryptocurrency's live market data updates approximately every 60 seconds (`REFRESH_INTERVAL_MS = 60000`).
2. **Separation of Live Data & Model Training**: Live price refreshes do NOT trigger model retraining or download full historical datasets.
3. **No Direct Browser Calls to External APIs**: The Next.js frontend calls the FastAPI backend (`GET /api/market/{ticker}/live`), which delegates to `MarketDataService`.
4. **Honest Data Freshness**: Interface displays explicit timestamp and freshness indicators ("Live market data • Updated ~1 min ago").

## Dynamic LSTM Model Training & Lifecycle Management

```
User selects coin (e.g. DOGE-USD)
            ↓
  Check Historical Data
            ↓
      Sufficient Data?
       /            \
     NO              YES
     ↓                ↓
Show message     Model Exists?
                    /      \
                  YES       NO
                   ↓         ↓
               Load Model   Background Thread LSTM Training
                   \         /
                    ↓       ↓
                    LSTM Model
                        ↓
                 Price Prediction
```

### Model Lifecycle Principles
1. **Non-Blocking Background Execution**: Model training is executed in background threads (`threading.Thread`) without blocking FastAPI API requests.
2. **Single-Instance Training Lock**: Concurrent training requests for the same ticker are locked to prevent duplicate execution.
3. **Model Freshness Threshold**: Saved models are valid for 24 hours (`MODEL_RETRAIN_INTERVAL_HOURS = 24.0`). If a model is younger than 24 hours, existing weights are loaded directly.
4. **Transparent Status Tracking**: Backend exposes `GET /api/predictions/{ticker}/status` with states: `not_started`, `training`, `ready`, `insufficient_data`, `failed`.
5. **No Fake Data or Predictions**: If historical data is insufficient (< 60 sequence observations), the system honestly displays `insufficient_data` without producing fake models.


```
Cryptocurrency Selection
        ↓
Ticker Resolution (crypto_registry.json)
        ↓
Historical OHLCV Data (yfinance / Yahoo Finance)
        ↓
Validation
        ↓
Cleaning
        ↓
Chronological Train/Test Split (80% / 20%)
        ↓
Training-Only MinMaxScaler Fitting
        ↓
60-Day Sequence Creation
        ↓
Future LSTM Model (Stage 3)
```

### Cryptocurrency Resolution

User input (symbol, name, or Yahoo ticker) is resolved via `CryptoRegistry`:

1. Look up in `backend/data/crypto_registry.json` by symbol or ticker.
2. If not registered, attempt standard pattern `{SYMBOL}-USD`.
3. Download historical data via `yfinance`.
4. If no data is returned, raise `UnsupportedTickerError` (no fake data).

New cryptocurrencies can be added to the JSON registry without changing preprocessing code.

### Data Pipeline Design Decisions

#### Why time-series data is NOT randomly shuffled

Random shuffling would place future prices into the training set, causing **data leakage**. The model would appear accurate but fail on real forward predictions. We use a **chronological split**: earlier 80% for training, later 20% for testing.

#### Why scaling is necessary

LSTM networks train more effectively when input values are normalized to a bounded range. We use `sklearn.preprocessing.MinMaxScaler` to scale Close prices to [0, 1].

#### Why the scaler is fit ONLY on training data

Fitting the scaler on the full dataset (including test data) leaks future price distribution into training preprocessing. Correct order:

1. Chronological split
2. Fit scaler on training Close prices
3. Transform training data
4. Transform test data using the **training-fitted** scaler

The fitted scaler is returned with preprocessing output for inverse transformation during future prediction.

#### Why a 60-day lookback window

A 60-day sequence captures ~3 months of daily price context, a common baseline for daily crypto LSTM models. The value is configurable via `DEFAULT_SEQUENCE_LENGTH` in `config.py`.

#### Insufficient historical data

Some cryptocurrencies lack enough Yahoo Finance history. The pipeline requires enough rows for:

- An 80/20 chronological split
- At least one 60-day sequence in both train and test sets

If insufficient, `InsufficientDataError` is raised with a clear message. No fake records are generated.

## Stage 3 — Deep Learning Model (Implemented)

```
Historical Prices (OHLCV)
         ↓
Preprocessing Pipeline (80/20 Chronological Split, MinMax Scaler)
         ↓
60-Day Lookback Sequences [samples, 60, 1]
         ↓
First LSTM Layer (64 Units, return_sequences=True)
         ↓
First Dropout Regularization (rate=0.2)
         ↓
Second LSTM Layer (32 Units, return_sequences=False)
         ↓
Second Dropout Regularization (rate=0.2)
         ↓
Fully-Connected Dense Layer (16 Units, ReLU activation)
         ↓
Dense Output Layer (1 Unit, Linear activation)
         ↓
Inverse MinMax Scaling
         ↓
Next Closing-Price Prediction ($ USD)
```

### Deep Learning Architectural Rationale

#### 1. Why Long Short-Term Memory (LSTM) Networks?
Standard Feedforward Neural Networks (FNNs) assume input features are independent and identically distributed (i.i.d.). Cryptocurrency closing prices, however, depend heavily on past prices. Standard Recurrent Neural Networks (RNNs) suffer from vanishing and exploding gradients when processing long sequences. LSTMs solve this by incorporating memory cells with **Input**, **Forget**, and **Output** gates that selective maintain gradient flow across long sequence lengths.

#### 2. Why Cryptocurrency Data is Time-Series Data
Cryptocurrency prices represent temporal sequential data where observation $t$ is non-linearly correlated with observations $t-1, t-2, \dots, t-k$. Treating crypto data as unstructured regression would fail to capture trend, momentum, and cyclical volatility patterns. Furthermore, time-series ordering dictates that dataset splits must strictly preserve chronology—random shuffling would introduce **future data leakage**.

#### 3. Why a 60-Day Lookback Window
A 60-day sequence represents approximately two months of continuous daily trading data (~60 observations). This window length provides sufficient sequential context to detect short-to-medium term price movements without creating excessively large state representation bottlenecks.

#### 4. Why Mean Squared Error (MSE) Loss
MSE ($\frac{1}{n} \sum (y_i - \hat{y}_i)^2$) is chosen as the optimization loss function because:
- **Differentiability**: Smooth L2 loss curve allows steady parameter convergence using the Adam optimizer.
- **Outlier Penalty**: Squaring errors heavily penalizes large deviation outliers, which carry significant economic risk in financial forecasting.

#### 5. Why Dropout Regularization (0.2)
Cryptocurrency markets exhibit high noise-to-signal ratios. To prevent the LSTM network from memorizing random market noise (overfitting), Dropout randomly zeroes 20% of hidden layer units during each training forward pass, encouraging redundant distributed feature representations.

#### 6. Why Early Stopping
To prevent overtraining, Early Stopping monitors validation loss on unseen chronological test sequence data. If validation loss fails to decrease for 10 consecutive epochs (`patience=10`), training halts automatically and weights from the best-performing epoch are restored (`restore_best_weights=True`).

#### 7. Why Train Separate Models Per Cryptocurrency
Bitcoin (BTC), Ethereum (ETH), and Solana (SOL) operate at vast differences in market capitalization, price magnitudes (e.g., $100,000+ vs $2,000 vs $150), volatility variances, and liquidity regimes. Training asset-specific LSTM models ensures the scaling parameters and learned recurrent weights accurately reflect each cryptocurrency's distinct market dynamics.

## Stage 4 — Model Evaluation, Prediction Service & Forecast Output (Implemented)

```
TRAINED LSTM MODEL (backend/models/saved/{ticker}_lstm.keras)
         ↓
MODEL LOADING & CACHING (prediction_service.py)
         ↓
LATEST 60-DAY HISTORICAL SEQUENCE [1, 60, 1]
         ↓
SCALED INPUT PREPARATION (Reusing Training Scaler)
         ↓
LSTM MODEL FORWARD PASS INFERENCE
         ↓
INVERSE MINMAX TRANSFORMATION (scaler.inverse_transform)
         ↓
UNSCALED PREDICTED CLOSING PRICE ($ USD)
         ↓
EXPECTED % CHANGE CALCULATION (((pred - current) / current) * 100)
```

### Stage 4 Architecture & Design Decisions

#### 1. Difference Between Training and Inference
- **Training**: An offline process executed separately in `backend/training/train_lstm.py`. Fits the `MinMaxScaler` on the initial 80% chronological training data, builds the Keras LSTM, trains across multiple epochs using `EarlyStopping` and `ModelCheckpoint`, and saves model weights (`.keras`), metadata (`.json`), and evaluation metrics (`.json`, `.csv`).
- **Inference**: An online read-only operation executed via `backend/app/services/prediction_service.py`. Loads pre-trained weights from disk into memory, extracts the latest 60-day window, applies the existing scaler, generates a forward-pass prediction, and returns structured forecast schema objects without modifying model weights or re-fitting scalers.

#### 2. Why the Training Scaler Must Be Reused
Fitting a new scaler on the latest inference sequence or test set would corrupt the mathematical normalization bounds learned by the model during training. The inference service must use the exact `MinMaxScaler` instance fitted on the training split so that scaled values $x' \in [0, 1]$ map to identical network activations.

#### 3. Why the Model Predicts the Next Daily Time Step
The baseline model is trained single-step ($y_t = f(x_{t-60:t-1})$). Therefore, the sequence $t-59 \dots t$ predicts observation $t+1$ (the next daily close date `forecast_date`). It does not predict multi-step intervals beyond $t+1$ without iterative autoregressive feedback.

#### 4. Model Evaluation on Test Data
Model evaluation metrics (MAE, MSE, RMSE, R²) are calculated strictly on the held-out 20% test dataset (later historical observations). The test predictions are inverse-transformed back to USD scale before metrics calculation to provide economically interpretable dollar-error values:
- **MAE** (Mean Absolute Error): Average magnitude of price error in USD.
- **MSE** (Mean Squared Error): L2 error penalizing larger deviations.
- **RMSE** (Root Mean Squared Error): Standard deviation of prediction residuals in USD.
- **R²** (Coefficient of Determination): Proportion of target variance explained by the LSTM.

#### 5. Strict Data Leakage Prevention Verification
- **Scaler Fitting**: Scaler is fitted exclusively on training set rows ($t < \text{split\_index}$).
- **Time-Series Sequence**: Data is partitioned chronologically without random shuffling (`shuffle=False`).
- **Inference Input**: The prediction input sequence uses only historical observations up to time $t$.
- **Validation**: Validation data during training consists of later chronological observations, ensuring no future observations contaminate model weights.

## Stage 5 — FastAPI Backend and AI Prediction API (Implemented)

```
USER / FRONTEND
       ↓
FASTAPI REST API (app/main.py & app/routes/)
       ↓
SERVICE LAYER (prediction_service.py, data_service.py, crypto_registry.py)
       ↓
DATA / LSTM MODEL (models/saved/{ticker}_lstm.keras)
       ↓
PREDICTED PRICE & METRICS
       ↓
PYDANTIC SCHEMAS (app/schemas/)
       ↓
JSON RESPONSE
```

### FastAPI Endpoint Reference

#### 1. `GET /api/health`
- **Purpose**: System health check endpoint for monitoring service availability.
- **Response**: `{"status": "ok", "version": "1.0.0", "environment": "development"}`

#### 2. `GET /api/cryptocurrencies`
- **Purpose**: Returns the list of registered cryptocurrencies, ticker symbols, and model availability flags (`has_trained_model`).
- **Response**: List of `CryptoAssetSchema` objects wrapped in `SupportedCryptosResponse`.

#### 3. `GET /api/cryptocurrencies/{ticker}/history`
- **Purpose**: Retrieves historical daily OHLCV price observations for the specified ticker.
- **Parameters**: `limit` (optional integer, default `365`).
- **Response**: `HistoricalDataResponse` containing array of `HistoricalRecordSchema` objects.

#### 4. `GET /api/market/{ticker}/summary`
- **Purpose**: Calculates current market statistics including current price, latest volume, observation date, and historical high/low values.
- **Response**: `MarketSummaryResponse`.

#### 5. `POST /api/predictions`
- **Purpose**: Generates next daily closing-price forecast by feeding the latest 60-day historical sequence into the trained LSTM model.
- **Payload**: `{"ticker": "BTC-USD"}`
- **Response**: `CryptoPredictionResponse` with `current_price`, `predicted_price`, `expected_change_percent`, `last_data_date`, `forecast_date`, and formatted USD strings.

#### 6. `GET /api/predictions/{ticker}/metrics`
- **Purpose**: Retrieves saved test-set regression evaluation metrics (MAE, MSE, RMSE, R²).
- **Response**: `ModelEvaluationMetrics`.

#### 7. `GET /api/predictions/{ticker}/history`
- **Purpose**: Returns held-out test period dataset containing `date`, `actual_close`, and `predicted_close` for frontend visualization.
- **Response**: Array of prediction objects.

## Stage 6 — Next.js Website Interface and Backend Integration (Implemented)

```
USER
 ↓
NEXT.JS FRONTEND (app/ & components/)
 ↓  HTTP REST API (lib/api.ts)
FASTAPI BACKEND (app/main.py & app/routes/)
 ↓
SERVICE LAYER (prediction_service.py, data_service.py)
 ↓
LSTM / DATA (models/saved/{ticker}_lstm.keras)
 ↓
JSON RESPONSE
 ↓
NEXT.JS RECHARTS & UI DASHBOARD
 ↓
USER
```

### Frontend Module Overview

1. **API Client (`frontend/lib/api.ts`)**:
   - Manages asynchronous fetch calls to `NEXT_PUBLIC_API_URL`.
   - Handles network errors and backend unavailability with human-readable feedback.
2. **Dashboard Workspace (`frontend/app/dashboard/page.tsx`)**:
   - Integrates searchable cryptocurrency selector, market summary metrics, and Recharts historical area chart.
3. **AI Prediction Workspace (`frontend/app/prediction/page.tsx`)**:
   - Triggers `POST /api/predictions` to render forecast cards, regression metrics ($R^2$, RMSE, MAE, MSE), and actual vs predicted line charts.
4. **Market Analysis Workspace (`frontend/app/market-analysis/page.tsx`)**:
   - Dedicated historical analytics view for OHLCV data and high/low stats.
5. **About & Methodology Workspace (`frontend/app/about/page.tsx`)**:
   - Explains end-to-end pipeline, why LSTM networks excel at sequential time-series data, and evaluation metric definitions.

## Stage 7 — AI Risk, Confidence & Investment Decision-Support (Implemented)

```
LSTM PREDICTION
      +
HISTORICAL VOLATILITY (30-day returns std dev)
      +
MODEL PERFORMANCE (R², RMSE, MAE)
      ↓
MODEL CONFIDENCE SCORE (0-100)
      +
RISK RATING SCORE (LOW, MEDIUM, HIGH)
      +
EXPECTED PRICE MOVEMENT (%)
      ↓
DECISION SCORE ENGINE (0-100)
      ↓
STRONG SIGNAL PROTECTION RULE
      ↓
SIGNAL CLASSIFICATION (CONSIDER / WAIT / AVOID)
      ↓
DYNAMIC RATIONALE (Supporting & Risk Factors)
      ↓
NEXT.JS UI & ACADEMIC DISCLAIMER
```

### AI Decision Engine Methodology

1. **Expected Price Movement**:
   - Calculated as $\frac{\text{predicted\_price} - \text{current\_price}}{\text{current\_price}} \times 100$.
2. **Historical Volatility**:
   - Standard deviation of 30-day daily returns $r_t = \frac{C_t - C_{t-1}}{C_{t-1}}$. Categorized into `LOW` ($< 2.0\%$), `MEDIUM` ($2.0 - 4.5\%$), and `HIGH` ($> 4.5\%$).
3. **Model Confidence Score (0–100)**:
   - Evaluates test-set $R^2$ variance explanation minus relative RMSE error penalty. Represents historical model reliability under test conditions (NOT a statistical probability of profit).
4. **Risk Rating (LOW, MEDIUM, HIGH)**:
   - Combines historical volatility category, model confidence rating, and price swing magnitude.
5. **Decision Score & Signal Mapping**:
   - `80 – 100`: `CONSIDER`
   - `60 – 79`: `WAIT` (Cautious Outlook)
   - `40 – 59`: `WAIT`
   - `0 – 39`: `AVOID`
6. **Strong Signal Protection Rule**:
   - If expected change is positive BUT model confidence $< 60$ or risk level is `HIGH`, signal is overridden to `WAIT` to prevent naive forecasts from triggering false buy signals.
7. **Educational Disclaimer**:
   - Academic decision-support tool. Does not guarantee profits or constitute financial advice.

## Module Boundaries

| Module | Location | Status |
|--------|----------|--------|
| Crypto Registry | `backend/app/services/crypto_registry.py` | Implemented |
| Data Service | `backend/app/services/data_service.py` | Implemented |
| Preprocessing | `backend/app/services/preprocessing.py` | Implemented |
| Deep Learning Model | `backend/app/models/lstm_model.py` | Implemented |
| Offline Training | `backend/training/train_lstm.py` | Implemented |
| Prediction Service | `backend/app/services/prediction_service.py` | Implemented |
| Decision Service | `backend/app/services/decision_service.py` | Implemented |
| Evaluation Plot Script | `backend/scripts/evaluate_model.py` | Implemented |
| Prediction & Decision Schemas | `backend/app/schemas/prediction.py` | Implemented |
| Crypto & Market Schemas | `backend/app/schemas/crypto.py`, `market.py` | Implemented |
| FastAPI App | `backend/app/main.py` | Implemented |
| REST API Routes | `backend/app/routes/crypto.py`, `market.py`, `prediction.py` | Implemented |
| Next.js API Client | `frontend/lib/api.ts` | Implemented |
| Next.js App Router | `frontend/app/` | Implemented |
| Dashboard & Decision UI | `frontend/components/` | Implemented |

## Design Principles

- Training is separate from inference
- Decision logic is separate from the LSTM model
- Data processing is separate from API routes
- Frontend and backend are independently deployable
- Multi-crypto support via configurable registry (not hard-coded per coin)
- Same preprocessing functions for all cryptocurrencies

## Academic Disclaimer

Decision-support signals are for educational demonstration only. They must not be presented as guaranteed financial advice.


