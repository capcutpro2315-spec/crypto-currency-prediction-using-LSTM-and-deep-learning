"use client";

import React from "react";
import { AlertCircle, Zap, Globe, DollarSign, Activity } from "lucide-react";
import { Card } from "@/components/common/Card";

const CATALYSTS = [
  {
    title: "Sudden Market Volatility",
    desc: "Rapid price spikes or liquidation cascades across major exchanges.",
    icon: Zap,
  },
  {
    title: "Market Wide Movements",
    desc: "Macroeconomic shifts or systemic Bitcoin price movements impacting all altcoins.",
    icon: Globe,
  },
  {
    title: "Unexpected News & Events",
    desc: "Regulatory announcements, security events, or major adoption news.",
    icon: AlertCircle,
  },
  {
    title: "Liquidity Changes",
    desc: "Sudden shifts in order book depth or large institutional trades (whale transactions).",
    icon: DollarSign,
  },
  {
    title: "Trading Activity Shifts",
    desc: "Abrupt changes in 24 hour volume velocity or derivative market funding rates.",
    icon: Activity,
  },
];

export function WhatCouldChangeSection() {
  return (
    <Card variant="hover" className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>WHAT COULD CHANGE THIS FORECAST?</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Cryptocurrency prices can be affected by external factors outside historical price time series modeling.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {CATALYSTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
                <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
