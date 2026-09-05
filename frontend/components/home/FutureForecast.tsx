"use client";

import React from "react";
import { ArrowRight, TrendingUp, TrendingDown, AlertCircle, Info, Sparkles, Database } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoPredictionResponse, ModelStatusResponse } from "@/lib/api";

interface FutureForecastProps {
  ticker: string;
  prediction: CryptoPredictionResponse | null;
  modelStatus: ModelStatusResponse | null;
  loading: boolean;
}

function formatPrice(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: val < 1 ? 4 : 2,
    maximumFractionDigits: val < 1 ? 6 : 2,
  }).format(val);
}

export function FutureForecast({ ticker, prediction, modelStatus, loading }: FutureForecastProps) {
  const isAvailable = prediction?.prediction_available !== false && !!prediction?.predicted_price;
  const currentPrice = prediction?.current_price;
  const predictedPrice = prediction?.predicted_price;
  const changePercent = prediction?.expected_change_percent;

  const isPos = changePercent != null ? changePercent >= 0 : null;

  // Natural language interpretation
  let interpretationText = "Current analysis points toward sideways price movement.";
  if (changePercent != null) {
    if (changePercent > 0.5) {
      interpretationText = "Current analysis points toward a possible upward move.";
    } else if (changePercent < -0.5) {
      interpretationText = "Current analysis points toward a possible downward move.";
    }
  }

  return (
    <Card variant="gradient" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Where Could It Go?</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            See what our analysis currently expects for the near future.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 w-fit font-semibold">
          <span>AI Forecast Output</span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 space-y-4 bg-slate-950/60 rounded-xl border border-slate-800 animate-pulse">
          <div className="h-6 w-48 bg-slate-800 rounded" />
          <div className="h-10 w-full bg-slate-800 rounded" />
        </div>
      ) : !isAvailable ? (
        <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-start space-x-3 text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Future forecast is currently unavailable.
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {modelStatus?.message ||
                  `Sufficient historical data or compatible model configuration is required for ${ticker}.`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-[#0d1322] rounded-xl border border-slate-800/80 space-y-8">
          {/* Striking Horizontal Composition: CURRENT $XX -> EXPECTED $XX (+X.XX%) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4 px-6 bg-[#090d16] rounded-xl border border-slate-800/60">
            {/* CURRENT */}
            <div className="text-center md:text-left space-y-1">
              <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                Current Spot
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-200 font-mono">
                {formatPrice(currentPrice)}
              </div>
            </div>

            {/* TRANSITION ARROW */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* EXPECTED RESULT */}
            <div className="text-center md:text-right space-y-1">
              <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider block">
                Expected Forecast
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {formatPrice(predictedPrice)}
              </div>
              {changePercent != null && (
                <div
                  className={`inline-flex items-center space-x-1 text-xs font-mono font-extrabold px-2.5 py-0.5 rounded ${
                    isPos
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>
                    {isPos ? "+" : ""}
                    {changePercent.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Simple Interpretation Statement */}
          <div className="text-xs sm:text-sm text-slate-300 text-center font-normal">
            &quot;{interpretationText}&quot;
          </div>

          {/* Transparency & AI Model Explanations */}
          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <details className="group bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
              <summary className="p-4 flex items-center justify-between cursor-pointer text-xs font-bold text-slate-300 uppercase tracking-wider hover:text-white transition-colors">
                <span className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span>Where Did This Analysis Come From?</span>
                </span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform font-mono text-[10px]">▼</span>
              </summary>
              <div className="p-4 pt-0 text-xs text-slate-300 space-y-3 border-t border-slate-800/60 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">MARKET DATA SOURCE</span>
                    <span className="font-semibold text-slate-200">{prediction?.sources?.market || "Yahoo Finance / Market Feed"}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">HISTORICAL DATA</span>
                    <span className="font-semibold text-slate-200">{prediction?.sources?.historical || "Yahoo Finance (Daily OHLCV)"}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">HISTORICAL COVERAGE</span>
                    <span className="font-semibold text-slate-200">{prediction?.available_history_days || "N/A"} days available</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">LOOKBACK WINDOW</span>
                    <span className="font-semibold text-slate-200">{prediction?.sequence_length || 60} days used</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">MODEL IDENTIFIER</span>
                    <span className="font-semibold text-slate-200">{prediction?.model_name || "LSTM Neural Network"}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono block">FORECAST HORIZON</span>
                    <span className="font-semibold text-slate-200">1 Day Ahead</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Data updated: {prediction?.last_data_date || "Latest observation"}
                </div>
              </div>
            </details>

            <details className="group bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
              <summary className="p-4 flex items-center justify-between cursor-pointer text-xs font-bold text-slate-300 uppercase tracking-wider hover:text-white transition-colors">
                <span className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>What Information Did the AI Use?</span>
                </span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform font-mono text-[10px]">▼</span>
              </summary>
              <div className="p-4 pt-0 text-xs text-slate-300 space-y-3 border-t border-slate-800/60 mt-2">
                <div className="space-y-2 pt-2">
                  <span className="font-bold text-emerald-400 block text-[11px] uppercase">Inputs Used by Model:</span>
                  <ul className="space-y-1.5 text-slate-300">
                    <li className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Historical daily closing price series ({prediction?.sequence_length || 60}-day sliding window)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>MinMax feature scaling fitted on training set</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Sequential time-series momentum patterns</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="font-bold text-rose-400 block text-[11px] uppercase">Inputs NOT Used by Model:</span>
                  <ul className="space-y-1 text-slate-400">
                    <li className="flex items-center space-x-2">
                      <span className="text-rose-400 font-bold">✗</span>
                      <span>Unannounced news articles, social media, sentiment analysis, or exchange order-book depth</span>
                    </li>
                  </ul>
                </div>
              </div>
            </details>

            <details className="group bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
              <summary className="p-4 flex items-center justify-between cursor-pointer text-xs font-bold text-slate-300 uppercase tracking-wider hover:text-white transition-colors">
                <span className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>What Can Change the Forecast?</span>
                </span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform font-mono text-[10px]">▼</span>
              </summary>
              <div className="p-4 pt-0 text-xs text-slate-300 space-y-2 border-t border-slate-800/60 mt-2">
                <p className="pt-2 text-slate-300 leading-relaxed">
                  The model relies purely on time-series history. The forecast can be altered or invalidated by external factors not captured in price history:
                </p>
                <ul className="space-y-1.5 text-slate-400 pl-2">
                  <li>• Sudden regulatory announcements or policy changes</li>
                  <li>• Unexpected market-wide liquidity crashes or macroeconomic shifts</li>
                  <li>• Extreme volatility spikes breaking historical momentum patterns</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      )}
    </Card>
  );
}

