"use client";

import React from "react";
import { ShieldCheck, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoPredictionResponse } from "@/lib/api";

interface ScenarioCardsProps {
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
  }).format(val);
}

export function ScenarioCards({ ticker, prediction, loading }: ScenarioCardsProps) {
  const isAvailable = prediction?.prediction_available !== false && !!prediction?.predicted_price;
  const expectedPrice = prediction?.predicted_price;
  const expectedChange = prediction?.expected_change_percent;
  const isPos = expectedChange != null ? expectedChange >= 0 : null;

  const scenariosAvailable = prediction?.scenarios?.available === true;
  const bestCase = prediction?.scenarios?.best_case;
  const worstCase = prediction?.scenarios?.worst_case;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">What Could Happen?</h2>
        <p className="text-xs text-slate-400">
          Possible price outcomes within our statistical error bound
        </p>
      </div>

      <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl p-6 sm:p-8 space-y-8">
        {loading ? (
          <div className="h-32 bg-slate-900 animate-pulse rounded-xl" />
        ) : !isAvailable ? (
          <div className="text-sm font-medium text-slate-400 py-4 text-center">
            Scenario range analysis unavailable for this asset.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unified Vertical Continuum Spectrum */}
            <div className="relative pl-6 sm:pl-10 space-y-8 border-l-2 border-slate-800">
              {/* 1. BEST CASE */}
              <div className="relative flex items-center justify-between gap-4">
                <div className="absolute -left-[31px] sm:-left-[47px] w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-500" />
                <div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider block">
                    Best Case (Upper Bound)
                  </span>
                  <span className="text-xs text-slate-400">Favorable volatility outcome</span>
                </div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {scenariosAvailable && bestCase != null ? formatPrice(bestCase) : "N/A"}
                </div>
              </div>

              {/* 2. EXPECTED FORECAST (PRIMARY EMPHASIS ●) */}
              <div className="relative flex items-center justify-between gap-4 py-3 px-4 bg-[#090d16] rounded-xl border border-blue-500/30">
                <div className="absolute -left-[39px] sm:-left-[55px] w-6 h-6 rounded-full bg-blue-600 border-4 border-[#0d1322] shadow-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                      Expected Central Forecast
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Baseline
                    </span>
                  </div>
                  <span className="text-xs text-slate-300">Central neural forecast</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-extrabold text-white">
                    {formatPrice(expectedPrice)}
                  </div>
                  {expectedChange != null && (
                    <div className={`text-xs font-mono font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                      {isPos ? "+" : ""}{expectedChange.toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>

              {/* 3. WORST CASE */}
              <div className="relative flex items-center justify-between gap-4">
                <div className="absolute -left-[31px] sm:-left-[47px] w-4 h-4 rounded-full bg-slate-900 border-2 border-rose-500" />
                <div>
                  <span className="text-xs font-mono font-semibold text-rose-400 uppercase tracking-wider block">
                    Worst Case (Lower Bound)
                  </span>
                  <span className="text-xs text-slate-400">Conservative downside outcome</span>
                </div>
                <div className="text-lg font-mono font-bold text-rose-400">
                  {scenariosAvailable && worstCase != null ? formatPrice(worstCase) : "N/A"}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800/60 flex items-center justify-between">
              <span>Upper/lower bounds calculated using test-set error volatility band (±1.25 RMSE).</span>
              <span className="italic">Scenarios represent possibilities, not guarantees.</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

