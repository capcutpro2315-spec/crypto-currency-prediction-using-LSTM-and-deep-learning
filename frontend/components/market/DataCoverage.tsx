"use client";

import React from "react";
import { Database, CheckCircle2, AlertCircle, Clock, Server } from "lucide-react";
import { Card } from "@/components/common/Card";
import { ModelStatusResponse, LiveMarketData, MarketSummaryResponse } from "@/lib/api";

interface DataCoverageProps {
  ticker: string;
  modelStatus: ModelStatusResponse | null;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  loading: boolean;
}

export function DataCoverage({
  ticker,
  modelStatus,
  liveData,
  marketSummary,
  loading,
}: DataCoverageProps) {
  const daysAvailable = modelStatus?.available_history_days ?? marketSummary?.available_history_days ?? marketSummary?.total_trading_days ?? null;
  const source = liveData?.source || "CoinGecko / Yahoo Finance Telemetry";
  const isEligible = modelStatus?.model_available !== false && (daysAvailable === null || daysAvailable >= 60);

  const coverageNote = daysAvailable
    ? daysAvailable >= 60
      ? `${daysAvailable} days of continuous historical price telemetry available.`
      : `${daysAvailable} days of historical data available, but current coverage may be insufficient for the configured 60 day prediction model.`
    : "Historical data coverage is being compiled.";

  return (
    <Card variant="bordered" className="space-y-4">
      <div className="flex items-center space-x-2">
        <Database className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Data Coverage</h2>
      </div>

      {loading ? (
        <div className="h-12 bg-slate-800 animate-pulse rounded-xl" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Historical Data Days */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
              <Database className="w-3 h-3 text-blue-400" />
              <span>Historical Data</span>
            </span>
            <span className="font-mono text-slate-200 font-bold text-sm block">
              {daysAvailable ? `${daysAvailable} Days` : "Available"}
            </span>
          </div>

          {/* Data Source */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
              <Server className="w-3 h-3 text-indigo-400" />
              <span>Data Source</span>
            </span>
            <span className="font-mono text-slate-200 font-bold block truncate">{source}</span>
          </div>

          {/* Latest Update */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Latest Update</span>
            </span>
            <span className="font-mono text-slate-200 font-bold block">
              {liveData?.timestamp ? new Date(liveData.timestamp).toLocaleTimeString() : "Live Feed"}
            </span>
          </div>

          {/* Prediction Eligibility */}
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 uppercase flex items-center space-x-1">
              {isEligible ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-400" />
              )}
              <span>Prediction Eligibility</span>
            </span>
            <span
              className={`font-mono font-bold block ${
                isEligible ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isEligible ? "Eligible" : "Limited Coverage"}
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 italic pt-1">{coverageNote}</p>
    </Card>
  );
}
