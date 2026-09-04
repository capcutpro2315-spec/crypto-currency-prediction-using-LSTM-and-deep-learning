"use client";

import React, { useState, useEffect, useMemo } from "react";
import { History, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card } from "@/components/common/Card";
import { getHistoricalData, HistoricalRecord } from "@/lib/api";

interface HistoricalOverviewProps {
  ticker: string;
}

type RangeOption = "7D" | "30D" | "90D" | "1Y" | "MAX";

export function HistoricalOverview({ ticker }: HistoricalOverviewProps) {
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeOption>("90D");

  useEffect(() => {
    let mounted = true;
    if (!ticker) return;
    setLoading(true);
    setError(null);

    getHistoricalData(ticker, 1000)
      .then((res) => {
        if (mounted) {
          setRecords(res.records || []);
        }
      })
      .catch((err: any) => {
        if (mounted) {
          setError(err.message || "Historical price data is currently unavailable.");
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
      {/* Title & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Where Has This Coin Been?</span>
          </h2>
          <p className="text-xs text-slate-400">
            Historical daily price movement and telemetry for {ticker}
          </p>
        </div>

        {/* Range Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(["7D", "30D", "90D", "1Y", "MAX"] as RangeOption[]).map((opt) => (
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

      {/* Chart Display */}
      {loading ? (
        <div className="h-72 flex items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading historical price chart data...</span>
          </div>
        </div>
      ) : error || records.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800 p-6 text-center space-y-2">
          <span className="text-sm font-semibold text-slate-300">Historical Data Unavailable</span>
          <p className="text-xs text-slate-500 max-w-md">
            {error || `Historical price telemetry is currently unavailable for ${ticker}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="homeChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
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
                          {item.volume ? (
                            <div className="text-[11px] text-slate-400">
                              Volume: ${new Intl.NumberFormat("en-US", { notation: "compact" }).format(item.volume)}
                            </div>
                          ) : null}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#homeChartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Days Note */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>This cryptocurrency has {records.length} days of available historical data.</span>
          </div>
        </div>
      )}
    </Card>
  );
}
