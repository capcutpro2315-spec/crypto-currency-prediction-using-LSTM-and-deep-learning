"use client";

import React, { useState } from "react";
import { HelpCircle, Shield, Activity, BarChart2, TrendingUp, AlertTriangle } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface MarketBehaviorProps {
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

interface BehaviorMetric {
  title: string;
  value: string;
  tooltip: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function MarketBehavior({
  ticker,
  liveData,
  marketSummary,
  decisionData,
  loading,
}: MarketBehaviorProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;

  // Derive metrics
  const volatilityVal = decisionData?.volatility_label || (change24h && Math.abs(change24h) > 5 ? "High" : "Moderate");
  const volumeVal = liveData?.volume || marketSummary?.volume_24h ? "Active Trading" : "Unavailable";
  const momentumVal = change24h !== undefined && change24h !== null ? (change24h > 1 ? "Upward" : change24h < -1 ? "Downward" : "Sideways") : "Unavailable";
  
  // Calculate drawdown if historical high is available
  let drawdownVal = "Unavailable";
  if (marketSummary?.current_price && marketSummary?.historical_high) {
    const dd = ((marketSummary.historical_high - marketSummary.current_price) / marketSummary.historical_high) * 100;
    drawdownVal = `-${dd.toFixed(1)}% from ATH`;
  }

  const recoveryVal = change24h && change24h > 0 ? "Positive Short-Term Recovery" : "Consolidating Range";

  const metrics: BehaviorMetric[] = [
    {
      title: "Price Volatility",
      value: volatilityVal,
      tooltip: "Price Volatility measures how dramatically prices swing up or down. High volatility means larger potential price shifts.",
      icon: Activity,
    },
    {
      title: "Trading Volume",
      value: volumeVal,
      tooltip: "Trading Volume indicates total market activity. High volume makes buying and selling faster and easier.",
      icon: BarChart2,
    },
    {
      title: "Recent Momentum",
      value: momentumVal,
      tooltip: "Recent Momentum shows the velocity and direction of recent price action.",
      icon: TrendingUp,
    },
    {
      title: "Max Drawdown",
      value: drawdownVal,
      tooltip: "Max Drawdown measures how far the current price has dropped from its all-time historical peak.",
      icon: AlertTriangle,
    },
    {
      title: "Recovery Trend",
      value: recoveryVal,
      tooltip: "Recovery Trend indicates whether the price is currently rebounding from recent low extremes.",
      icon: Shield,
    },
  ];

  return (
    <Card variant="gradient" className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span>How This Coin Behaves</span>
        </h2>
        <p className="text-xs text-slate-400">
          Core trading characteristics and risk behavior profile for {ticker}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            const isHovered = activeTooltip === item.title;

            return (
              <div
                key={idx}
                className="relative bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2 hover:border-slate-700 transition-colors"
                onMouseEnter={() => setActiveTooltip(item.title)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{item.title}</span>
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-blue-400 cursor-help transition-colors" />
                </div>

                <div className="text-sm font-bold text-slate-200 font-mono">{item.value}</div>

                {/* Tooltip Hover Overlay */}
                {isHovered && (
                  <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#090d16] border border-slate-700 p-3 rounded-xl shadow-2xl z-50 text-[11px] text-slate-300 leading-relaxed animate-in fade-in duration-150">
                    {item.tooltip}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
