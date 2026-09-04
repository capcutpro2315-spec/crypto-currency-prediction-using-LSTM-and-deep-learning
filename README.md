# Cryptocurrency Price Prediction System Using Deep Learning

Final-year AI & Data Science mini project: a web-based system for cryptocurrency price prediction using an LSTM deep learning model, with market analysis and AI-based decision-support signals.

## Disclaimer

This system is an **academic project** for educational purposes. Prediction outputs and decision-support signals (CONSIDER / WAIT / AVOID) do **not** constitute financial advice and do **not** guarantee profits.

## Architecture

```
User → Next.js Frontend → FastAPI Backend → Data Processing → LSTM Model
     → Prediction → Risk + Confidence + Decision Engine → Dashboard
```

## Project Structure

| Folder | Purpose |
|--------|---------|
| `frontend/` | Next.js + React + TypeScript UI |
| `backend/` | FastAPI API, ML pipeline, and training scripts |
| `docs/` | Architecture notes and project documentation |

## Supported Cryptocurrencies

Configurable via `backend/data/crypto_registry.json`. Initial registry includes Bitcoin, Ethereum, Solana, XRP, Dogecoin, and others. Additional assets can be added without rewriting the pipeline.

## Development Status

| Stage | Status |
|-------|--------|
| 1. Project scaffold | Done |
| 2. Data & preprocessing pipeline | Done |
| 3. LSTM model training | Done |
| 4. Model evaluation & forecast output | Done |
| 5. FastAPI Backend & AI Prediction API | Done |
| 6. Next.js Frontend Dashboard & Integration | Done |
| 7. Investment Decision Engine & Support UI | **Done** |

### Architecture Flow

```
NEXT.JS FRONTEND (localhost:3000)
       ↓  REST API (NEXT_PUBLIC_API_URL)
FASTAPI BACKEND (localhost:8000)
       ↓
SERVICE LAYER (prediction_service.py & decision_service.py)
       ↓
SAVED LSTM MODEL + VOLATILITY + CONFIDENCE
       ↓
AI DECISION SIGNAL (CONSIDER / WAIT / AVOID)
```

### Frontend Web Dashboard

#### 1. Environment Configuration
Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 2. Install & Run Next.js Application
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Backend API & ML System

#### 1. Install Backend Dependencies
```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
```

#### 2. Offline LSTM Model Training
```bash
python training/train_lstm.py --ticker BTC-USD --epochs 50 --batch-size 32
python scripts/evaluate_model.py --ticker BTC-USD
```

#### 3. Start FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```

#### 4. API Documentation
Once running, interactive API docs are available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc UI:** `http://localhost:8000/redoc`

#### 5. Core REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/cryptocurrencies` | List supported assets & model availability |
| `GET` | `/api/cryptocurrencies/{ticker}/history` | Historical daily OHLCV price records |
| `GET` | `/api/market/{ticker}/summary` | Current price, volume, and high/low stats |
| `POST` | `/api/predictions` | Generate next daily price forecast via LSTM |
| `GET` | `/api/predictions/{ticker}/metrics` | Saved test-set metrics (MAE, MSE, RMSE, R²) |
| `GET` | `/api/predictions/{ticker}/history` | Held-out test period actual vs predicted data |
| `GET` | `/api/predictions/{ticker}/decision` | AI Risk, Confidence, Signal (CONSIDER/WAIT/AVOID) & Factors |


## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Recharts
- **Backend:** Python, FastAPI, Uvicorn, Pydantic
- **ML/DL:** Pandas, NumPy, Scikit-learn, TensorFlow/Keras (LSTM), Matplotlib

