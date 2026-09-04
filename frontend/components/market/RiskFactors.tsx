"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoDecisionResponse, LiveMarketData, MarketSummaryResponse } from "@/lib/api";

interface RiskFactorsProps {
  ticker: string;
  decisionData: CryptoDecisionResponse | null;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  loading: boolean;
}

export function RiskFactors({
  ticker,
  decisionData,
  liveData,
  marketSummary,
  loading,
}: RiskFactorsProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;

  const risks: string[] = [];

  if (decisionData?.risk_factors && decisionData.risk_factors.length > 0) {
    risks.push(...decisionData.risk_factors);
  } else {
    if (change24h !== undefined && change24h !== null && Math.abs(change24h) > 4) {
      risks.push(`Elevated 24-hour price volatility (${change24h > 0 ? "+" : ""}${change24h.toFixed(2)}%).`);
    }
    risks.push("Cryptocurrency markets are subject to sudden macroeconomic shocks and liquidity swings.");
  }

  return (
    <Card variant="hover" className="space-y-4 border-amber-500/30">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Risk Factors</h2>
          <p className="text-xs text-slate-400">Key risk disclosures and market warnings for {ticker}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 py-2">
          <div className="h-4 w-3/4 bg-slate-800 animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-slate-800 animate-pulse rounded" />
        </div>
      ) : (
        <ul className="space-y-2.5">
          {risks.map((risk, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-200">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠</span>
              <span className="leading-relaxed">{risk}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
