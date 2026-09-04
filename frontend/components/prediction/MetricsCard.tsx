"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Award, Target, Activity, BarChart2 } from "lucide-react";
import { getMetrics, ModelEvaluationMetrics } from "@/lib/api";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface MetricsCardProps {
  ticker: string;
}

export function MetricsCard({ ticker }: MetricsCardProps) {
  const [metrics, setMetrics] = useState<ModelEvaluationMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMetrics(ticker);
      setMetrics(res);
    } catch (err: any) {
      setError(err.message || "Failed to load model evaluation metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [ticker]);

  if (loading) {
    return <LoadingState message="Loading model evaluation metrics..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMetrics} />;
  }

  if (!metrics) return null;

  const formatUSD = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(val);

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">STATISTICAL EVALUATION</span>
          <h3 className="text-xl font-bold text-white">How Well the AI Model Performs</h3>
        </div>
        <span className="text-xs text-gray-400 bg-gray-800/60 px-3 py-1 rounded-lg border border-gray-700">
          Held-out Test Period
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* R-Squared Metric */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Award className="w-4 h-4" /> Model Performance
            </span>
            <div
              className="relative group/tooltip cursor-help"
              title="R² measures how well the model explains variation in the observed cryptocurrency prices. Higher values generally indicate a better fit."
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition-colors" />
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block group-focus/tooltip:block w-64 p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 shadow-xl z-20 pointer-events-none leading-normal">
                R² measures how well the model explains variation in the observed cryptocurrency prices. Higher values generally indicate a better fit.
              </div>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 mb-2">R² Score</div>
          <div className="text-2xl font-bold text-emerald-400">
            {(metrics.r2 * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-tight">
            Shows how well the model explains the changes in cryptocurrency price.
          </p>
        </div>

        {/* RMSE Metric */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-blue-400">
              <Target className="w-4 h-4" /> Typical Prediction Error
            </span>
            <div
              className="relative group/tooltip cursor-help"
              title="RMSE measures the typical prediction error and is expressed in the same units as the predicted price."
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition-colors" />
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block group-focus/tooltip:block w-64 p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 shadow-xl z-20 pointer-events-none leading-normal">
                RMSE measures the typical prediction error and is expressed in the same units as the predicted price.
              </div>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 mb-2">RMSE</div>
          <div className="text-2xl font-bold text-blue-300">
            {formatUSD(metrics.rmse)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-tight">
            Shows the typical size of the model's prediction error in the same price unit as the data.
          </p>
        </div>

        {/* MAE Metric */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-indigo-400">
              <Activity className="w-4 h-4" /> Average Prediction Error
            </span>
            <div
              className="relative group/tooltip cursor-help"
              title="MAE measures the average absolute difference between actual and predicted prices."
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition-colors" />
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block group-focus/tooltip:block w-64 p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 shadow-xl z-20 pointer-events-none leading-normal">
                MAE measures the average absolute difference between actual and predicted prices.
              </div>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 mb-2">MAE</div>
          <div className="text-2xl font-bold text-indigo-300">
            {formatUSD(metrics.mae)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-tight">
            Shows the average difference between the actual price and the predicted price.
          </p>
        </div>

        {/* MSE Metric */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl relative group">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="flex items-center gap-1 font-semibold text-purple-400">
              <BarChart2 className="w-4 h-4" /> Prediction Error Loss
            </span>
            <div
              className="relative group/tooltip cursor-help"
              title="MSE is the average squared prediction error. Larger errors have a greater effect on this metric."
            >
              <HelpCircle className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition-colors" />
              <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block group-focus/tooltip:block w-64 p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 shadow-xl z-20 pointer-events-none leading-normal">
                MSE is the average squared prediction error. Larger errors have a greater effect on this metric.
              </div>
            </div>
          </div>
          <div className="text-xs font-medium text-gray-400 mb-2">MSE</div>
          <div className="text-xl font-bold text-purple-300 truncate">
            {new Intl.NumberFormat("en-US", { notation: "compact" }).format(metrics.mse)}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-tight">
            Measures prediction error by giving larger errors more weight.
          </p>
        </div>
      </div>
    </div>
  );
}
