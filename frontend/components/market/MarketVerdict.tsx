"use client";

import React from "react";
import Link from "next/link";
import { Compass, TrendingUp, ArrowRight, Info } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse } from "@/lib/api";

interface MarketVerdictProps {
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  loading: boolean;
}

export function MarketVerdict({ ticker, liveData, marketSummary, loading }: MarketVerdictProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;

  let state: "BULLISH" | "NEUTRAL" | "BEARISH" = "NEUTRAL";
  let explanation = "Price movement has remained sideways over recent trading periods.";

  if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    if (change24h > 1.0) {
      state = "BULLISH";
      explanation = "Recent price momentum is positive, though standard crypto volatility applies.";
    } else if (change24h < -1.0) {
      state = "BEARISH";
      explanation = "Recent price action shows downward pressure, suggesting cautious current trading conditions.";
    }
  }

  const getStateStyle = (s: string) => {
    switch (s) {
      case "BULLISH":
        return "bg-emerald-500/15 border-emerald-500/40 text-emerald-400";
      case "BEARISH":
        return "bg-rose-500/15 border-rose-500/40 text-rose-400";
      default:
        return "bg-blue-500/15 border-blue-500/40 text-blue-400";
    }
  };

  return (
    <Card variant="gradient" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Current Market Condition</span>
          </h2>
          <p className="text-xs text-slate-400">Synthesized market state summary for {ticker}</p>
        </div>

        {loading ? (
          <div className="h-8 w-28 bg-slate-800 animate-pulse rounded-xl" />
        ) : (
          <span className={`px-4 py-1.5 rounded-xl text-xs font-mono font-extrabold border ${getStateStyle(state)}`}>
            {state}
          </span>
        )}
      </div>

      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          &quot;{explanation}&quot;
        </p>
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>This describes current market conditions. See AI Prediction for future-price analysis.</span>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Link
          href={`/prediction/${encodeURIComponent(ticker)}`}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center space-x-2 active:scale-95"
        >
          <TrendingUp className="w-4 h-4 text-emerald-300" />
          <span>Explore AI Prediction →</span>
        </Link>
      </div>
    </Card>
  );
}
