"use client";

import React from "react";
import { Zap, Flame, ShieldAlert, Activity } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface MarketMomentumProps {
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function MarketMomentum({
  ticker,
  liveData,
  marketSummary,
  decisionData,
  loading,
}: MarketMomentumProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;

  // Derive Trend
  let trend = "Unavailable";
  let trendExplanation = "Insufficient price data to evaluate trend direction.";
  if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    if (change24h > 1.0) {
      trend = "Bullish";
      trendExplanation = "Recent price telemetry shows upward price direction over 24 hours.";
    } else if (change24h < -1.0) {
      trend = "Bearish";
      trendExplanation = "Recent price telemetry shows downward price pressure over 24 hours.";
    } else {
      trend = "Neutral";
      trendExplanation = "Prices have remained relatively flat with minimal 24h direction.";
    }
  }

  // Derive Momentum
  let momentum = "Unavailable";
  let momentumExplanation = "Recent price velocity cannot be computed.";
  if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    const abs = Math.abs(change24h);
    if (abs >= 4.0) {
      momentum = "Strong";
      momentumExplanation = "Significant price velocity indicates strong short-term market momentum.";
    } else if (abs >= 1.5) {
      momentum = "Moderate";
      momentumExplanation = "Moderate price velocity shows standard market interest.";
    } else {
      momentum = "Weak";
      momentumExplanation = "Low price velocity indicates low directional momentum.";
    }
  }

  // Derive Volatility
  let volatility = "Unavailable";
  let volExplanation = "Volatility range statistics pending.";
  if (decisionData?.volatility_label) {
    const v = decisionData.volatility_label.toLowerCase();
    if (v.includes("low")) {
      volatility = "Low";
      volExplanation = "Low daily price dispersion indicates stable trading ranges.";
    } else if (v.includes("high") || v.includes("elevated")) {
      volatility = "High";
      volExplanation = "Elevated price dispersion indicates wider intraday swings.";
    } else {
      volatility = "Medium";
      volExplanation = "Standard volatility profile within normal crypto bounds.";
    }
  } else if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    const abs = Math.abs(change24h);
    if (abs > 5.0) {
      volatility = "High";
      volExplanation = "Elevated price dispersion indicates wider intraday swings.";
    } else if (abs > 2.0) {
      volatility = "Medium";
      volExplanation = "Standard volatility profile within normal crypto bounds.";
    } else {
      volatility = "Low";
      volExplanation = "Low daily price dispersion indicates stable trading ranges.";
    }
  }

  // Derive Trading Activity
  let activity = "Unavailable";
  let actExplanation = "Trading volume activity profile pending.";
  const volume = liveData?.volume ?? marketSummary?.volume_24h;
  if (volume !== undefined && volume !== null && volume > 0) {
    if (volume > 500000000) {
      activity = "High";
      actExplanation = "High trading volume turnover indicates strong institutional and retail engagement.";
    } else if (volume > 50000000) {
      activity = "Normal";
      actExplanation = "Healthy trading volume supports typical liquidity and price discovery.";
    } else {
      activity = "Low";
      actExplanation = "Lower trading volume turnover relative to top-tier crypto assets.";
    }
  }

  return (
    <Card variant="gradient" className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <span>Market Momentum</span>
        </h2>
        <p className="text-xs text-slate-400">Core behavioral metrics and directional state for {ticker}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trend Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Trend</span>
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  trend === "Bullish"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : trend === "Bearish"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {trend}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
              {trendExplanation}
            </p>
          </div>

          {/* Momentum Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Momentum</span>
              </span>
              <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                {momentum}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
              {momentumExplanation}
            </p>
          </div>

          {/* Volatility Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>Volatility</span>
              </span>
              <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">
                {volatility}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
              {volExplanation}
            </p>
          </div>

          {/* Trading Activity Card */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Activity</span>
              </span>
              <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                {activity}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
              {actExplanation}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
