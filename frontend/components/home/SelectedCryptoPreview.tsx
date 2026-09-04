"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Activity, DollarSign, Clock, ShieldCheck } from "lucide-react";
import { getMarketSummary, MarketSummaryResponse } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { useCrypto } from "@/lib/CryptoContext";

export function SelectedCryptoPreview() {
  const { selectedTicker } = useCrypto();
  const [summary, setSummary] = useState<MarketSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTicker) {
      setSummary(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getMarketSummary(selectedTicker)
      .then((res) => {
        if (mounted) setSummary(res);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Market data currently unavailable for selected asset.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedTicker]);

  if (!selectedTicker) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 text-center space-y-2 backdrop-blur-sm">
        <p className="text-sm font-semibold text-slate-300">Select a cryptocurrency to begin your analysis.</p>
        <p className="text-xs text-slate-500">Choose from the catalog above to view live market telemetry and AI forecasts.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Selected Asset Telemetry</span>
          <div className="flex items-center space-x-3 mt-1">
            <h2 className="text-2xl font-extrabold text-white">
              {summary?.cryptocurrency || selectedTicker.replace("-USD", "")}
            </h2>
            <Badge variant="info" size="sm">
              {selectedTicker}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <Button
            href={`/analysis/${encodeURIComponent(selectedTicker)}`}
            variant="primary"
            size="md"
            icon={<TrendingUp className="w-4 h-4" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Analyze This Cryptocurrency
          </Button>

          <Button
            href={`/prediction/${encodeURIComponent(selectedTicker)}`}
            variant="secondary"
            size="md"
          >
            Run AI Forecast
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      {loading ? (
        <div className="p-4 text-center text-xs text-slate-400">Loading market telemetry for {selectedTicker}...</div>
      ) : error ? (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400">{error}</div>
      ) : summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Current Market Price</span>
            <span className="text-xl font-extrabold text-white">
              ${summary.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Sample Record High</span>
            <span className="text-xl font-extrabold text-emerald-400">
              ${summary.historical_high?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Sample Record Low</span>
            <span className="text-xl font-extrabold text-rose-400">
              ${summary.historical_low?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-slate-500 block text-[10px]">Historical Sequence</span>
            <span className="text-xl font-extrabold text-slate-200">
              {summary.available_history_days || summary.total_trading_days || 365} Days
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-500">No market telemetry record available for {selectedTicker}.</div>
      )}
    </div>
  );
}
