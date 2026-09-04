"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Code, Cpu } from "lucide-react";
import { Card } from "@/components/common/Card";
import { getMetrics, ModelEvaluationMetrics } from "@/lib/api";

interface CollapsibleTechnicalDetailsProps {
  ticker: string;
}

export function CollapsibleTechnicalDetails({ ticker }: CollapsibleTechnicalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<ModelEvaluationMetrics | null>(null);

  useEffect(() => {
    if (!ticker) return;
    getMetrics(ticker)
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, [ticker]);

  return (
    <Card variant="bordered" className="space-y-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
            VIEW AI MODEL DETAILS
          </h2>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            (Technical ML Architecture Specs)
          </span>
        </div>

        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Model Type</span>
              <span className="font-mono font-bold text-slate-200 block">Stacked LSTM</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Architecture</span>
              <span className="font-mono font-bold text-slate-200 block">2 Layers (60 units)</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Lookback Window</span>
              <span className="font-mono font-bold text-blue-400 block">60 Days</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Forecast Horizon</span>
              <span className="font-mono font-bold text-emerald-400 block">1 Day (Next Close)</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Training Samples</span>
              <span className="font-mono font-bold text-slate-200 block">
                {metrics?.train_samples ? `${metrics.train_samples} samples` : "80% Train / 20% Test"}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Test Samples</span>
              <span className="font-mono font-bold text-slate-200 block">
                {metrics?.test_samples ? `${metrics.test_samples} samples` : "Held-Out Test Set"}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">R² Evaluation</span>
              <span className="font-mono font-bold text-emerald-400 block">
                {metrics?.r2 !== undefined ? metrics.r2.toFixed(4) : "N/A"}
              </span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-mono">Model Identifier</span>
              <span className="font-mono font-bold text-slate-300 block truncate">
                lstm_model_{ticker.toLowerCase().replace("-", "_")}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
