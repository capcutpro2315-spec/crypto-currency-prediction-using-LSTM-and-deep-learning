"use client";

import React from "react";
import { Compass, Flame, Zap, ShieldAlert, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface CoinSnapshotProps {
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function CoinSnapshot({
  ticker,
  liveData,
  marketSummary,
  decisionData,
  loading,
}: CoinSnapshotProps) {
  const cryptoName = liveData?.name || ticker.replace("-USD", "");
  const symbol = liveData?.symbol || ticker.split("-")[0];
  const price = liveData?.price ?? marketSummary?.current_price;
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;

  const priceText = price != null ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unavailable";
  const isPos = change24h != null && change24h >= 0;

  // 1. Market Mood
  let marketMood: "Positive" | "Neutral" | "Negative" | "Unavailable" = "Unavailable";
  if (change24h != null) {
    if (change24h > 1.5) marketMood = "Positive";
    else if (change24h < -1.5) marketMood = "Negative";
    else marketMood = "Neutral";
  }

  // 2. Price Trend
  let priceTrend: "Upward" | "Sideways" | "Downward" | "Unavailable" = "Unavailable";
  if (change24h != null) {
    if (change24h > 0.5) priceTrend = "Upward";
    else if (change24h < -0.5) priceTrend = "Downward";
    else priceTrend = "Sideways";
  }

  // 3. Risk Level
  let riskLevel: "Low" | "Medium" | "High" | "Unavailable" = "Unavailable";
  if (decisionData?.risk_label) {
    const r = decisionData.risk_label.toUpperCase();
    if (r === "LOW") riskLevel = "Low";
    else if (r === "HIGH") riskLevel = "High";
    else riskLevel = "Medium";
  } else if (change24h != null) {
    const absC = Math.abs(change24h);
    if (absC > 5.0) riskLevel = "High";
    else if (absC > 2.0) riskLevel = "Medium";
    else riskLevel = "Low";
  }

  // 4. Trading Activity
  let tradingActivity: "Low" | "Normal" | "High" | "Unavailable" = "Unavailable";
  const vol = liveData?.volume ?? marketSummary?.volume_24h;
  if (vol != null && vol > 0) {
    if (vol > 1000000000) tradingActivity = "High";
    else if (vol > 10000000) tradingActivity = "Normal";
    else tradingActivity = "Low";
  } else if (change24h != null) {
    tradingActivity = Math.abs(change24h) > 3.0 ? "High" : "Normal";
  }

  // Dynamic Human-Readable Summary
  let summaryText = "Current market insight is unavailable.";
  if (change24h != null) {
    const moodDesc = marketMood === "Positive" ? "positive recent momentum" : marketMood === "Negative" ? "downward pressure" : "stable sideways trading";
    const riskDesc = riskLevel !== "Unavailable" ? riskLevel.toLowerCase() : "moderate";
    summaryText = `${cryptoName} (${symbol}) is currently showing ${moodDesc}, while market volatility and overall risk remain ${riskDesc}.`;
  }

  return (
    <Card variant="gradient" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">See the Bigger Picture</h2>
            <p className="text-xs text-slate-400">Market snapshot & indicator synthesis for {cryptoName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-right">
          <div>
            <div className="text-lg font-extrabold text-white font-mono">{priceText}</div>
            {change24h != null ? (
              <span className={`text-xs font-mono font-bold flex items-center justify-end ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {isPos ? "+" : ""}{change24h.toFixed(2)}% (24h)
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-mono">24h Change unavailable</span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 py-2">
          <div className="h-16 bg-slate-900 rounded-xl animate-pulse" />
          <div className="h-6 w-3/4 bg-slate-900 rounded-lg animate-pulse" />
        </div>
      ) : (
        <>
          {/* 4 Simple Indicator Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Market Mood</span>
              <div className={`text-base font-bold ${marketMood === "Positive" ? "text-emerald-400" : marketMood === "Negative" ? "text-rose-400" : "text-blue-400"}`}>
                {marketMood}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Price Trend</span>
              <div className={`text-base font-bold ${priceTrend === "Upward" ? "text-emerald-400" : priceTrend === "Downward" ? "text-rose-400" : "text-slate-300"}`}>
                {priceTrend}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Risk</span>
              <div className={`text-base font-bold ${riskLevel === "Low" ? "text-emerald-400" : riskLevel === "High" ? "text-rose-400" : "text-amber-400"}`}>
                {riskLevel}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Trading Activity</span>
              <div className="text-base font-bold text-slate-200">{tradingActivity}</div>
            </div>
          </div>

          {/* Dynamic Summary Statement */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300 leading-relaxed font-sans">
            &quot;{summaryText}&quot;
          </div>
        </>
      )}
    </Card>
  );
}
