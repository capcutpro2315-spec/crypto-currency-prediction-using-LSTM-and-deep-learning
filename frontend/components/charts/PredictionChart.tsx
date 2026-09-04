"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { getPredictionHistory, PredictionHistoryRecord } from "@/lib/api";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface PredictionChartProps {
  ticker: string;
}

export function PredictionChart({ ticker }: PredictionChartProps) {
  const [data, setData] = useState<PredictionHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getPredictionHistory(ticker);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load actual vs predicted test dataset.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [ticker]);

  // Validate and sanitize data points
  const validData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => {
      return (
        item &&
        typeof item.date === "string" &&
        item.date.trim().length > 0 &&
        typeof item.actual_close === "number" &&
        Number.isFinite(item.actual_close) &&
        item.actual_close >= 0 &&
        typeof item.predicted_close === "number" &&
        Number.isFinite(item.predicted_close) &&
        item.predicted_close >= 0
      );
    });
  }, [data]);

  // Compute maximum price scale to adapt Y-axis ticks and tooltips dynamically
  const maxPrice = useMemo(() => {
    if (validData.length === 0) return 0;
    return validData.reduce((max, d) => {
      return Math.max(max, d.actual_close, d.predicted_close);
    }, 0);
  }, [validData]);

  // Dynamic currency formatter adaptative to price magnitude
  const formatPrice = (val: number) => {
    if (typeof val !== "number" || !Number.isFinite(val)) return "N/A";

    if (maxPrice >= 10000) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (maxPrice >= 1000) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    }
    if (maxPrice >= 1) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    }
    if (maxPrice >= 0.01) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 3,
        maximumFractionDigits: 4,
      }).format(val);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(val);
  };

  // Magnitude-aware Y-axis tick formatter (prevents $0k bug on low-priced coins like TRX, ADA, SOL)
  const formatYAxisTick = (val: number) => {
    if (typeof val !== "number" || !Number.isFinite(val)) return "";

    if (maxPrice >= 10000) {
      if (val >= 1000) {
        return `$${Math.round(val / 1000)}k`;
      }
      return `$${val}`;
    }
    if (maxPrice >= 1000) {
      return `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    if (maxPrice >= 1) {
      return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}`;
  };

  if (loading) {
    return <LoadingState message="Loading actual vs predicted evaluation chart..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchHistory} />;
  }

  if (validData.length === 0) {
    return (
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
        No valid historical comparison data available for {ticker}.
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Actual vs Predicted Comparison</h3>
          <p className="text-xs text-gray-400">
            Evaluating AI forecasts against real ground-truth closing prices on test data ({validData.length} days)
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            <span className="text-gray-300">Actual Close</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="text-emerald-400 font-semibold">Predicted Close</span>
          </div>
        </div>
      </div>

      <div className="w-full h-88">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={validData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(str) => {
                const date = new Date(str);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={formatYAxisTick}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length >= 2) {
                  const actual = payload[0].value as number;
                  const predicted = payload[1].value as number;
                  const diff = predicted - actual;
                  const diffPercent = actual > 0 ? (diff / actual) * 100 : 0;

                  const formattedDate = label
                    ? new Date(label).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <div className="bg-[#0d1322] border border-gray-700 p-3.5 rounded-xl shadow-2xl backdrop-blur-md">
                      <div className="text-xs text-gray-400 font-medium mb-2 border-b border-gray-800 pb-1">
                        {formattedDate || label}
                      </div>
                      <div className="text-sm font-semibold text-blue-400 flex items-center justify-between gap-4">
                        <span>Actual Close:</span>
                        <span>{formatPrice(actual)}</span>
                      </div>
                      <div className="text-sm font-semibold text-emerald-400 flex items-center justify-between gap-4 mt-1">
                        <span>Predicted Close:</span>
                        <span>{formatPrice(predicted)}</span>
                      </div>
                      <div className="text-xs text-gray-400 border-t border-gray-800/80 pt-1.5 mt-2 flex items-center justify-between">
                        <span>Error Delta:</span>
                        <span className={diff >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {diff >= 0 ? "+" : ""}{formatPrice(diff)} ({diffPercent >= 0 ? "+" : ""}{diffPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="actual_close"
              name="Actual Close"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="predicted_close"
              name="Predicted Close"
              stroke="#10b981"
              strokeWidth={2.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 6, fill: "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* USER-FRIENDLY EXPLANATION (SECTION 1.5) */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1.5">
        <p className="leading-relaxed">
          <strong className="text-blue-400">Blue</strong> shows the coin's real closing price.&nbsp;
          <strong className="text-emerald-400">Green</strong> shows the price predicted by the AI model.&nbsp;
          The closer the two lines are, the more closely the model followed the actual price movement.
        </p>
      </div>
    </div>
  );
}

