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
        badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
      };
    }
    if (d === "WAIT" || d === "HOLD") {
      return {
        label: "HOLD",
        badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
      };
    }
    if (d === "AVOID") {
      return {
        label: "AVOID",
        badge: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
      };
    }
    return {
      label: "UNAVAILABLE",
      badge: "bg-slate-800 text-slate-400 border border-slate-700",
    };
  };

  const signalStyle = getMappedSignal(rawDecision);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">What Does Our Analysis Say?</h2>
        <p className="text-xs text-slate-400">Algorithmic synthesis and decision support</p>
      </div>

      <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="h-32 bg-slate-900 animate-pulse rounded-xl" />
        ) : !isAvailable ? (
          <div className="text-xs text-slate-400 p-4 bg-[#090d16] rounded-lg">
            Analysis signal telemetry unavailable for {ticker}.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Prominent Signal Display (Non-Button) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090d16] p-6 rounded-xl border border-slate-800/60">
              <div className="space-y-1">
                <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                  System Signal Output
                </span>
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-1.5 rounded text-lg font-mono font-extrabold tracking-wider ${signalStyle.badge}`}>
                    {signalStyle.label}
                  </span>
                </div>
              </div>

              <div className="sm:text-right space-y-0.5">
                <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                  Model Confidence
                </span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {confidenceLabel} Confidence
                </span>
              </div>
            </div>

            {/* Why This Signal? */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                Why this signal?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* What supports this signal */}
                <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800/60 space-y-2.5">
                  <span className="text-xs font-mono font-semibold text-emerald-400 uppercase block">
                    What supports this signal?
                  </span>
                  {supportingFactors.length > 0 ? (
                    <ul className="space-y-2 text-xs text-slate-300">
                      {supportingFactors.map((factor, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold shrink-0">✓</span>
                          <span className="leading-relaxed">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No positive factors registered.</p>
                  )}
                </div>

                {/* What could go wrong */}
                <div className="bg-[#090d16] p-4 rounded-xl border border-slate-800/60 space-y-2.5">
                  <span className="text-xs font-mono font-semibold text-amber-400 uppercase block">
                    What could go wrong?
                  </span>
                  {riskFactors.length > 0 ? (
                    <ul className="space-y-2 text-xs text-slate-300">
                      {riskFactors.map((risk, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-amber-400 font-bold shrink-0">•</span>
                          <span className="leading-relaxed">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">No major risk factors registered.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

