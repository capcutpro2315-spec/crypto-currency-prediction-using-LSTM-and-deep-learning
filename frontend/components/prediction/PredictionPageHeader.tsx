"use client";

import React from "react";
import { Cpu, RefreshCw } from "lucide-react";
import { HomeCryptoSearch } from "@/components/home/HomeCryptoSearch";

interface PredictionPageHeaderProps {
  cryptoName: string;
  symbol: string;
  ticker: string;
  onRunForecast: () => void;
  loading: boolean;
}

export function PredictionPageHeader({
  cryptoName,
  symbol,
  ticker,
  onRunForecast,
  loading,
}: PredictionPageHeaderProps) {
  return (
    <div className="space-y-6 pb-6 border-b border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* Badge & Ticker */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-sm shrink-0">
              {symbol.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{cryptoName}</h1>
                <span className="text-sm font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-lg">
                  {symbol.toUpperCase()}
                </span>
              </div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 mt-0.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Price Forecast</span>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Explore AI-powered price forecasts, possible future scenarios, and market risk.
          </p>
        </div>

        {/* Action Button & Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={onRunForecast}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Run AI Prediction</span>
          </button>

          <div className="w-full sm:w-72">
            <HomeCryptoSearch />
          </div>
        </div>
      </div>
    </div>
  );
}
