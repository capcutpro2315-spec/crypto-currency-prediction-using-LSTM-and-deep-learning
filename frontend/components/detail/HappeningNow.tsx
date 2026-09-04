"use client";

import React from "react";
import { Activity, Sparkles } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface HappeningNowProps {
  cryptoName: string;
  symbol: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function HappeningNow({
  cryptoName,
  symbol,
  liveData,
  marketSummary,
  decisionData,
  loading,
}: HappeningNowProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;
  const volLabel = decisionData?.volatility_label || (change24h != null && Math.abs(change24h) > 5 ? "elevated" : "moderate");

  let summaryText = "Current market insight is unavailable.";

  if (change24h != null) {
    let momentumText = "sideways price movement";
    if (change24h > 1.5) momentumText = "positive short-term momentum";
    else if (change24h < -1.5) momentumText = "downward short-term pressure";

    summaryText = `${cryptoName} (${symbol}) is currently showing ${momentumText}, although price volatility remains ${volLabel.toLowerCase()}.`;
  }

  return (
    <Card variant="gradient" className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">What&apos;s Happening Now?</h2>
          <p className="text-xs text-slate-400">Concise synthesized observation based on real-time data telemetry</p>
        </div>
      </div>

      {loading ? (
        <div className="h-14 bg-slate-900 rounded-xl animate-pulse" />
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans flex items-start space-x-3">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>&quot;{summaryText}&quot;</span>
        </div>
      )}
    </Card>
  );
}
