"use client";

import { useEffect, useState } from "react";
import { TrendingUp, RefreshCw, BarChart2, Shield } from "lucide-react";
import { getMarketSummary, MarketSummaryResponse } from "@/lib/api";
import { CryptoStats } from "@/components/crypto/CryptoStats";
import { PriceChart } from "@/components/charts/PriceChart";

interface MarketOverviewProps {
  ticker: string;
}

export function MarketOverview({ ticker }: MarketOverviewProps) {
  const [summary, setSummary] = useState<MarketSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    getMarketSummary(ticker)
      .then((res) => {
        if (mounted) setSummary(res);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Failed to load market statistics.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [ticker]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400">Market Telemetry</span>
          <h2 className="text-2xl font-extrabold text-white mt-1 flex items-center space-x-2">
            <span>{summary?.cryptocurrency || ticker}</span>
            <span className="text-sm font-mono text-slate-400 font-normal">({ticker})</span>
          </h2>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            getMarketSummary(ticker).then(setSummary).finally(() => setLoading(false));
          }}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Metric Cards */}
      <CryptoStats summary={summary} loading={loading} />

      {/* Historical Price Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <PriceChart ticker={ticker} />
      </div>
    </div>
  );
}
