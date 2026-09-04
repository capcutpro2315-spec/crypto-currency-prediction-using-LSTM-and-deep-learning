"use client";

import React from "react";
import { Cpu, ArrowRight, TrendingUp, TrendingDown, Info } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoPredictionResponse } from "@/lib/api";

interface MainForecastResultProps {
  cryptoName: string;
  ticker: string;
  prediction: CryptoPredictionResponse;
}

function formatPrice(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || val <= 0) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: val < 1 ? 4 : 2,
    maximumFractionDigits: val < 1 ? 6 : 2,
  }).format(val);
}

export function MainForecastResult({ cryptoName, ticker, prediction }: MainForecastResultProps) {
  const currentPrice = prediction.current_price;
  const predictedPrice = prediction.predicted_price;

  // Validate zero/missing prices
  const isValid = currentPrice > 0 && predictedPrice > 0 && prediction.prediction_available !== false;

  const changePercent = isValid
    ? prediction.expected_change_percent ?? ((predictedPrice - currentPrice) / currentPrice) * 100
    : null;

  const isPos = changePercent !== null ? changePercent > 0.15 : null;
  const isNeg = changePercent !== null ? changePercent < -0.15 : null;

  let interpretationText = "AI expects limited price movement over the forecast horizon.";
  if (isPos) {
    interpretationText = "AI expects the price to move higher over the forecast horizon.";
  } else if (isNeg) {
    interpretationText = "AI expects the price to move lower over the forecast horizon.";
  }

  return (
    <Card variant="gradient" className="space-y-6 border-emerald-500/40 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            LSTM Model Output
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            AI FORECAST FOR {cryptoName.toUpperCase()}
          </h2>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 w-fit">
          <Cpu className="w-3.5 h-3.5" />
          <span>Horizon: Next Day (1D)</span>
        </div>
      </div>

      {!isValid ? (
        <div className="p-6 bg-slate-950/70 rounded-2xl border border-slate-800 text-center space-y-2">
          <span className="text-sm font-bold text-slate-300">Forecast Unavailable</span>
          <p className="text-xs text-slate-400">
            Unable to compute valid forecast prices for {ticker}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Price Transition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* CURRENT PRICE */}
            <div className="space-y-1 bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                CURRENT PRICE
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {formatPrice(currentPrice)}
              </div>
              <span className="text-[11px] text-slate-500">Latest market closing rate</span>
            </div>

            {/* Transition Arrow */}
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="flex items-center space-x-2 text-blue-400">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  LSTM Inference
                </span>
                <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                Forecast Horizon: 1 Day
              </span>
            </div>

            {/* AI EXPECTED PRICE */}
            <div className="space-y-1 bg-slate-950/70 border border-emerald-500/30 p-5 rounded-2xl md:text-right">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex md:justify-end items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>AI EXPECTED PRICE</span>
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {formatPrice(predictedPrice)}
              </div>
              <div
                className={`inline-flex items-center space-x-1 text-xs font-bold font-mono px-2.5 py-1 rounded-md ${
                  isPos
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : isNeg
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                }`}
              >
                {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : isNeg ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                <span>
                  EXPECTED MOVEMENT: {changePercent && changePercent > 0 ? "+" : ""}
                  {changePercent?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Simple Interpretation Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-medium">&quot;{interpretationText}&quot;</span>
          </div>
        </div>
      )}
    </Card>
  );
}
