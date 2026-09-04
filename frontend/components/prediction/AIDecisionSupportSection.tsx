"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoDecisionResponse } from "@/lib/api";

interface AIDecisionSupportSectionProps {
  ticker: string;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function AIDecisionSupportSection({
  ticker,
  decisionData,
  loading,
}: AIDecisionSupportSectionProps) {
  const isAvailable = decisionData && decisionData.decision && decisionData.decision !== "UNAVAILABLE";
  const rawDecision = decisionData?.decision || "UNAVAILABLE";
  const decisionScore = Math.round(decisionData?.decision_score ?? 70);
  const supportingFactors = decisionData?.supporting_factors || [];
  const riskFactors = decisionData?.risk_factors || [];

  // Map backend decision signal presentation terminology cleanly
  const getSignalBadge = (dec: string) => {
    switch (dec.toUpperCase()) {
      case "BUY":
      case "CONSIDER":
        return {
          label: "CONSIDER",
          bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
        };
      case "HOLD":
      case "WAIT":
        return {
          label: "WAIT",
          bg: "bg-amber-500/15 border-amber-500/40 text-amber-400",
        };
      case "AVOID":
        return {
          label: "AVOID",
          bg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
        };
      default:
        return {
          label: "UNAVAILABLE",
          bg: "bg-slate-800 border-slate-700 text-slate-400",
        };
    }
  };

  const badgeStyle = getSignalBadge(rawDecision);

  return (
    <Card variant="gradient" className="space-y-6 border-indigo-500/40 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
            Decision Support Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">AI DECISION SUPPORT</h2>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Decision Score</span>
            <span className="text-lg font-extrabold font-mono text-white">{decisionScore} / 100</span>
          </div>

          <span
            className={`px-4 py-1.5 rounded-xl text-sm font-mono font-extrabold border uppercase shadow-lg ${badgeStyle.bg}`}
          >
            {badgeStyle.label}
          </span>
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
            <h3 className="text-sm font-bold text-slate-200">AI Signal Unavailable</h3>
          </div>
          <p className="text-xs text-slate-400">
            The decision-support engine has not generated a decision signal for {ticker} yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Notice clarifying decision score */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              This is an AI decision-support evaluation score ({decisionScore}/100) based on model performance, confidence, and volatility. It is NOT a financial profit guarantee.
            </span>
          </div>

          {/* WHY THIS SIGNAL? */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              WHY THIS SIGNAL?
            </h3>

            {/* Dynamic One-Sentence Summary (Part 4) */}
            {decisionData?.signal_summary && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed font-medium">
                {decisionData.signal_summary}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WHAT SUPPORTS THIS SIGNAL (Part 3) */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>What Supports This Signal</span>
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
                  <span className="text-xs text-slate-500">No major positive factors registered.</span>
                )}
              </div>

              {/* WHAT COULD GO WRONG (Part 3) */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>What Could Go Wrong</span>
                </span>
                {riskFactors.length > 0 ? (
                  <ul className="space-y-2 text-xs text-slate-300">
                    {riskFactors.map((risk, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-400 font-bold shrink-0">⚠</span>
                        <span className="leading-relaxed">{risk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-slate-500">No major risk factors registered.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
