"use client";

import React, { useState, useEffect } from "react";
import { LineChart, Calendar } from "lucide-react";
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

export function DashboardMarketChart() {
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getHistoricalData("BTC-USD", 180)
      .then((res) => {
        if (mounted) setRecords(res.records || []);
      })
      .catch(() => {
        if (mounted) setRecords([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatAxisY = (val: number) => `$${(val / 1000).toFixed(0)}k`;

  return (
    <Card variant="gradient" className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <LineChart className="w-5 h-5 text-blue-400" />
          <span>Market Overview</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Benchmark historical market trajectory (BTC-USD continuous daily telemetry)
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-950/40 rounded-2xl border border-slate-800 flex items-center justify-center">
          <div className="text-xs text-slate-400">Loading benchmark market chart...</div>
        </div>
      ) : records.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-xs text-slate-500">
          Market benchmark telemetry currently unavailable.
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={records} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
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
                      <div className="bg-[#0b1120] border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <div className="text-slate-400 font-mono font-semibold">{label}</div>
                        <div className="text-sm font-extrabold text-blue-400">
                          Benchmark Rate: ${item.close.toLocaleString()}
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
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#dashboardChartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
