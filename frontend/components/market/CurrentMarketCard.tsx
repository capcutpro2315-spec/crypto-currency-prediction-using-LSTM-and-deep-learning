"use client";

import React from "react";
import { DollarSign, TrendingUp, TrendingDown, Clock, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse } from "@/lib/api";

interface CurrentMarketCardProps {
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  loading: boolean;
}

function formatPrice(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: val < 1 ? 4 : 2,
    maximumFractionDigits: val < 1 ? 6 : 2,
  }).format(val);
}

function formatPercent(val: number | undefined | null): { text: string; isPositive: boolean | null } {
  if (val === undefined || val === null || isNaN(val)) return { text: "Unavailable", isPositive: null };
  const isPos = val >= 0;
  return { text: `${isPos ? "+" : ""}${val.toFixed(2)}%`, isPositive: isPos };
}

function formatCompactVolume(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    compactDisplay: "short",
  }).format(val);
}

function formatFreshness(timestamp: string | undefined | null, freshnessText: string | undefined | null): string {
  if (freshnessText) return freshnessText;
  if (!timestamp) return "Data updated recently";
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMin = Math.round((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffMin <= 1) return "Last updated: Just now";
    if (diffMin < 60) return `Last updated: ${diffMin} minutes ago`;
    const diffHours = Math.round(diffMin / 60);
    return `Last updated: ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } catch {
    return "Last updated recently";
  }
}

export function CurrentMarketCard({ ticker, liveData, marketSummary, loading }: CurrentMarketCardProps) {
  const currentPrice = liveData?.price ?? marketSummary?.current_price;
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;
  const high24h = liveData?.high ?? marketSummary?.historical_high;
  const low24h = liveData?.low ?? marketSummary?.historical_low;
  const volume24h = liveData?.volume ?? marketSummary?.volume_24h ?? marketSummary?.latest_volume;
  const freshness = formatFreshness(liveData?.timestamp, liveData?.freshness);

  const priceText = formatPrice(currentPrice);
  const changeInfo = formatPercent(change24h);
  const highText = formatPrice(high24h);
  const lowText = formatPrice(low24h);
  const volumeText = formatCompactVolume(volume24h);

  return (
    <Card variant="gradient" className="space-y-6">
      {/* Card Header & Freshness */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span>Current Market</span>
          </h2>
          <p className="text-xs text-slate-400">Live telemetry and 24-hour market extremes for {ticker}</p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{loading ? "Refreshing market data..." : freshness}</span>
        </div>
      </div>

      {/* Grid of 6 Key Financial Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1: Current Price */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Current Price</span>
          {loading ? (
            <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-lg font-extrabold text-white font-mono">{priceText}</div>
          )}
        </div>

        {/* Metric 2: 24h Change */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">24h Change</span>
          {loading ? (
            <div className="h-6 w-20 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div
              className={`text-lg font-extrabold font-mono ${
                changeInfo.isPositive === true
                  ? "text-emerald-400"
                  : changeInfo.isPositive === false
                  ? "text-rose-400"
                  : "text-slate-400"
              }`}
            >
              {changeInfo.text}
            </div>
          )}
        </div>

        {/* Metric 3: 24h High */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            <span>24h High</span>
          </span>
          {loading ? (
            <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-lg font-extrabold text-white font-mono">{highText}</div>
          )}
        </div>

        {/* Metric 4: 24h Low */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
            <ArrowDownRight className="w-3 h-3 text-rose-400" />
            <span>24h Low</span>
          </span>
          {loading ? (
            <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-lg font-extrabold text-white font-mono">{lowText}</div>
          )}
        </div>

        {/* Metric 5: 24h Volume */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
            <BarChart3 className="w-3 h-3 text-amber-400" />
            <span>24h Volume</span>
          </span>
          {loading ? (
            <div className="h-6 w-20 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-lg font-extrabold text-white font-mono">{volumeText}</div>
          )}
        </div>

        {/* Metric 6: Market Cap */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
            <PieChart className="w-3 h-3 text-indigo-400" />
            <span>Market Cap</span>
          </span>
          {loading ? (
            <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
          ) : (
            <div className="text-lg font-extrabold text-slate-400 font-mono">Unavailable</div>
          )}
        </div>
      </div>
    </Card>
  );
}
