/**
 * Reusable REST API Client for FastAPI Cryptocurrency Backend.
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://crypto-currency-prediction-using-lstm.onrender.com"
).replace(/\/$/, "");

export interface CryptoAsset {
  id?: string;
  name: string;
  symbol: string;
  ticker: string;
  market_cap_rank?: number | null;
  provider_id?: string;
  image?: string | null;
  last_updated?: string | null;
  historical_data_available?: boolean;
  market_data_available?: boolean;
  has_trained_model?: boolean;
  model_available?: boolean;
  training_status?: string;
}

export interface LiveMarketData {
  id: string;
  symbol: string;
  name: string;
  ticker: string;
  timestamp: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change_24h: number;
  source: string;
  freshness: string;
}

export interface ModelStatusResponse {
  ticker: string;
  cryptocurrency: string;
  data_available: boolean;
  model_available: boolean;
  prediction_available?: boolean;
  training_status: "not_started" | "training" | "ready" | "failed" | "insufficient_data" | string;
  available_history_days?: number | null;
  lookback_days?: number | null;
  model_age_hours?: number | null;
  is_stale?: boolean;
  message: string;
}

export interface SupportedCryptosResponse {
  items: CryptoAsset[];
  count: number;
  source: string;
  cached: boolean;
  last_updated: string;
  total?: number;
  cryptocurrencies?: CryptoAsset[];
}


export interface HistoricalRecord {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalDataResponse {
  cryptocurrency: string;
  ticker: string;
  total_records: number;
  records: HistoricalRecord[];
}

export interface MarketSummaryResponse {
  cryptocurrency: string;
  ticker: string;
  current_price: number;
  latest_date?: string;
  latest_volume?: number;
  historical_high: number;
  historical_low: number;
  total_trading_days?: number;
  available_history_days?: number;
  price_change_24h_percent?: number;
  volume_24h?: number;
}

export interface ScenariosData {
  available: boolean;
  best_case?: number | null;
  expected_case?: number | null;
  worst_case?: number | null;
}

export interface SourcesData {
  market?: string;
  historical?: string;
  model?: string;
  last_updated?: string;
}

export interface DataUsedData {
  market_info?: {
    current_price?: number;
    latest_date?: string;
    price_field?: string;
  };
  historical_info?: {
    available_history_days?: number;
    lookback_days?: number;
    sequence_window?: string;
  };
  model_info?: {
    type?: string;
    model_id?: string;
    forecast_horizon?: string;
  };
  limitations?: string[];
}

export interface CryptoPredictionResponse {
  cryptocurrency: string;
  ticker: string;
  symbol: string;
  quote_currency: string;
  current_price: number;
  predicted_price: number;
  expected_change_percent: number;
  price_change_amount?: number;
  direction?: string;
  last_data_date: string;
  forecast_date: string;
  sequence_length: number;
  available_history_days?: number;
  lookback_days?: number | null;
  prediction_available?: boolean;
  model_name: string;
  formatted_latest_price?: string;
  formatted_predicted_price?: string;
  scenarios?: ScenariosData;
  sources?: SourcesData;
  data_used?: DataUsedData;
}

export interface ModelEvaluationMetrics {
  cryptocurrency: string;
  ticker: string;
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  train_samples?: number;
  test_samples?: number;
  test_start_date?: string;
  test_end_date?: string;
}

export interface PredictionHistoryRecord {
  date: string;
  actual_close: number;
  predicted_close: number;
}

export interface CryptoDecisionResponse {
  cryptocurrency: string;
  ticker: string;
  current_price: number;
  predicted_price?: number | null;
  expected_change_percent?: number | null;
  confidence_score: number | null;
  confidence_label: string;
  volatility: number | null;
  volatility_label: string;
  risk_score: number | null;
  risk_label: string;
  decision_score: number;
  decision: "CONSIDER" | "WAIT" | "AVOID" | "UNAVAILABLE" | string;
  signal_summary?: string;
  supporting_factors: string[];
  risk_factors: string[];
  last_available_date?: string | null;
  forecast_date?: string | null;
  prediction_available?: boolean;
}

/**
 * Generic fetch wrapper handling HTTP status checks and error messages.
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to HTTP status text
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to the AI backend. Please make sure the FastAPI server is running.");
    }
    throw error;
  }
}

/**
 * Fetch supported cryptocurrencies list.
 */
export async function getCryptocurrencies(): Promise<SupportedCryptosResponse> {
  return fetchAPI<SupportedCryptosResponse>("/api/cryptocurrencies");
}

/**
 * Force refresh the dynamic cryptocurrency catalog from remote providers.
 */
export async function refreshCryptocurrencyCatalog(): Promise<{ status: string; cryptocurrency_count: number; refreshed_at: string; source: string }> {
  return fetchAPI<{ status: string; cryptocurrency_count: number; refreshed_at: string; source: string }>("/api/cryptocurrencies/refresh", {
    method: "POST",
  });
}


/**
 * Fetch historical OHLCV data for a ticker.
 */
export async function getHistoricalData(ticker: string, limit: number = 365): Promise<HistoricalDataResponse> {
  return fetchAPI<HistoricalDataResponse>(`/api/cryptocurrencies/${encodeURIComponent(ticker)}/history?limit=${limit}`);
}

/**
 * Fetch live market data for a ticker (60s refresh feed).
 */
export async function getLiveMarketData(ticker: string): Promise<LiveMarketData> {
  return fetchAPI<LiveMarketData>(`/api/market/${encodeURIComponent(ticker)}/live`);
}

/**
 * Fetch market summary statistics for a ticker.
 */
export async function getMarketSummary(ticker: string): Promise<MarketSummaryResponse> {
  return fetchAPI<MarketSummaryResponse>(`/api/market/${encodeURIComponent(ticker)}/summary`);
}

/**
 * Fetch model status and training lifecycle state.
 */
export async function getPredictionStatus(ticker: string): Promise<ModelStatusResponse> {
  return fetchAPI<ModelStatusResponse>(`/api/predictions/${encodeURIComponent(ticker)}/status`);
}

/**
 * Trigger background model training.
 */
export async function triggerModelTraining(ticker: string, force: boolean = false): Promise<ModelStatusResponse> {
  return fetchAPI<ModelStatusResponse>(`/api/predictions/${encodeURIComponent(ticker)}/train?force=${force}`, {
    method: "POST",
  });
}

/**
 * Request LSTM next daily closing price prediction.
 */
export async function getPrediction(ticker: string): Promise<CryptoPredictionResponse> {
  try {
    return await fetchAPI<CryptoPredictionResponse>(`/api/predictions/${encodeURIComponent(ticker)}`);
  } catch {
    return fetchAPI<CryptoPredictionResponse>("/api/predictions", {
      method: "POST",
      body: JSON.stringify({ ticker }),
    });
  }
}

/**
 * Fetch saved model evaluation metrics for a ticker.
 */
export async function getMetrics(ticker: string): Promise<ModelEvaluationMetrics> {
  const data = await fetchAPI<any>(`/api/predictions/${encodeURIComponent(ticker)}/metrics`);
  const metricsObj = data.metrics || {};
  return {
    cryptocurrency: data.cryptocurrency || ticker,
    ticker: data.ticker || ticker,
    mae: data.mae ?? metricsObj.mae ?? 0,
    mse: data.mse ?? metricsObj.mse ?? 0,
    rmse: data.rmse ?? metricsObj.rmse ?? 0,
    r2: data.r2 ?? data.r2_score ?? metricsObj.r2 ?? 0,
    train_samples: data.train_samples ?? data.training_date_range?.samples,
    test_samples: data.test_samples ?? data.test_date_range?.samples,
    test_start_date: data.test_start_date ?? data.test_date_range?.start_date,
    test_end_date: data.test_end_date ?? data.test_date_range?.end_date,
  };
}

/**
 * Fetch actual vs predicted test history for a ticker.
 */
export async function getPredictionHistory(ticker: string): Promise<PredictionHistoryRecord[]> {
  return fetchAPI<PredictionHistoryRecord[]>(`/api/predictions/${encodeURIComponent(ticker)}/history`);
}

/**
 * Fetch AI Risk, Confidence, and Decision-Support analysis for a ticker.
 */
export async function getDecisionSupport(ticker: string): Promise<CryptoDecisionResponse> {
  return fetchAPI<CryptoDecisionResponse>(`/api/predictions/${encodeURIComponent(ticker)}/decision`);
}


