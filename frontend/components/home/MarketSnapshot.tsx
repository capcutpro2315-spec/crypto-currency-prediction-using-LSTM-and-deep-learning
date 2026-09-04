"use client";

import React from "react";
import { TrendingUp, TrendingDown, Clock, Activity, BarChart3, DollarSign, PieChart } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse } from "@/lib/api";

interface MarketSnapshotProps {
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  loading: boolean;
}

function formatPrice(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "Data unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: val < 1 ? 4 : 2,
    maximumFractionDigits: val < 1 ? 6 : 2,
  }).format(val);
}

function formatPercent(val: number | undefined | null): { text: string; isPositive: boolean | null } {
  if (val === undefined || val === null || isNaN(val)) return { text: "Data unavailable", isPositive: null };
  const isPos = val >= 0;
  const formatted = `${isPos ? "+" : ""}${val.toFixed(2)}%`;
  return { text: formatted, isPositive: isPos };
}

function formatCompactVolume(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) return "Data unavailable";
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
    if (diffMin <= 1) return "Data updated: Just now";
    if (diffMin < 60) return `Data updated: ${diffMin} minutes ago`;
    const diffHours = Math.round(diffMin / 60);
    return `Data updated: ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } catch {
    return "Data updated recently";
  }
}

export function MarketSnapshot({ ticker, liveData, marketSummary, loading }: MarketSnapshotProps) {
  const price = liveData?.price ?? marketSummary?.current_price;
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;
  const volume24h = liveData?.volume ?? marketSummary?.volume_24h ?? marketSummary?.latest_volume;
  const freshness = formatFreshness(liveData?.timestamp, liveData?.freshness);

  const priceText = formatPrice(price);
  const changeInfo = formatPercent(change24h);
  const volumeText = formatCompactVolume(volume24h);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Today&apos;s Crypto Snapshot</span>
          </h2>
          <p className="text-xs text-slate-400">Real-time market metrics for {ticker}</p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{loading ? "Refreshing market data..." : freshness}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Price Card */}
        <Card variant="hover" className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Price</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-28 bg-slate-800 animate-pulse rounded-md" />
          ) : (
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">{priceText}</div>
          )}
          <span className="text-[11px] text-slate-500">Latest traded rate ({ticker})</span>
        </Card>

        {/* 24h Change Card */}
        <Card variant="hover" className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">24h Change</span>
            <div
              className={`p-1.5 rounded-lg ${
                changeInfo.isPositive === true
                  ? "bg-emerald-500/10 text-emerald-400"
                  : changeInfo.isPositive === false
                  ? "bg-rose-500/10 text-rose-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {changeInfo.isPositive === true ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-slate-800 animate-pulse rounded-md" />
          ) : (
            <div
              className={`text-xl sm:text-2xl font-extrabold font-mono ${
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
          <span className="text-[11px] text-slate-500">24-hour price fluctuation</span>
        </Card>

        {/* Market Cap Card */}
        <Card variant="hover" className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Market Cap</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-28 bg-slate-800 animate-pulse rounded-md" />
          ) : (
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {/* Show Data unavailable if market cap not provided directly */}
              Data unavailable
            </div>
          )}
          <span className="text-[11px] text-slate-500">Total circulating valuation</span>
        </Card>

        {/* 24h Volume Card */}
        <Card variant="hover" className="space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">24h Volume</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-slate-800 animate-pulse rounded-md" />
          ) : (
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">{volumeText}</div>
          )}
          <span className="text-[11px] text-slate-500">24-hour trading turnover</span>
        </Card>
      </div>
    </section>
  );
}
