"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoDecisionResponse, LiveMarketData, MarketSummaryResponse } from "@/lib/api";

interface RiskOverviewProps {
  ticker: string;
  decisionData: CryptoDecisionResponse | null;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  loading: boolean;
}

export function RiskOverview({
  ticker,
  decisionData,
  liveData,
  marketSummary,
  loading,
}: RiskOverviewProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "UNAVAILABLE" = "UNAVAILABLE";

  if (decisionData?.risk_label) {
    const label = decisionData.risk_label.toUpperCase();
    if (label.includes("LOW")) riskLevel = "LOW";
    else if (label.includes("HIGH") || label.includes("ELEVATED")) riskLevel = "HIGH";
    else riskLevel = "MEDIUM";
  } else if (change24h != null) {
    const absChange = Math.abs(change24h);
    if (absChange >= 5.0) riskLevel = "HIGH";
    else if (absChange >= 2.0) riskLevel = "MEDIUM";
    else riskLevel = "LOW";
  }

  const riskFactors = decisionData?.risk_factors || [];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">What Could Go Wrong?</h2>
        <p className="text-xs text-slate-400">Risk evaluation and key asset vulnerabilities</p>
      </div>

      <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-6 space-y-6">
        {loading ? (
          <div className="h-24 bg-slate-900 animate-pulse rounded-xl" />
        ) : (
          <div className="space-y-6">
            {/* Risk Level Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider block">
                  Assessed Risk Level
                </span>
                <span className="text-xs text-slate-400">Calculated from historical volatility & model penalties</span>
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-wider ${
                    riskLevel === "LOW"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : riskLevel === "HIGH"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {riskLevel} RISK
                </span>
              </div>
            </div>

            {/* Identified Risk Factors */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider block">
                Key Vulnerability Factors:
              </span>
              {riskFactors.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-300">
                  {riskFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 bg-[#090d16] p-3 rounded-lg border border-slate-800/60">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span className="leading-relaxed">{factor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 bg-[#090d16] p-3 rounded-lg border border-slate-800/60">
                  Standard cryptocurrency price volatility applies. Unexpected market events or sudden liquidity drops can cause rapid price movements.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

