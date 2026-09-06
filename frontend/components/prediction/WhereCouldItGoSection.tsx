"use client";

import React from "react";
import { TrendingUp, TrendingDown, Target, LineChart } from "lucide-react";
import { CryptoPredictionResponse } from "@/lib/api";
import { PredictionChart } from "@/components/charts/PredictionChart";

interface WhereCouldItGoSectionProps {
  ticker: string;
  prediction: CryptoPredictionResponse | null;
}

export function WhereCouldItGoSection({ ticker, prediction }: WhereCouldItGoSectionProps) {
  const currentPrice = prediction?.current_price;
  const predictedPrice = prediction?.predicted_price;
  const expectedChange = prediction?.expected_change_percent;
  const changeAmount = prediction?.price_change_amount;

  const isPos = expectedChange != null && expectedChange >= 0;

  const formatCurrency = (val: number | undefined | null) => {
    if (val == null || isNaN(val)) return "Unavailable";
    return `$${val.toLocaleString("en-US", {
      minimumFractionDigits: val < 1 ? 4 : 2,
      maximumFractionDigits: val < 1 ? 4 : 2,
    })}`;
  };

  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center space-x-2">
        <Target className="w-5 h-5 text-emerald-400" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
            Where Could It Go?
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            LSTM deep learning model forecast trajectory and historical test performance
          </p>
        </div>
      </div>

      {/* Forecast Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d1322] border border-slate-800/80 p-4 rounded-2xl">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Current Price
          </span>
          <div className="text-base font-extrabold font-mono text-white">
            {formatCurrency(currentPrice)}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Predicted Price
          </span>
          <div className="text-base font-extrabold font-mono text-emerald-400">
            {formatCurrency(predictedPrice)}
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Expected Movement
          </span>
          {expectedChange != null ? (
            <div className={`text-base font-extrabold font-mono flex items-center ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
              {isPos ? "+" : ""}{expectedChange.toFixed(2)}%
            </div>
          ) : (
            <div className="text-sm font-mono text-slate-500">N/A</div>
          )}
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Forecast Horizon
          </span>
          <div className="text-sm font-bold text-slate-200">
            1 Day (Next Close)
          </div>
        </div>
      </div>

      {/* Primary Visual Element: Clean Forecast Chart */}
      <PredictionChart ticker={ticker} />
    </section>
  );
}
