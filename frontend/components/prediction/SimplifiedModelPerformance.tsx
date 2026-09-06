"use client";

import React, { useState, useEffect } from "react";
import { Award, HelpCircle, Activity, BarChart2 } from "lucide-react";
import { Card } from "@/components/common/Card";
import { getMetrics, ModelEvaluationMetrics } from "@/lib/api";

interface SimplifiedModelPerformanceProps {
  ticker: string;
}

export function SimplifiedModelPerformance({ ticker }: SimplifiedModelPerformanceProps) {
  const [metrics, setMetrics] = useState<ModelEvaluationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!ticker) return;
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
  }, [ticker]);

  const cards = [
    {
      title: "Model Performance",
      tech: "R² Score",
      value: metrics?.r2 !== undefined ? `${(metrics.r2 * 100).toFixed(1)}%` : "Unavailable",
      tooltip: "R² (Coefficient of Determination) measures how well the model captures price variance. Higher percentage indicates better fit.",
    },
    {
      title: "Typical Prediction Error",
      tech: "RMSE",
      value: metrics?.rmse !== undefined ? `$${metrics.rmse.toFixed(2)}` : "Unavailable",
      tooltip: "RMSE (Root Mean Squared Error) measures the typical dollar magnitude of prediction errors, penalizing larger deviations.",
    },
    {
      title: "Average Prediction Error",
      tech: "MAE",
      value: metrics?.mae !== undefined ? `$${metrics.mae.toFixed(2)}` : "Unavailable",
      tooltip: "MAE (Mean Absolute Error) represents the average absolute dollar difference between predicted and actual prices.",
    },
    {
      title: "Prediction Error Loss",
      tech: "MSE",
      value: metrics?.mse !== undefined ? metrics.mse.toFixed(2) : "Unavailable",
      tooltip: "MSE (Mean Squared Error) represents the quadratic loss function minimized during neural network optimization.",
    },
  ];

  return (
    <Card variant="gradient" className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>How Well the Model Performs</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Historical test set evaluation metrics computed on held-out test data for {ticker}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((item, idx) => {
            const isHovered = activeTooltip === item.title;

            return (
              <div
                key={idx}
                className="relative bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-colors"
                onMouseEnter={() => setActiveTooltip(item.title)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{item.title}</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                </div>

                <div className="text-xl font-extrabold font-mono text-emerald-400">{item.value}</div>
                <div className="text-[10px] font-mono text-slate-500">Technical: {item.tech}</div>

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#090d16] border border-slate-700 p-3 rounded-xl shadow-2xl z-50 text-[11px] text-slate-300 leading-relaxed animate-in fade-in duration-150">
                    {item.tooltip}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
