"use client";

import React from "react";
import { Activity, Flame, Zap, ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface MarketBehaviorDetailProps {
  ticker: string;
  cryptoName: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
  loading: boolean;
}

export function MarketBehaviorDetail({
  ticker,
  cryptoName,
  liveData,
  marketSummary,
  decisionData,
  loading,
}: MarketBehaviorDetailProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;
  const volume24h = liveData?.volume ?? marketSummary?.volume_24h;

  // 1. Momentum
  let momentum: "Strong" | "Moderate" | "Weak" | "Unavailable" = "Unavailable";
  let momentumExplanation = "Momentum data is currently unavailable.";
  if (change24h != null) {
    const absC = Math.abs(change24h);
    if (absC >= 4.0) {
      momentum = "Strong";
      momentumExplanation = "Price is moving with strong velocity over recent hours.";
    } else if (absC >= 1.5) {
      momentum = "Moderate";
      momentumExplanation = "Price is moving with steady, moderate trading velocity.";
    } else {
      momentum = "Weak";
      momentumExplanation = "Price velocity is relatively low and sideways.";
    }
  }

  // 2. Volatility
  let volatility: "Low" | "Medium" | "High" | "Unavailable" = "Unavailable";
  let volatilityExplanation = "Volatility telemetry is currently unavailable.";
  if (decisionData?.volatility_label) {
    const v = decisionData.volatility_label.toLowerCase();
    if (v.includes("low")) {
      volatility = "Low";
      volatilityExplanation = "Price fluctuations remain narrow and contained.";
    } else if (v.includes("high") || v.includes("elevated")) {
      volatility = "High";
      volatilityExplanation = "Price has been moving sharply over the selected period.";
    } else {
      volatility = "Medium";
      volatilityExplanation = "Standard cryptocurrency market volatility observed.";
    }
  } else if (change24h != null) {
    const absC = Math.abs(change24h);
    if (absC >= 5.0) {
      volatility = "High";
      volatilityExplanation = "Price has been moving sharply over the selected period.";
    } else if (absC >= 2.0) {
      volatility = "Medium";
      volatilityExplanation = "Standard cryptocurrency market volatility observed.";
    } else {
      volatility = "Low";
      volatilityExplanation = "Price fluctuations remain narrow and contained.";
    }
  }

  // 3. Trading Activity
  let activity: "Low" | "Normal" | "High" | "Unavailable" = "Unavailable";
  let activityExplanation = "Trading turnover telemetry is currently unavailable.";
  if (volume24h != null && volume24h > 0) {
    if (volume24h > 1000000000) {
      activity = "High";
      activityExplanation = "Heavy trading volume indicating strong market participation.";
    } else if (volume24h > 10000000) {
      activity = "Normal";
      activityExplanation = "Average daily volume with balanced buyer and seller activity.";
    } else {
      activity = "Low";
      activityExplanation = "Light trading activity over recent 24-hour window.";
    }
  } else if (change24h != null) {
    activity = Math.abs(change24h) > 3.0 ? "High" : "Normal";
    activityExplanation = "Trading turnover consistent with current price action.";
  }

  // 4. Recent Trend
  let trend: "Upward" | "Sideways" | "Downward" | "Unavailable" = "Unavailable";
  let trendExplanation = "Price trend telemetry is currently unavailable.";
  if (change24h != null) {
    if (change24h > 0.5) {
      trend = "Upward";
      trendExplanation = "Higher highs and bullish short-term direction observed.";
    } else if (change24h < -0.5) {
      trend = "Downward";
      trendExplanation = "Lower lows and selling pressure dominating recent direction.";
    } else {
      trend = "Sideways";
      trendExplanation = "Consolidating within a narrow price range.";
    }
  }

  const items = [
    {
      title: "MOMENTUM",
      value: momentum,
      icon: Zap,
      iconColor: "text-blue-400 bg-blue-500/10",
      explanation: momentumExplanation,
    },
    {
      title: "VOLATILITY",
      value: volatility,
      icon: ShieldAlert,
      iconColor: volatility === "High" ? "text-rose-400 bg-rose-500/10" : "text-amber-400 bg-amber-500/10",
      explanation: volatilityExplanation,
    },
    {
      title: "TRADING ACTIVITY",
      value: activity,
      icon: Activity,
      iconColor: "text-emerald-400 bg-emerald-500/10",
      explanation: activityExplanation,
    },
    {
      title: "RECENT TREND",
      value: trend,
      icon: Flame,
      iconColor: trend === "Upward" ? "text-emerald-400 bg-emerald-500/10" : trend === "Downward" ? "text-rose-400 bg-rose-500/10" : "text-blue-400 bg-blue-500/10",
      explanation: trendExplanation,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>How Has It Been Behaving?</span>
        </h2>
        <p className="text-xs text-slate-400">Behavioral metrics calculated from current telemetry</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} variant="hover" className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{item.title}</span>
                    <div className={`p-1.5 rounded-lg ${item.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg font-extrabold text-white font-mono">{item.value}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                  &quot;{item.explanation}&quot;
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
