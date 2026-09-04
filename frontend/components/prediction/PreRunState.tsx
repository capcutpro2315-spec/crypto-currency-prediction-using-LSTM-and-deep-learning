"use client";

import React from "react";
import { Cpu, Database, Clock, Calendar, RefreshCw } from "lucide-react";
import { Card } from "@/components/common/Card";
import { ModelStatusResponse, LiveMarketData } from "@/lib/api";

interface PreRunStateProps {
  cryptoName: string;
  ticker: string;
  modelStatus: ModelStatusResponse | null;
  liveData: LiveMarketData | null;
  onRunForecast: () => void;
}

export function PreRunState({
  cryptoName,
  ticker,
  modelStatus,
  liveData,
  onRunForecast,
}: PreRunStateProps) {
  const daysAvailable = modelStatus?.available_history_days || 365;
  const statusLabel =
    modelStatus?.training_status === "insufficient_data"
      ? "Insufficient Data"
      : modelStatus?.model_available || modelStatus?.training_status === "ready"
      ? "Ready"
      : "Training Required";

  const updatedText = liveData?.timestamp
    ? new Date(liveData.timestamp).toLocaleTimeString()
    : "Live Feed";

  return (
    <Card variant="gradient" className="space-y-6 text-center py-10 max-w-3xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-xl">
        <Cpu className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Analyze {cryptoName}</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          The deep learning model is prepared to infer the next daily closing price forecast based on 60 day historical time series sequences.
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-xs">
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center space-x-1">
            <Database className="w-3 h-3 text-blue-400" />
            <span>Historical Data</span>
          </span>
          <span className="font-mono font-bold text-slate-200 block">{daysAvailable} Days</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center space-x-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>Model Status</span>
          </span>
          <span className="font-mono font-bold text-emerald-400 block">{statusLabel}</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center space-x-1">
            <Calendar className="w-3 h-3 text-indigo-400" />
            <span>Horizon</span>
          </span>
          <span className="font-mono font-bold text-slate-200 block">Next Day (1D)</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase flex items-center justify-center space-x-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Data Updated</span>
          </span>
          <span className="font-mono font-bold text-slate-200 block">{updatedText}</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onRunForecast}
          className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer active:scale-95 inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Run AI Prediction</span>
        </button>
      </div>
    </Card>
  );
}
