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

interface PriceJourneyProps {
  ticker: string;
}

type RangeOption = "24H" | "7D" | "30D" | "90D" | "1Y" | "ALL";

export function PriceJourney({ ticker }: PriceJourneyProps) {
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
      case "ALL":
      default:
        count = records.length;
        break;
    }
    return records.slice(-Math.min(count, records.length));
  }, [records, range]);

  // Compute Period High, Low, and Change
  const metrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;
    let high = -Infinity;
    let low = Infinity;

    filteredData.forEach((r) => {
      if (r.high && r.high > high) high = r.high;
      if (r.close && r.close > high) high = r.close;
      if (r.low && r.low < low) low = r.low;
      if (r.close && r.close < low) low = r.close;
    });

    const startPrice = filteredData[0].close;
    const currentPrice = filteredData[filteredData.length - 1].close;
    const periodChange = startPrice && startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : null;

    return {
      high: high !== -Infinity ? high : null,
      low: low !== Infinity ? low : null,
      currentPrice,
      periodChange,
    };
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
      {/* Title & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Where Has It Been?</span>
          </h2>
          <p className="text-xs text-slate-400">Historical daily price behavior telemetry</p>
        </div>

        {/* Range Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(["24H", "7D", "30D", "90D", "1Y", "ALL"] as RangeOption[]).map((opt) => (
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

      {loading ? (
        <div className="h-72 flex items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading price history...</span>
          </div>
        </div>
      ) : error || records.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800 p-6 text-center space-y-2">
          <span className="text-sm font-semibold text-slate-300">Historical Data Unavailable</span>
          <p className="text-xs text-slate-500 max-w-md">
            {error || `Historical telemetry is currently unavailable for ${ticker}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart Display */}
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="journeyChartGradient" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#journeyChartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Period Summary Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Price</span>
              <span className="font-mono font-bold text-white">
                {metrics?.currentPrice != null ? formatPriceTooltip(metrics.currentPrice) : "Unavailable"}
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Period High ({range})</span>
              <span className="font-mono font-bold text-white">
                {metrics?.high != null ? formatPriceTooltip(metrics.high) : "Unavailable"}
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Period Low ({range})</span>
              <span className="font-mono font-bold text-white">
                {metrics?.low != null ? formatPriceTooltip(metrics.low) : "Unavailable"}
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Period Change ({range})</span>
              {metrics?.periodChange != null ? (
                <span className={`font-mono font-bold ${metrics.periodChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {metrics.periodChange >= 0 ? "+" : ""}{metrics.periodChange.toFixed(2)}%
                </span>
              ) : (
                <span className="text-slate-500 font-mono">Unavailable</span>
              )}
            </div>
          </div>

          {/* Available History Length Note */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{records.length} days of historical data available.</span>
          </div>
        </div>
      )}
    </Card>
  );
}
