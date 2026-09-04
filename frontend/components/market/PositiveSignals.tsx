"use client";

import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoDecisionResponse, LiveMarketData, MarketSummaryResponse } from "@/lib/api";

interface PositiveSignalsProps {
  ticker: string;
  decisionData: CryptoDecisionResponse | null;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  loading: boolean;
}

export function PositiveSignals({
  ticker,
  decisionData,
  liveData,
  marketSummary,
  loading,
}: PositiveSignalsProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;

  const signals: string[] = [];

  if (decisionData?.supporting_factors && decisionData.supporting_factors.length > 0) {
    signals.push(...decisionData.supporting_factors);
  } else {
    if (change24h !== undefined && change24h !== null && change24h > 0) {
      signals.push(`24-hour price momentum is positive (+${change24h.toFixed(2)}%).`);
    }
    if (liveData?.volume && liveData.volume > 100000000) {
      signals.push("Healthy 24-hour trading volume supports liquidity.");
    }
  }

  return (
    <Card variant="hover" className="space-y-4 border-emerald-500/30">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Positive Signals</h2>
          <p className="text-xs text-slate-400">Data-driven constructive indicators for {ticker}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 py-2">
          <div className="h-4 w-3/4 bg-slate-800 animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-slate-800 animate-pulse rounded" />
        </div>
      ) : signals.length > 0 ? (
        <ul className="space-y-2.5">
          {signals.map((sig, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
              <span className="leading-relaxed">{sig}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 italic">
          No strong positive signals detected from current market data.
        </div>
      )}
    </Card>
  );
}
