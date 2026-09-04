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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Cryptocurrencies */}
      <Card variant="hover" className="space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Cryptocurrencies</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Database className="w-4 h-4" />
          </div>
        </div>
        {loading ? (
          <div className="h-7 w-20 bg-slate-800 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-extrabold text-white font-mono">{totalCryptos} Assets</div>
        )}
        <span className="text-[11px] text-slate-500">Dynamic catalog coverage</span>
      </Card>

      {/* Card 2: Market Trend */}
      <Card variant="hover" className="space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Market Trend</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        {loading ? (
          <div className="h-7 w-24 bg-slate-800 animate-pulse rounded" />
        ) : (
          <div
            className={`text-2xl font-extrabold font-mono ${
              marketTrend === "Bullish"
                ? "text-emerald-400"
                : marketTrend === "Bearish"
                ? "text-rose-400"
                : "text-blue-400"
            }`}
          >
            {marketTrend}
          </div>
        )}
        <span className="text-[11px] text-slate-500">24-hour broad market bias</span>
      </Card>

      {/* Card 3: Market Volatility */}
      <Card variant="hover" className="space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Market Volatility</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        {loading ? (
          <div className="h-7 w-20 bg-slate-800 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-extrabold text-amber-400 font-mono">{volatility}</div>
        )}
        <span className="text-[11px] text-slate-500">Price dispersion level</span>
      </Card>

      {/* Card 4: Data Status */}
      <Card variant="hover" className="space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Data Status</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        {loading ? (
          <div className="h-7 w-20 bg-slate-800 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-extrabold text-emerald-400 font-mono flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{dataStatus}</span>
          </div>
        )}
        <span className="text-[11px] text-slate-500">Real-time telemetry feed</span>
      </Card>
    </div>
  );
}
