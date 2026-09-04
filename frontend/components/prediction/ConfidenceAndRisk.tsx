"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoDecisionResponse } from "@/lib/api";

interface ConfidenceAndRiskProps {
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function ConfidenceAndRisk({ decisionData, loading }: ConfidenceAndRiskProps) {
  // Confidence score from backend or calculation
  const rawScore = decisionData?.confidence_score ?? 75;
  const scoreInt = Math.round(rawScore);

  let confLabel: "HIGH" | "MODERATE" | "LOW" = "MODERATE";
  if (scoreInt >= 80) confLabel = "HIGH";
  else if (scoreInt < 60) confLabel = "LOW";

  // Market risk from backend decision support
  let riskLabel = decisionData?.risk_label ? decisionData.risk_label.toUpperCase() : "MEDIUM";
  if (riskLabel.includes("LOW")) riskLabel = "LOW";
  else if (riskLabel.includes("HIGH") || riskLabel.includes("ELEVATED")) riskLabel = "HIGH";
  else riskLabel = "MEDIUM";

  let riskExplanation = "Standard cryptocurrency volatility risk applies.";
  if (riskLabel === "HIGH") {
    riskExplanation = "Recent price volatility indicates that significant price movements may occur in either direction.";
  } else if (riskLabel === "LOW") {
    riskExplanation = "Low daily price volatility relative to broader crypto market assets.";
  }

  const getRiskStyle = (r: string) => {
    switch (r) {
      case "LOW":
        return "bg-emerald-500/15 border-emerald-500/40 text-emerald-400";
      case "HIGH":
        return "bg-rose-500/15 border-rose-500/40 text-rose-400";
      default:
        return "bg-amber-500/15 border-amber-500/40 text-amber-400";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* CARD 1: FORECAST CONFIDENCE */}
      <Card variant="hover" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>FORECAST CONFIDENCE</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs font-mono font-bold text-blue-400">
            {confLabel}
          </span>
        </div>

        {loading ? (
          <div className="h-10 bg-slate-800 animate-pulse rounded-lg" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white font-mono">{scoreInt}</span>
              <span className="text-sm font-mono text-slate-400">/ 100</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Indicates how much confidence the system places in the current forecast based on model performance and available data. (This is an algorithmic confidence metric, NOT a probability of financial gain.)
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* CARD 2: MARKET RISK */}
      <Card variant="hover" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>MARKET RISK</span>
          </h2>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${getRiskStyle(riskLabel)}`}>
            {riskLabel} RISK
          </span>
        </div>

        {loading ? (
          <div className="h-10 bg-slate-800 animate-pulse rounded-lg" />
        ) : (
          <div className="space-y-3">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  riskLabel === "HIGH"
                    ? "w-full bg-rose-500"
                    : riskLabel === "LOW"
                    ? "w-1/3 bg-emerald-500"
                    : "w-2/3 bg-amber-500"
                }`}
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{riskExplanation}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
