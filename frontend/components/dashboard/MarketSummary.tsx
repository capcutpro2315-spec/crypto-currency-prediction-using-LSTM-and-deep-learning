"use client";

import { useEffect, useState } from "react";
import { DollarSign, Calendar, BarChart3, TrendingUp, TrendingDown, RefreshCw, Radio } from "lucide-react";
import { getMarketSummary, getLiveMarketData, MarketSummaryResponse, LiveMarketData } from "@/lib/api";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface MarketSummaryProps {
  ticker: string;
}

const REFRESH_INTERVAL_MS = 60000; // 60 seconds

export function MarketSummary({ ticker }: MarketSummaryProps) {
  const [summaryData, setSummaryData] = useState<MarketSummaryResponse | null>(null);
  const [liveData, setLiveData] = useState<LiveMarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const loadData = async (isInitial: boolean = false) => {
    if (!ticker) return;
    if (isInitial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const [sumRes, liveRes] = await Promise.allSettled([
        getMarketSummary(ticker),
        getLiveMarketData(ticker),
      ]);

      if (sumRes.status === "fulfilled") {
        setSummaryData(sumRes.value);
      }
      if (liveRes.status === "fulfilled") {
        setLiveData(liveRes.value);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      if (isInitial) {
        setError(err.message || "Failed to load market summary statistics.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);

    const intervalId = setInterval(() => {
      loadData(false);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [ticker]);

  if (loading) {
    return <LoadingState message="Loading market summary & live feed..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadData(true)} />;
  }

  if (!summaryData) return null;

  const currentPrice = liveData?.price ?? summaryData.current_price;
  const change24h = liveData?.change_24h;
  const volume = liveData?.volume && liveData.volume > 0 ? liveData.volume : (summaryData.latest_volume || summaryData.volume_24h || null);
  const source = liveData?.source || "Market Feed";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(val);

  const formatNumber = (val: number | null) =>
    val != null && val > 0 ? new Intl.NumberFormat("en-US", { notation: "compact", compactDisplay: "short" }).format(val) : "Unavailable";

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Market Overview</span>
            <span className="inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              <Radio className="w-2.5 h-2.5 mr-1 text-emerald-400 animate-pulse" /> Live Market Data ({source})
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
            {summaryData.cryptocurrency} <span className="text-sm font-normal text-gray-400">({summaryData.ticker})</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center space-x-1.5 text-xs text-gray-400 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/60">
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${refreshing ? "animate-spin" : ""}`} />
              <span>Updated ~1 min ago ({lastUpdated})</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/60 font-mono">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Historical data: {summaryData.total_trading_days || summaryData.available_history_days || 365} days</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* Live Price */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <div className="flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Live Price</span>
            </div>
            {change24h !== undefined && (
              <span
                className={`text-xs font-bold ${
                  change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {change24h >= 0 ? "+" : ""}
                {change24h.toFixed(2)}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(currentPrice)}</div>
        </div>

        {/* 24h Volume */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span>Volume (24h)</span>
          </div>
          <div className="text-2xl font-bold text-white">${formatNumber(volume)}</div>
        </div>

        {/* Historical High */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Historical High</span>
          </div>
          <div className="text-2xl font-bold text-indigo-300">{formatCurrency(summaryData.historical_high)}</div>
        </div>

        {/* Historical Low */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span>Historical Low</span>
          </div>
          <div className="text-2xl font-bold text-amber-300">{formatCurrency(summaryData.historical_low)}</div>
        </div>
      </div>
    </div>
  );
}

