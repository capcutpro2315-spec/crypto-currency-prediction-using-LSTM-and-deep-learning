"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { Card } from "@/components/common/Card";
import { getHistoricalData, CryptoPredictionResponse, HistoricalRecord } from "@/lib/api";

interface PriceOutlookChartProps {
  ticker: string;
  cryptoName: string;
  prediction: CryptoPredictionResponse | null;
  loading: boolean;
}

export function PriceOutlookChart({
  ticker,
  cryptoName,
  prediction,
  loading,
}: PriceOutlookChartProps) {
  const [history, setHistory] = useState<HistoricalRecord[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    if (!ticker) return;
    setFetchingHistory(true);

    getHistoricalData(ticker, 30)
      .then((res) => {
        if (mounted) setHistory(res.records || []);
      })
      .catch(() => {
        if (mounted) setHistory([]);
      })
      .finally(() => {
        if (mounted) setFetchingHistory(false);
      });

    return () => {
      mounted = false;
    };
  }, [ticker]);

  // Build combined timeline data (History + Current + Forecast)
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const items = history.slice(-20).map((h) => ({
      label: h.date ? new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
      price: h.close,
      isForecast: false,
    }));

    if (prediction && prediction.predicted_price != null) {
      const forecastLabel = prediction.forecast_date
        ? new Date(prediction.forecast_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "Forecast (1D)";

      items.push({
        label: forecastLabel,
        price: prediction.predicted_price,
        isForecast: true,
      });
    }

    return items;
  }, [history, prediction]);

  const formatPriceTooltip = (val: number) => {
    if (val < 1) return `$${val.toFixed(4)}`;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(val);
  };

  const formatAxisY = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    if (val < 1) return `$${val.toFixed(3)}`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <Card variant="default" className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Price Outlook</span>
        </h2>
        <p className="text-xs text-slate-400">
          Historical trend connected to the expected near-future forecast horizon point
        </p>
      </div>

      {loading || fetchingHistory ? (
        <div className="h-72 flex items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading outlook chart...</span>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800 p-6 text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          <span className="text-sm font-semibold text-slate-300">Outlook Chart Unavailable</span>
          <p className="text-xs text-slate-500 max-w-md">
            Insufficient price telemetry or forecast output to generate historical-to-forecast trend line.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={formatAxisY}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#0b1120] border border-slate-700/90 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
                          <div className="text-slate-400 font-mono font-semibold flex items-center justify-between space-x-2">
                            <span>{item.label}</span>
                            {item.isForecast && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                                AI Forecast
                              </span>
                            )}
                          </div>
                          <div className={`text-sm font-extrabold ${item.isForecast ? "text-emerald-400" : "text-blue-400"}`}>
                            Price: {formatPriceTooltip(item.price)}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isForecast) {
                      return <circle key="forecast-dot" cx={cx} cy={cy} r={6} fill="#10b981" stroke="#047857" strokeWidth={2} />;
                    }
                    return <circle key={props.key} cx={cx} cy={cy} r={3} fill="#3b82f6" />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span>Historical Closing Price</span>
              </span>
              {prediction?.predicted_price && (
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>AI Forecast Horizon</span>
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-500">Exact forecast horizon points only</span>
          </div>
        </div>
      )}
    </Card>
  );
}
