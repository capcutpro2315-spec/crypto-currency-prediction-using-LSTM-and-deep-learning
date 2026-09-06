"use client";

import React from "react";
import { TrendingUp, TrendingDown, Activity, DollarSign, ShieldAlert, Compass } from "lucide-react";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface WhatsHappeningNowSectionProps {
  cryptoName: string;
  symbol: string;
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function WhatsHappeningNowSection({
  cryptoName,
  symbol,
  ticker,
  liveData,
  marketSummary,
  decisionData,
  loading,
}: WhatsHappeningNowSectionProps) {
  const price = liveData?.price ?? marketSummary?.current_price;
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;

  const isPos = change24h != null && change24h >= 0;
  const priceText =
    price != null
      ? `$${price.toLocaleString("en-US", {
          minimumFractionDigits: price < 1 ? 4 : 2,
          maximumFractionDigits: price < 1 ? 4 : 2,
        })}`
      : "Unavailable";

  // Trend summary
  let priceTrend: "Upward" | "Sideways" | "Downward" | "N/A" = "N/A";
  if (change24h != null) {
    if (change24h > 0.5) priceTrend = "Upward";
    else if (change24h < -0.5) priceTrend = "Downward";
    else priceTrend = "Sideways";
  }

  // Momentum summary
  let momentumText = "stable sideways momentum";
  if (change24h != null) {
    if (change24h > 1.5) momentumText = "positive short-term momentum";
    else if (change24h < -1.5) momentumText = "downward price momentum";
  }

  // Volatility summary
  const volatilityVal = decisionData?.volatility;
  const volatilityLabel = decisionData?.volatility_label || (change24h != null && Math.abs(change24h) > 4.0 ? "High" : "Moderate");

  // Dynamic natural language summary
  let summaryText = `${cryptoName} (${symbol}) is currently showing ${momentumText}, while ${volatilityLabel.toLowerCase()} volatility means prices can shift dynamically over short windows.`;
  if (price == null && change24h == null) {
    summaryText = `Market telemetry data for ${cryptoName} (${symbol}) is currently updating.`;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center space-x-2">
        <Compass className="w-4 h-4 text-blue-400" />
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase">
          What&apos;s Happening Right Now?
        </h2>
      </div>

      <div className="bg-[#0d1322] border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-800/60 rounded w-3/4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-800/60 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Natural language summary statement */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {summaryText}
            </p>

            {/* Compact supporting values grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-800/60">
              {/* 1. Current Price */}
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/60 space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Current Price
                </span>
                <div className="text-sm sm:text-base font-extrabold font-mono text-white">
                  {priceText}
                </div>
              </div>

              {/* 2. 24h Change */}
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/60 space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  24h Change
                </span>
                {change24h != null ? (
                  <div className={`text-sm sm:text-base font-extrabold font-mono flex items-center ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                    {isPos ? <TrendingUp className="w-3.5 h-3.5 mr-1 shrink-0" /> : <TrendingDown className="w-3.5 h-3.5 mr-1 shrink-0" />}
                    <span>{isPos ? "+" : ""}{change24h.toFixed(2)}%</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-500">N/A</span>
                )}
              </div>

              {/* 3. Trend */}
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/60 space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Trend
                </span>
                <div className={`text-sm sm:text-base font-bold ${priceTrend === "Upward" ? "text-emerald-400" : priceTrend === "Downward" ? "text-rose-400" : "text-slate-300"}`}>
                  {priceTrend}
                </div>
              </div>

              {/* 4. Volatility */}
              <div className="bg-[#090d16] p-3 rounded-xl border border-slate-800/60 space-y-0.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Volatility
                </span>
                <div className="text-sm sm:text-base font-bold text-slate-200">
                  {volatilityLabel}
                  {volatilityVal != null && (
                    <span className="text-xs font-mono text-slate-400 ml-1">
                      ({volatilityVal.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
