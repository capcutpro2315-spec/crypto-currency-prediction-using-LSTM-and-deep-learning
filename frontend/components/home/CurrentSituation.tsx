"use client";

import React from "react";
import { Compass, Flame, Zap, ShieldAlert, Activity } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface CurrentSituationProps {
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function CurrentSituation({
  ticker,
  liveData,
  marketSummary,
  decisionData,
  loading,
}: CurrentSituationProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;
  const cryptoName = liveData?.name || ticker.replace("-USD", "");

  // Derive trend
  let trend: "Bullish" | "Neutral" | "Bearish" | "Data unavailable" = "Data unavailable";
  if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    if (change24h > 1.0) trend = "Bullish";
    else if (change24h < -1.0) trend = "Bearish";
    else trend = "Neutral";
  }

  // Derive momentum
  let momentum: "Strong" | "Moderate" | "Weak" | "Data unavailable" = "Data unavailable";
  if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    const absChange = Math.abs(change24h);
    if (absChange >= 4.0) momentum = "Strong";
    else if (absChange >= 1.5) momentum = "Moderate";
    else momentum = "Weak";
  }

  // Derive volatility label
  let volatility: "Low" | "Medium" | "High" | "Data unavailable" = "Data unavailable";
  if (decisionData?.volatility_label) {
    const v = decisionData.volatility_label.toLowerCase();
    if (v.includes("low")) volatility = "Low";
    else if (v.includes("high") || v.includes("elevated")) volatility = "High";
    else volatility = "Medium";
  } else if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    const absChange = Math.abs(change24h);
    if (absChange > 5.0) volatility = "High";
    else if (absChange > 2.0) volatility = "Medium";
    else volatility = "Low";
  }

  // Derive market condition
  let marketCondition: "Stable" | "Active" | "Highly Volatile" | "Data unavailable" = "Data unavailable";
  if (volatility === "High" || (change24h && Math.abs(change24h) > 6.0)) {
    marketCondition = "Highly Volatile";
  } else if (trend !== "Data unavailable") {
    marketCondition = change24h != null && Math.abs(change24h) > 1.5 ? "Active" : "Stable";
  }

  // Generate dynamic sentence
  let summarySentence = `Market state analysis unavailable for ${cryptoName}.`;
  if (trend !== "Data unavailable") {
    const trendText = trend === "Bullish" ? "positive" : trend === "Bearish" ? "downward" : "sideways";
    const momentumText = momentum.toLowerCase();
    const volText = volatility !== "Data unavailable" ? volatility.toLowerCase() : "moderate";
    summarySentence = `${cryptoName} is currently showing ${trendText} short-term momentum (${momentumText}), while market volatility remains ${volText}.`;
  }

  return (
    <Card variant="gradient" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>What&apos;s Happening Now?</span>
          </h2>
          <p className="text-xs text-slate-400">Current market behavior summary for {cryptoName}</p>
        </div>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
          {ticker}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 py-4">
          <div className="h-12 bg-slate-800 animate-pulse rounded-xl" />
          <div className="h-4 w-3/4 bg-slate-800 animate-pulse rounded-md" />
        </div>
      ) : (
        <>
          {/* Indicator Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Trend</span>
              </div>
              <div
                className={`text-base font-bold ${
                  trend === "Bullish"
                    ? "text-emerald-400"
                    : trend === "Bearish"
                    ? "text-rose-400"
                    : trend === "Neutral"
                    ? "text-blue-400"
                    : "text-slate-400"
                }`}
              >
                {trend}
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Momentum</span>
              </div>
              <div className="text-base font-bold text-slate-200">{momentum}</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>Volatility</span>
              </div>
              <div className="text-base font-bold text-slate-200">{volatility}</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Condition</span>
              </div>
              <div className="text-base font-bold text-slate-200">{marketCondition}</div>
            </div>
          </div>

          {/* Dynamic Explanation Paragraph */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300 leading-relaxed">
            &quot;{summarySentence}&quot;
          </div>
        </>
      )}
    </Card>
  );
}
