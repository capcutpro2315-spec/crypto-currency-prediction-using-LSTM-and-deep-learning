"use client";

import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/common/Card";
import { getHistoricalData, HistoricalRecord } from "@/lib/api";

interface PriceTrendChartProps {
  ticker: string;
}

type RangeOption = "24H" | "7D" | "30D" | "90D" | "1Y" | "MAX";

export function PriceTrendChart({ ticker }: PriceTrendChartProps) {
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeOption>("90D");

  useEffect(() => {
    let mounted = true;
    if (!ticker) return;
    setLoading(true);
    setError(null);

    getHistoricalData(ticker, 1500)
      .then((res) => {
        if (mounted) {
          setRecords(res.records || []);
        }
      })
      .catch((err: any) => {
        if (mounted) {
          setError(err.message || "Historical price trend data is currently unavailable.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [ticker]);

  const filteredData = useMemo(() => {
    if (!records || records.length === 0) return [];
    let count = records.length;
    switch (range) {
      case "24H":
        count = 1;
        break;
      case "7D":
        count = 7;
        break;
      case "30D":
        count = 30;
        break;
      case "90D":
        count = 90;
        break;
      case "1Y":
        count = 365;
        break;
      case "MAX":
      default:
        count = records.length;
        break;
    }
    return records.slice(-Math.min(count, records.length));
  }, [records, range]);

  const latestPrice = useMemo(() => {
    if (filteredData.length === 0) return null;
    return filteredData[filteredData.length - 1].close;
  }, [filteredData]);

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
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-blue-400" />
            <span>Price Trend</span>
          </h2>
          <p className="text-xs text-slate-400">
            Interactive historical price movement and daily closing rates for {ticker}
          </p>
        </div>

        {/* Range Selector Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(["24H", "7D", "30D", "90D", "1Y", "MAX"] as RangeOption[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setRange(opt)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                range === opt
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      {loading ? (
        <div className="h-80 flex items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading historical price chart data...</span>
          </div>
        </div>
      ) : error || records.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800 p-6 text-center space-y-2">
          <span className="text-sm font-semibold text-slate-300">Historical Price Trend Unavailable</span>
          <p className="text-xs text-slate-500 max-w-md">
            {error || `No historical price observations found for ${ticker}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="marketTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(str) => {
                    try {
                      const date = new Date(str);
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    } catch {
                      return str;
                    }
                  }}
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
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as HistoricalRecord;
                      return (
                        <div className="bg-[#0b1120] border border-slate-700/90 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
                          <div className="text-slate-400 font-mono font-semibold">{label}</div>
                          <div className="text-sm font-extrabold text-blue-400">
                            Close: {formatPriceTooltip(item.close)}
                          </div>
                          {item.high && item.low ? (
                            <div className="text-[11px] text-slate-400">
                              High: {formatPriceTooltip(item.high)} | Low: {formatPriceTooltip(item.low)}
                            </div>
                          ) : null}
                          {item.volume ? (
                            <div className="text-[11px] text-slate-500">
                              Volume: ${new Intl.NumberFormat("en-US", { notation: "compact" }).format(item.volume)}
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {latestPrice ? (
                  <ReferenceLine
                    y={latestPrice}
                    stroke="#3b82f6"
                    strokeDasharray="3 3"
                    label={{
                      value: `Latest: ${formatPriceTooltip(latestPrice)}`,
                      fill: "#93c5fd",
                      fontSize: 10,
                      position: "right",
                    }}
                  />
                ) : null}
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#marketTrendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Displaying {filteredData.length} available daily price observation points.</span>
          </div>
        </div>
      )}
    </Card>
  );
}
