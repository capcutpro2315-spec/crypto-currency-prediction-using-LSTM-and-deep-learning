"use client";

import { Cpu, ArrowUpRight, ArrowDownRight, Calendar, Layers, ShieldAlert, Sparkles } from "lucide-react";
import { CryptoPredictionResponse } from "@/lib/api";

interface PredictionCardProps {
  prediction: CryptoPredictionResponse;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const isPositive = prediction.expected_change_percent >= 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(val);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border border-blue-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative Glow background */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Model Forecast
            </span>
            <h3 className="text-xl font-bold text-white">{prediction.cryptocurrency} Forecast</h3>
          </div>
        </div>

        <span className="px-3 py-1 bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-full">
          {prediction.model_name || "LSTM Deep Learning"}
        </span>
      </div>

      {/* Main Forecast Comparison Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Current Price */}
        <div className="bg-gray-800/40 border border-gray-700/60 p-5 rounded-xl">
          <span className="text-xs text-gray-400 font-medium">Latest Closing Price ({prediction.last_data_date})</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            {formatCurrency(prediction.current_price)}
          </div>
        </div>

        {/* Predicted Price */}
        <div className="bg-blue-950/30 border border-blue-500/40 p-5 rounded-xl relative">
          <span className="text-xs text-blue-300 font-medium flex items-center justify-between">
            <span>Predicted Next-Day Close</span>
            <span className="text-[11px] font-mono text-gray-400">Target Date: {prediction.forecast_date}</span>
          </span>
          <div className="text-3xl font-extrabold text-blue-400 mt-1">
            {formatCurrency(prediction.predicted_price)}
          </div>

          {/* Expected Change Badge */}
          <div className="mt-3 flex items-center space-x-2">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                isPositive
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                  : "bg-red-950 text-red-400 border border-red-800/60"
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              <span>Expected Change: {isPositive ? "+" : ""}{prediction.expected_change_percent.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-800 text-xs text-gray-400">
        <div className="flex items-center space-x-2 bg-gray-800/30 p-2.5 rounded-lg border border-gray-800">
          <Calendar className="w-4 h-4 text-blue-400" />
          <div>
            <span className="block text-[10px] text-gray-500 uppercase">Forecast Date</span>
            <span className="font-semibold text-gray-200">{prediction.forecast_date}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-800/30 p-2.5 rounded-lg border border-gray-800">
          <Layers className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="block text-[10px] text-gray-500 uppercase">Lookback Window</span>
            <span className="font-semibold text-gray-200">{prediction.sequence_length || 60} Days Sequence</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-gray-800/30 p-2.5 rounded-lg border border-gray-800 col-span-2 sm:col-span-1">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <div>
            <span className="block text-[10px] text-gray-500 uppercase">Model Architecture</span>
            <span className="font-semibold text-gray-200">2-Layer Stacked LSTM</span>
          </div>
        </div>
      </div>

      {/* Educational Academic Disclaimer */}
      <div className="mt-6 flex items-start space-x-2 p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-300/80">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Academic Disclaimer:</strong> This forecast is produced by an offline-trained Deep Learning LSTM model for research purposes. Model outputs do not guarantee financial returns.
        </p>
      </div>
    </div>
  );
}
