"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, X, Clock, Database } from "lucide-react";
import { Card } from "@/components/common/Card";
import {
  LiveMarketData,
  MarketSummaryResponse,
  CryptoPredictionResponse,
  CryptoDecisionResponse,
  ModelStatusResponse,
  getHistoricalData,
} from "@/lib/api";

interface DataCoverageDetailProps {
  ticker: string;
  cryptoName: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  prediction: CryptoPredictionResponse | null;
  modelStatus: ModelStatusResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function DataCoverageDetail({
  ticker,
  cryptoName,
  liveData,
  marketSummary,
  prediction,
  modelStatus,
  decisionData,
  loading,
}: DataCoverageDetailProps) {
  const [historyCount, setHistoryCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!ticker) return;

    getHistoricalData(ticker, 1000)
      .then((res) => {
        if (mounted) setHistoryCount(res.records ? res.records.length : 0);
      })
      .catch(() => {
        if (mounted) setHistoryCount(null);
      });

    return () => {
      mounted = false;
    };
  }, [ticker]);

  const hasLiveData = liveData != null || marketSummary != null;
  const hasPrediction = prediction != null && prediction.prediction_available !== false && !!prediction.predicted_price;
  const hasRisk = decisionData?.risk_label != null || decisionData?.risk_factors != null;
  const hasDecision = decisionData?.decision != null && decisionData.decision !== "UNAVAILABLE";

  const marketTimestamp = liveData?.freshness || (liveData?.timestamp ? new Date(liveData.timestamp).toLocaleString() : "Available");

  const items = [
    {
      label: "Historical Data",
      status: historyCount != null ? `${historyCount} days` : "Unavailable",
      available: historyCount != null && historyCount > 0,
    },
    {
      label: "Latest Market Data",
      status: hasLiveData ? marketTimestamp : "Unavailable",
      available: hasLiveData,
    },
    {
      label: "Prediction Available",
      status: hasPrediction ? "Yes" : modelStatus?.message ? `No (${modelStatus.message})` : "No",
      available: hasPrediction,
    },
    {
      label: "Risk Analysis",
      status: hasRisk ? "Available" : "Unavailable",
      available: hasRisk,
    },
    {
      label: "AI Signal",
      status: hasDecision ? "Available" : "Unavailable",
      available: hasDecision,
    },
  ];

  return (
    <Card variant="hover" className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">What Data Do We Have?</h2>
          <p className="text-xs text-slate-400">Telemetry transparency & available dataset coverage for {cryptoName}</p>
        </div>
      </div>

      {loading ? (
        <div className="h-32 bg-slate-900 rounded-xl animate-pulse" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                item.available
                  ? "bg-slate-950/80 border-slate-800"
                  : "bg-slate-950/40 border-slate-900 opacity-70"
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{item.label}</span>
              <div className="flex items-center space-x-1.5">
                {item.available ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
                <span className={`text-xs font-bold font-mono truncate ${item.available ? "text-white" : "text-slate-500"}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
