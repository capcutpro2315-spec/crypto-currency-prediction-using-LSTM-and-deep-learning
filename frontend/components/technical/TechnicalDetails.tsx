"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Cpu, Activity, BarChart2, ShieldCheck, Database, Layers } from "lucide-react";
import { getMetrics, ModelEvaluationMetrics } from "@/lib/api";

interface TechnicalDetailsProps {
  ticker: string;
}

export function TechnicalDetails({ ticker }: TechnicalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<ModelEvaluationMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !ticker) return;

    let mounted = true;
    setLoading(true);
    getMetrics(ticker)
      .then((res) => {
        if (mounted) setMetrics(res);
      })
      .catch(() => {
        if (mounted) setMetrics(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, ticker]);

  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-900/50 overflow-hidden backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-slate-900/80 hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Technical Details & Model Architecture</h3>
            <p className="text-xs text-slate-400">
              Deep Learning (LSTM) specifications, lookback sequences, and statistical test evaluation metrics.
            </p>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-800 space-y-6 bg-slate-950/40">
          {/* Architecture Specifications Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Model Architecture & Pipeline Parameters</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Model Type</span>
                <span className="text-slate-200 font-medium">2-Layer Stacked LSTM</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Sequence Lookback</span>
                <span className="text-slate-200 font-medium">60 Daily Sequences</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Optimization Loss</span>
                <span className="text-slate-200 font-medium">Mean Squared Error (MSE)</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block text-[10px]">Scaler Preprocessing</span>
                <span className="text-slate-200 font-medium">MinMax Scaler (0 to 1)</span>
              </div>
            </div>
          </div>

          {/* Held-Out Statistical Test Metrics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Held-Out Test Set Performance Metrics ({ticker})</span>
            </h4>

            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading evaluation metrics...</div>
            ) : metrics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">R² Score</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {(metrics.r2 * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Variance explained</span>
                </div>
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">RMSE</span>
                  <span className="text-lg font-bold text-white">${metrics.rmse.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 block">Root mean squared error</span>
                </div>
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">MAE</span>
                  <span className="text-lg font-bold text-white">${metrics.mae.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 block">Mean absolute error</span>
                </div>
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">MSE</span>
                  <span className="text-lg font-bold text-white">{metrics.mse.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 block">Mean squared error</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400">
                Evaluation metrics available upon trained model inference execution.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
