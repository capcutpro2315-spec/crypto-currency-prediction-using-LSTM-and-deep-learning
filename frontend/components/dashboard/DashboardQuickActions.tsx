"use client";

import React from "react";
import Link from "next/link";
import { BarChart2, Cpu, Compass, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/common/Card";

interface DashboardQuickActionsProps {
  selectedTicker: string;
}

export function DashboardQuickActions({ selectedTicker }: DashboardQuickActionsProps) {
  const currentAsset = selectedTicker || "BTC-USD";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: EXPLORE MARKET */}
        <Card variant="hover" className="space-y-4 flex flex-col justify-between border-blue-500/30">
          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 w-fit">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">EXPLORE MARKET</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              See current cryptocurrency market conditions, volume trends, and historical price movements.
            </p>
          </div>

          <Link
            href={`/analysis/${encodeURIComponent(currentAsset)}`}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <span>Market Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>

        {/* CARD 2: AI PREDICTION */}
        <Card variant="gradient" className="space-y-4 flex flex-col justify-between border-emerald-500/40 shadow-xl">
          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">AI PREDICTION</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore deep-learning next-day forecasts, confidence metrics, and AI decision-support signals.
            </p>
          </div>

          <Link
            href={`/prediction/${encodeURIComponent(currentAsset)}`}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <span>Run AI Prediction</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>

        {/* CARD 3: EXPLORE CRYPTO */}
        <Card variant="hover" className="space-y-4 flex flex-col justify-between border-indigo-500/30">
          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">EXPLORE CRYPTO</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Search and filter across the dynamic cryptocurrency catalog to analyze asset telemetry.
            </p>
          </div>

          <Link
            href="/markets"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <span>Explore Coins</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* SECTION 11: DATA FRESHNESS DISCLOSURE */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong className="text-slate-300">Data Freshness:</strong> Live market data refreshes approximately every 60 seconds. Historical OHLCV datasets are compiled daily. Deep-learning LSTM models execute inference on clean sequence windows without continuous minute-by-minute retraining.
          </span>
        </div>
      </div>
    </div>
  );
}
