"use client";

import React from "react";
import { BookOpen, TrendingUp, ShieldAlert, Activity, Clock } from "lucide-react";
import { Card } from "@/components/common/Card";
import { LiveMarketData, MarketSummaryResponse, CryptoDecisionResponse } from "@/lib/api";

interface ThingsYouShouldKnowProps {
  ticker: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
  decisionData: CryptoDecisionResponse | null;
}

export function ThingsYouShouldKnow({
  ticker,
  liveData,
  marketSummary,
  decisionData,
}: ThingsYouShouldKnowProps) {
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;
  const cryptoName = liveData?.name || ticker.replace("-USD", "");
  const volatility = decisionData?.volatility_label || "Medium";

  const insights = [
    {
      title: "PRICE MOVEMENT",
      icon: TrendingUp,
      badge: change24h != null && change24h >= 0 ? "Rising Trend" : "Softening Trend",
      badgeColor: change24h != null && change24h >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10",
      description:
        change24h != null && change24h >= 0
          ? `${cryptoName} is currently experiencing upward price momentum over the last 24 hours.`
          : `${cryptoName} is currently undergoing a price pullback over recent trading hours.`,
    },
    {
      title: "MARKET VOLATILITY",
      icon: ShieldAlert,
      badge: `${volatility} Volatility`,
      badgeColor: "text-amber-400 bg-amber-500/10",
      description:
        volatility.toLowerCase().includes("high")
          ? "Prices are moving more sharply than usual. Expect wider short-term price swings."
          : "Historical price fluctuations are relatively stable relative to overall market assets.",
    },
    {
      title: "TRADING ACTIVITY",
      icon: Activity,
      badge: "Active Telemetry",
      badgeColor: "text-blue-400 bg-blue-500/10",
      description:
        "Increased trading activity reflects higher market participant engagement, which can precede larger price moves.",
    },
    {
      title: "HISTORICAL DATA LENGTH",
      icon: Clock,
      badge: "Pattern Memory",
      badgeColor: "text-indigo-400 bg-indigo-500/10",
      description:
        "Cryptocurrencies with longer price histories allow our analysis to identify more consistent time-series patterns.",
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>Things You Should Know</span>
        </h2>
        <p className="text-xs text-slate-400">
          Plain-language observations explaining current market behavior for {cryptoName}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} variant="hover" className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                  {item.title}
                </span>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.description}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
