"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, Info, Target } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoDecisionResponse } from "@/lib/api";

interface AISignalSectionProps {
  ticker: string;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function AISignalSection({ ticker, decisionData, loading }: AISignalSectionProps) {
  const isAvailable = decisionData && decisionData.decision && decisionData.decision !== "UNAVAILABLE";
  const rawDecision = decisionData?.decision || "UNAVAILABLE";
  const supportingFactors = decisionData?.supporting_factors || [];
  const riskFactors = decisionData?.risk_factors || [];
  const confidenceLabel = decisionData?.confidence_label || "Unavailable";

  // Map backend signals: CONSIDER -> BUY, WAIT -> HOLD, AVOID -> AVOID
  const getMappedSignal = (dec: string) => {
    const d = dec.toUpperCase();
    if (d === "CONSIDER" || d === "BUY") {
      return {
        label: "BUY",
        bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-emerald-950/40",
      };
    }
    if (d === "WAIT" || d === "HOLD") {
      return {
        label: "HOLD",
        bg: "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-amber-950/40",
      };
    }
    if (d === "AVOID") {
      return {
        label: "AVOID",
        bg: "bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-950/40",
      };
    }
    return {
      label: "UNAVAILABLE",
      bg: "bg-slate-800 border-slate-700 text-slate-400",
    };
  };

  const signalStyle = getMappedSignal(rawDecision);

  return (
    <Card variant="gradient" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span>What Does Our Analysis Say?</span>
          </h2>
          <p className="text-xs text-slate-400">
            Current algorithmic analysis conclusion & rationale for {ticker}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Confidence</span>
            <span className="text-xs font-bold text-slate-300">{confidenceLabel}</span>
          </div>

          <div
            className={`px-4 py-2 rounded-xl text-sm font-mono font-extrabold uppercase border shadow-lg ${signalStyle.bg}`}
          >
            AI SIGNAL: {signalStyle.label}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800 animate-pulse">
          <div className="h-6 w-36 bg-slate-800 rounded" />
          <div className="h-4 w-full bg-slate-800 rounded" />
        </div>
      ) : !isAvailable ? (
        <div className="p-6 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400">
            <Info className="w-4 h-4 shrink-0" />
            <h3 className="text-sm font-bold text-slate-200">Analysis signal unavailable</h3>
          </div>
          <p className="text-xs text-slate-400">
            Analysis signal telemetry has not been generated for {ticker} yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Why? (Underlying Rationale)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Factors */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Positive Factors</span>
              </span>
              {supportingFactors.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-300">
                  {supportingFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-500">No positive factors registered.</span>
              )}
            </div>

            {/* Risk Factors */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Risk Factors</span>
              </span>
              {riskFactors.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-300">
                  {riskFactors.map((risk, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold shrink-0">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-500">No major risk factors registered.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

