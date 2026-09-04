"use client";

import { DollarSign, Activity, Calendar, Layers } from "lucide-react";
import { MarketSummaryResponse } from "@/lib/api";

interface CryptoStatsProps {
  summary: MarketSummaryResponse | null;
  loading?: boolean;
}

export function CryptoStats({ summary, loading }: CryptoStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-900/60 border border-slate-800 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
          <DollarSign className="w-3.5 h-3.5 text-blue-400" />
          <span>Current Price</span>
        </div>
        <div className="text-xl font-extrabold text-white">
          ${summary.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-slate-500">Latest OHLCV Record</span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Historical High</span>
        </div>
        <div className="text-xl font-extrabold text-emerald-400">
          ${summary.historical_high?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-slate-500">Sample Record Maximum</span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
          <Activity className="w-3.5 h-3.5 text-rose-400" />
          <span>Historical Low</span>
        </div>
        <div className="text-xl font-extrabold text-rose-400">
          ${summary.historical_low?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-slate-500">Sample Record Minimum</span>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>History Days</span>
        </div>
        <div className="text-xl font-extrabold text-slate-200">
          {summary.total_trading_days || summary.available_history_days || 365} Days
        </div>
        <span className="text-[10px] text-slate-500">Continuous Time-Series</span>
      </div>
    </div>
  );
}
