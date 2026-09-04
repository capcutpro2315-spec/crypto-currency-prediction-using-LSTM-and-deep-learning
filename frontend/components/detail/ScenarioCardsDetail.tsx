"use client";

import React from "react";
import { ShieldCheck, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoPredictionResponse } from "@/lib/api";

interface ScenarioCardsDetailProps {
  ticker: string;
  prediction: CryptoPredictionResponse | null;
  loading: boolean;
}

function formatPrice(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: val < 1 ? 4 : 2,
    maximumFractionDigits: val < 1 ? 6 : 2,
  }).format(val);
}

export function ScenarioCardsDetail({ ticker, prediction, loading }: ScenarioCardsDetailProps) {
  const isAvailable = prediction?.prediction_available !== false && !!prediction?.predicted_price;
  const expectedPrice = prediction?.predicted_price;
  const expectedChange = prediction?.expected_change_percent;
  const isPos = expectedChange != null ? expectedChange >= 0 : null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>What Could Happen?</span>
        </h2>
        <p className="text-xs text-slate-400">
          Possible future scenarios based on model confidence bounds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: BEST CASE */}
        <Card variant="hover" className="space-y-3 relative overflow-hidden border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>BEST CASE</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Optimistic
            </span>
          </div>

          <div className="py-2 space-y-1">
            <div className="text-sm font-bold text-slate-300">
              Scenario analysis unavailable
            </div>
            <p className="text-xs text-slate-400">
              Favorable conditions support the stronger outcome.
            </p>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Requires distribution interval extensions.
          </div>
        </Card>

        {/* CARD 2: EXPECTED */}
        <Card variant="gradient" className="space-y-3 relative overflow-hidden border-blue-500/40 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>EXPECTED</span>
            </span>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Central Forecast
            </span>
          </div>

          {loading ? (
            <div className="h-14 bg-slate-800 animate-pulse rounded-lg" />
          ) : isAvailable ? (
            <div className="py-1 space-y-1">
              <div className="text-2xl font-extrabold text-white font-mono">
                {formatPrice(expectedPrice)}
              </div>
              <div
                className={`text-xs font-bold font-mono ${
                  isPos ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                Expected Change: {isPos ? "+" : ""}
                {expectedChange?.toFixed(2)}%
              </div>
            </div>
          ) : (
            <div className="text-sm font-bold text-slate-400 py-2">
              Model prediction unavailable
            </div>
          )}

          <p className="text-xs text-slate-300">
            Central forecast from the current analysis.
          </p>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Baseline expected outcome.
          </div>
        </Card>

        {/* CARD 3: WORST CASE */}
        <Card variant="hover" className="space-y-3 relative overflow-hidden border-rose-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center space-x-1">
              <TrendingDown className="w-4 h-4" />
              <span>WORST CASE</span>
            </span>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Downside
            </span>
          </div>

          <div className="py-2 space-y-1">
            <div className="text-sm font-bold text-slate-300">
              Scenario analysis unavailable
            </div>
            <p className="text-xs text-slate-400">
              Unfavorable conditions lead to the weaker outcome.
            </p>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Requires distribution interval extensions.
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-400 text-center italic">
        These are possible scenarios, not guaranteed outcomes.
      </p>
    </section>
  );
}
