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

  // Determine risk level
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "Risk information unavailable" = "Risk information unavailable";

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

  const getRiskStyle = (lvl: string) => {
    switch (lvl) {
      case "LOW":
        return {
          bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
          barWidth: "w-1/3 bg-emerald-500",
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-500/15 border-amber-500/40 text-amber-400",
          barWidth: "w-2/3 bg-amber-500",
        };
      case "HIGH":
        return {
          bg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
          barWidth: "w-full bg-rose-500",
        };
      default:
        return {
          bg: "bg-slate-800 border-slate-700 text-slate-400",
          barWidth: "w-0 bg-slate-700",
        };
    }
  };

  const riskStyle = getRiskStyle(riskLevel);

  return (
    <Card variant="hover" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>What Could Go Wrong?</span>
          </h2>
          <p className="text-xs text-slate-400">Risk level and key potential risk factors for {ticker}</p>
        </div>

        <span
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-extrabold border ${riskStyle.bg}`}
        >
          {riskLevel === "Risk information unavailable" ? "UNAVAILABLE" : `${riskLevel} RISK`}
        </span>
      </div>

      {loading ? (
        <div className="h-16 bg-slate-900 animate-pulse rounded-xl" />
      ) : (
        <div className="space-y-4">
          {/* Visual Risk Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Low Risk</span>
              <span>Medium Risk</span>
              <span>High Risk</span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div className={`h-full rounded-full transition-all duration-500 ${riskStyle.barWidth}`} />
            </div>
          </div>

          {/* Dynamic Risk Factors List */}
          {riskFactors.length > 0 ? (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Identified Risk Factors:
              </span>
              <div className="space-y-2">
                {riskFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Standard cryptocurrency price volatility applies. High price swings can occur.</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

