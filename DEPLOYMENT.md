# Production Deployment Guide

This guide documents the steps for deploying the **Cryptocurrency Price Prediction System** publicly on **Vercel** (Next.js Frontend) and **Render** (FastAPI Backend).

---

## Architecture Summary

- **Frontend**: Next.js 14 App Router, hosted on **Vercel**.
- **Backend**: FastAPI (Python 3.11), hosted on **Render**.
- **Data Feeds**: CoinGecko, Binance, and Yahoo Finance APIs (server-side aggregated).
- **ML Engine**: Pre-trained Stacked LSTM Neural Networks (`.keras` models bundled in `backend/models/saved/`).

---

## 1. Environment Variables Matrix

### Backend (`backend/`)
| Variable | Production Example | Description |
|---|---|---|
| `ENV` | `production` | Deployment environment mode |
| `PORT` | Auto-set by Render | Port Uvicorn binds to |
| `FRONTEND_ORIGIN` | `https://your-vercel-app.vercel.app` | Allowed CORS origins (comma-separated) |

### Frontend (`frontend/`)
| Variable | Production Example | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-render-backend.onrender.com` | Base URL of the deployed FastAPI backend |

---

## 2. Backend Deployment (Render)

1. **Connect Repository**: Log into [Render Dashboard](https://dashboard.render.com/) and create a new **Web Service**.
2. **Select Repository**: Point to your Git repository.
3. **Configure Service**:
   - **Name**: `crypto-price-prediction-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables**:
   Add `FRONTEND_ORIGIN = https://<your-vercel-app-name>.vercel.app`.
5. **Deploy**: Click **Create Web Service**. Render will install dependencies, bind to `0.0.0.0:$PORT`, and provide your backend URL: `https://<render-backend-url>.onrender.com`.

---

## 3. Frontend Deployment (Vercel)

1. **Connect Repository**: Log into [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
2. **Import Repository**: Select your Git repository.
3. **Configure Project**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Edit and set to `frontend`.
   - **Build Command**: `npm run build`
4. **Environment Variables**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://<render-backend-url>.onrender.com`
5. **Deploy**: Click **Deploy**. Vercel will build and publish your Next.js frontend.

---

## 4. Post-Deployment Verification Checklist

1. **Health Probes**:
   - `GET https://<render-backend-url>.onrender.com/health` -> Should return `{"status": "ok", ...}`
   - `GET https://<render-backend-url>.onrender.com/docs` -> FastAPI Interactive OpenAPI Swagger Docs
2. **CORS Check**:
   - Open your Vercel URL in your browser.
   - Open Browser DevTools -> Network Tab.
   - Select **Bitcoin**, **Ethereum**, **Solana**, and **TRX**.
   - Verify all API requests to Render succeed with HTTP 200 without CORS errors.
3. **Chart & Decision Support Check**:
   - Run AI forecast on any asset.
   - Verify ground-truth Actual Close vs Predicted Close chart scales dynamically without `$0k` formatting artifacts.
   - Verify plain-language **"WHY THIS SIGNAL?"** section displays "What Supports This Signal" and "What Could Go Wrong" cleanly.
