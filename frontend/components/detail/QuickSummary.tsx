"use client";

import React from "react";
import { Compass, Flame, Zap, ShieldAlert, Activity, DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface QuickSummaryProps {
  ticker: string;
  cryptoName: string;
  symbol: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function QuickSummary({
  ticker,
  cryptoName,
  symbol,
  liveData,
  marketSummary,
  decisionData,
  loading,
}: QuickSummaryProps) {
  const price = liveData?.price ?? marketSummary?.current_price;
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;
  const volume24h = liveData?.volume ?? marketSummary?.volume_24h ?? (marketSummary as any)?.latest_volume;
  const marketCap = (marketSummary as any)?.market_cap;

  const priceText = price != null ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unavailable";
  const changePos = change24h != null && change24h >= 0;

  const volumeText = volume24h != null && volume24h > 0
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(volume24h)
    : "Unavailable";

  const marketCapText = marketCap != null && marketCap > 0
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(marketCap)
    : "Unavailable";

  // Indicators calculation
  let currentTrend: "Upward" | "Sideways" | "Downward" | "Unavailable" = "Unavailable";
  if (change24h != null) {
    if (change24h > 0.5) currentTrend = "Upward";
    else if (change24h < -0.5) currentTrend = "Downward";
    else currentTrend = "Sideways";
  }

  let marketMood: "Positive" | "Neutral" | "Negative" | "Unavailable" = "Unavailable";
  if (change24h != null) {
    if (change24h > 1.5) marketMood = "Positive";
    else if (change24h < -1.5) marketMood = "Negative";
    else marketMood = "Neutral";
  }

  let riskLevel: "Low" | "Medium" | "High" | "Unavailable" = "Unavailable";
  if (decisionData?.risk_label) {
    const r = decisionData.risk_label.toUpperCase();
    if (r.includes("LOW")) riskLevel = "Low";
    else if (r.includes("HIGH") || r.includes("ELEVATED")) riskLevel = "High";
    else riskLevel = "Medium";
  } else if (change24h != null) {
    const absC = Math.abs(change24h);
    if (absC >= 5.0) riskLevel = "High";
    else if (absC >= 2.0) riskLevel = "Medium";
    else riskLevel = "Low";
  }

  let tradingActivity: "Low" | "Normal" | "High" | "Unavailable" = "Unavailable";
  if (volume24h != null && volume24h > 0) {
    if (volume24h > 1000000000) tradingActivity = "High";
    else if (volume24h > 10000000) tradingActivity = "Normal";
    else tradingActivity = "Low";
  } else if (change24h != null) {
    tradingActivity = Math.abs(change24h) > 3.0 ? "High" : "Normal";
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
          <Compass className="w-5 h-5 text-blue-400" />
          <span>At a Glance</span>
        </h2>
        <p className="text-xs text-slate-400">Key metrics and synthesized market behavior indicators</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="hover" className="space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Current Price</span>
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-extrabold text-white font-mono">{priceText}</div>
              <span className="text-[11px] text-slate-500">Live rate ({symbol})</span>
            </Card>

            <Card variant="hover" className="space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">24h Change</span>
                {changePos ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
              </div>
              <div className={`text-xl font-extrabold font-mono ${changePos ? "text-emerald-400" : "text-rose-400"}`}>
                {change24h != null ? `${changePos ? "+" : ""}${change24h.toFixed(2)}%` : "Unavailable"}
              </div>
              <span className="text-[11px] text-slate-500">24-hour price fluctuation</span>
            </Card>

            <Card variant="hover" className="space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Market Cap</span>
                <PieChart className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-extrabold text-white font-mono">{marketCapText}</div>
              <span className="text-[11px] text-slate-500">Circulating valuation</span>
            </Card>

            <Card variant="hover" className="space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider">24h Volume</span>
                <BarChart3 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-extrabold text-white font-mono">{volumeText}</div>
              <span className="text-[11px] text-slate-500">24-hour trading turnover</span>
            </Card>
          </div>

          {/* Bottom 4 Indicators Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Current Trend</span>
              <div className={`text-sm font-bold ${currentTrend === "Upward" ? "text-emerald-400" : currentTrend === "Downward" ? "text-rose-400" : "text-blue-400"}`}>
                {currentTrend}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Market Mood</span>
              <div className={`text-sm font-bold ${marketMood === "Positive" ? "text-emerald-400" : marketMood === "Negative" ? "text-rose-400" : "text-blue-400"}`}>
                {marketMood}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Risk Level</span>
              <div className={`text-sm font-bold ${riskLevel === "Low" ? "text-emerald-400" : riskLevel === "High" ? "text-rose-400" : "text-amber-400"}`}>
                {riskLevel}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">Trading Activity</span>
              <div className="text-sm font-bold text-slate-200">{tradingActivity}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
