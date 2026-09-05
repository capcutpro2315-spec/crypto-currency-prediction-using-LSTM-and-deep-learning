"use client";

import React from "react";
import { Database, TrendingUp, ShieldAlert, Activity } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoAsset, LiveMarketData } from "@/lib/api";

interface DashboardMarketOverviewProps {
  catalog: CryptoAsset[];
  liveData: LiveMarketData | null;
  loading: boolean;
}

export function DashboardMarketOverview({
  catalog,
  liveData,
  loading,
}: DashboardMarketOverviewProps) {
  const totalCryptos = catalog.length > 0 ? catalog.length : "250+";

  // Derive market trend from live data or catalog average
  let marketTrend = "Neutral";
  const change24h = liveData?.change_24h;
  if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    if (change24h > 1.0) marketTrend = "Bullish";
    else if (change24h < -1.0) marketTrend = "Bearish";
  }

  // Derive market volatility
  let volatility = "Medium";
  if (change24h !== undefined && change24h !== null && !isNaN(change24h)) {
    const abs = Math.abs(change24h);
    if (abs > 4.5) volatility = "High";
    else if (abs < 1.5) volatility = "Low";
  }

  // Data status
  const dataStatus = loading ? "Syncing..." : liveData ? "Live" : catalog.length > 0 ? "Live" : "Unavailable";

  return (
    <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-4 sm:p-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
        {/* Metric 1: Total Cryptocurrencies */}
        <div className="space-y-1 sm:px-4 first:pl-0">
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
            Catalog Scope
          </span>
          <div className="text-xl font-bold text-white font-mono">
            {loading ? "..." : `${totalCryptos} Assets`}
          </div>
        </div>

        {/* Metric 2: Market Trend */}
        <div className="space-y-1 sm:px-4 pt-3 sm:pt-0">
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
            24h Market Bias
          </span>
          <div
            className={`text-xl font-bold font-mono ${
              marketTrend === "Bullish"
                ? "text-emerald-400"
                : marketTrend === "Bearish"
                ? "text-rose-400"
                : "text-blue-400"
            }`}
          >
            {loading ? "..." : marketTrend}
          </div>
        </div>

        {/* Metric 3: Market Volatility */}
        <div className="space-y-1 sm:px-4 pt-3 sm:pt-0">
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
            Volatility Index
          </span>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {loading ? "..." : volatility}
          </div>
        </div>

        {/* Metric 4: Data Status */}
        <div className="space-y-1 sm:px-4 pt-3 sm:pt-0">
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
            Telemetry Feed
          </span>
          <div className="text-xl font-bold text-emerald-400 font-mono flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{loading ? "Syncing..." : dataStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
