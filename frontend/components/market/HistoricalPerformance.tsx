"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import { getHistoricalData, HistoricalRecord } from "@/lib/api";

interface HistoricalPerformanceProps {
  ticker: string;
}

interface PeriodMetric {
  label: string;
  days: number;
  changePct: number | null;
  highest: number | null;
  lowest: number | null;
  dataPoints: number;
}

function formatPrice(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val) || val === 0) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: val < 1 ? 4 : 2,
    maximumFractionDigits: val < 1 ? 6 : 2,
  }).format(val);
}

export function HistoricalPerformance({ ticker }: HistoricalPerformanceProps) {
  const [records, setRecords] = useState<HistoricalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!ticker) return;
    setLoading(true);

    getHistoricalData(ticker, 500)
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
  }, [ticker]);

  const periodMetrics = useMemo(() => {
    const periods = [
      { label: "7 Day", days: 7 },
      { label: "30 Day", days: 30 },
      { label: "90 Day", days: 90 },
      { label: "1 Year", days: 365 },
    ];

    if (!records || records.length === 0) {
      return periods.map((p) => ({
        ...p,
        changePct: null,
        highest: null,
        lowest: null,
        dataPoints: 0,
      }));
    }

    return periods.map((p) => {
      const slice = records.slice(-Math.min(p.days, records.length));
      if (slice.length < 2) {
        return {
          ...p,
          changePct: null,
          highest: null,
          lowest: null,
          dataPoints: slice.length,
        };
      }

      const firstClose = slice[0].close;
      const lastClose = slice[slice.length - 1].close;
      const changePct = ((lastClose - firstClose) / firstClose) * 100;
      const highest = Math.max(...slice.map((r) => r.high || r.close));
      const lowest = Math.min(...slice.map((r) => r.low || r.close));

      return {
        ...p,
        changePct,
        highest,
        lowest,
        dataPoints: slice.length,
      };
    });
  }, [records]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <span>Historical Performance</span>
        </h2>
        <p className="text-xs text-slate-400">
          Multi-timeframe return metrics and high/low extremes for {ticker}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {periodMetrics.map((item, idx) => {
          const isAvailable = item.changePct !== null && !isNaN(item.changePct);
          const isPos = isAvailable ? item.changePct! >= 0 : null;

          return (
            <Card key={idx} variant="hover" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                  {item.dataPoints > 0 ? `${item.dataPoints}d history` : "No history"}
                </span>
              </div>

              {loading ? (
                <div className="space-y-2 py-1">
                  <div className="h-7 w-24 bg-slate-800 animate-pulse rounded" />
                  <div className="h-4 w-full bg-slate-800 animate-pulse rounded" />
                </div>
              ) : isAvailable ? (
                <div className="space-y-2">
                  {/* Price Change % */}
                  <div
                    className={`text-2xl font-extrabold font-mono flex items-center space-x-1 ${
                      isPos ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span>
                      {isPos ? "+" : ""}
                      {item.changePct?.toFixed(2)}%
                    </span>
                  </div>

                  {/* High & Low Extremes */}
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-0.5">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        <span>High</span>
                      </span>
                      <span className="font-mono text-slate-200 font-semibold block">
                        {formatPrice(item.highest)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-0.5">
                        <ArrowDownRight className="w-3 h-3 text-rose-400" />
                        <span>Low</span>
                      </span>
                      <span className="font-mono text-slate-200 font-semibold block">
                        {formatPrice(item.lowest)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-xs font-semibold text-slate-500">
                  Unavailable (insufficient range data)
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
