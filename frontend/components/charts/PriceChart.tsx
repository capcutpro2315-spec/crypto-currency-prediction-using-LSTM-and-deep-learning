"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getHistoricalData, HistoricalRecord } from "@/lib/api";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface PriceChartProps {
  ticker: string;
}

type RangeOption = "30D" | "90D" | "1Y" | "ALL";

export function PriceChart({ ticker }: PriceChartProps) {
  const [rawRecords, setRawRecords] = useState<HistoricalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeOption>("1Y");

  const fetchHistory = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getHistoricalData(ticker, 1500);
      setRawRecords(res.records);
    } catch (err: any) {
      setError(err.message || "Failed to load historical price dataset.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [ticker]);

  // Client-side range filtering
  const filteredData = useMemo(() => {
    if (rawRecords.length === 0) return [];
    let count = rawRecords.length;

    switch (range) {
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
        count = rawRecords.length;
        break;
    }

    return rawRecords.slice(-Math.min(count, rawRecords.length));
  }, [rawRecords, range]);

  if (loading) {
    return <LoadingState message="Loading historical price chart data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchHistory} />;
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Historical Closing Price</h3>
          <p className="text-xs text-gray-400">Daily closing prices in USD for {ticker}</p>
        </div>

        {/* Range Selector Tabs */}
        <div className="flex items-center space-x-1 bg-gray-800/80 p-1 rounded-xl border border-gray-700/60 self-start sm:self-auto">
          {(["30D", "90D", "1Y", "ALL"] as RangeOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setRange(opt)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                range === opt
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0d1322] border border-gray-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                      <div className="text-xs text-gray-400 font-medium mb-1">{label}</div>
                      <div className="text-sm font-bold text-blue-400">
                        Close: {formatCurrency(payload[0].value as number)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Volume: ${new Intl.NumberFormat("en-US", { notation: "compact" }).format(payload[0].payload.volume)}
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
              fill="url(#colorClose)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
