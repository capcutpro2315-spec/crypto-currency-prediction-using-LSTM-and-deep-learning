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
    <section className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">See the Bigger Picture</h2>
        <p className="text-xs text-slate-400">Current snapshot and market synthesis for selected asset</p>
      </div>

      <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="space-y-4 py-4">
            <div className="h-10 w-48 bg-slate-900 animate-pulse rounded" />
            <div className="h-14 w-64 bg-slate-900 animate-pulse rounded" />
          </div>
        ) : (
          <>
            {/* Visual Focus: Dominant Asset & Price Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{cryptoName}</h3>
                  <span className="text-sm font-mono font-bold text-slate-400 uppercase">({symbol})</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Live spot reference price</p>
              </div>

              <div className="sm:text-right">
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {priceText}
                </div>
                {change24h != null ? (
                  <div className={`text-sm font-mono font-bold flex items-center sm:justify-end mt-1 ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {isPos ? "+" : ""}{change24h.toFixed(2)}% (24h)
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">24h Change unavailable</span>
                )}
              </div>
            </div>

            {/* Secondary Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Market Mood</span>
                <div className={`text-sm font-bold ${marketMood === "Positive" ? "text-emerald-400" : marketMood === "Negative" ? "text-rose-400" : "text-blue-400"}`}>
                  {marketMood}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Price Trend</span>
                <div className={`text-sm font-bold ${priceTrend === "Upward" ? "text-emerald-400" : priceTrend === "Downward" ? "text-rose-400" : "text-slate-300"}`}>
                  {priceTrend}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Risk Level</span>
                <div className={`text-sm font-bold ${riskLevel === "Low" ? "text-emerald-400" : riskLevel === "High" ? "text-rose-400" : "text-amber-400"}`}>
                  {riskLevel}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Trading Activity</span>
                <div className="text-sm font-bold text-slate-200">{tradingActivity}</div>
              </div>
            </div>

            {/* Dynamic Summary Statement */}
            <div className="pt-2 text-xs sm:text-sm text-slate-400 border-t border-slate-800/60 leading-relaxed font-sans">
              {summaryText}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
