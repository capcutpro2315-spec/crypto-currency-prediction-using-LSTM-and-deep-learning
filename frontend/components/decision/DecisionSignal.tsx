"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, XCircle, Info } from "lucide-react";
import { Badge } from "@/components/common/Badge";

interface DecisionSignalProps {
  decision: "CONSIDER" | "WAIT" | "AVOID" | "UNAVAILABLE" | string;
  decisionScore?: number;
  confidenceScore?: number | null;
  riskLabel?: string;
  expectedChange?: number | null;
}

export function DecisionSignal({
  decision,
  decisionScore = 50,
  confidenceScore,
  riskLabel = "LOW",
  expectedChange,
}: DecisionSignalProps) {
  const getSignalConfig = (signal: string) => {
    switch (signal.toUpperCase()) {
      case "CONSIDER":
        return {
          title: "FAVORABLE / CONSIDER",
          description: "Positive AI forecast backed by acceptable test confidence and manageable market volatility.",
          badgeVariant: "success" as const,
          icon: ShieldCheck,
          bgClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        };
      case "AVOID":
        return {
          title: "HIGH RISK / AVOID",
          description: "Unfavorable forecast, high historical volatility, or low model confidence.",
          badgeVariant: "danger" as const,
          icon: XCircle,
          bgClass: "bg-rose-500/10 border-rose-500/30 text-rose-400",
        };
      case "WAIT":
      default:
        return {
          title: "WAIT / CAUTIOUS",
          description: "Neutral forecast, elevated volatility, or moderate model confidence suggesting caution.",
          badgeVariant: "warning" as const,
          icon: AlertTriangle,
          bgClass: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        };
    }
  };

  const config = getSignalConfig(decision);
  const Icon = config.icon;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            AI Investment Support Signal
          </span>
          <div className="flex items-center space-x-3 mt-1">
            <div className={`p-2 rounded-xl border ${config.bgClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{config.title}</h2>
          </div>
        </div>

        <Badge variant={config.badgeVariant} size="md">
          {decision}
        </Badge>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">{config.description}</p>

      {/* Decision Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-500 block text-[10px]">Decision Index Score</span>
          <span className="text-lg font-bold text-white">{decisionScore} / 100</span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-500 block text-[10px]">Model Confidence</span>
          <span className="text-lg font-bold text-slate-200">
            {confidenceScore !== undefined && confidenceScore !== null
              ? `${Math.round(confidenceScore)} / 100`
              : "N/A"}
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-500 block text-[10px]">Risk Profile</span>
          <span className={`text-lg font-bold ${riskLabel === "HIGH" ? "text-rose-400" : riskLabel === "MODERATE" ? "text-amber-400" : "text-emerald-400"}`}>
            {riskLabel}
          </span>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <span className="text-slate-500 block text-[10px]">Expected 24h Change</span>
          <span className={`text-lg font-bold ${expectedChange && expectedChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {expectedChange !== undefined && expectedChange !== null
              ? `${expectedChange >= 0 ? "+" : ""}${expectedChange.toFixed(2)}%`
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
