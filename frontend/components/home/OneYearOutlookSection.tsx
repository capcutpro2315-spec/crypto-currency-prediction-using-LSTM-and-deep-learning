"use client";

import { useState, useEffect } from "react";
import { Calculator, TrendingUp, TrendingDown, ShieldAlert, DollarSign } from "lucide-react";
import { getPrediction, CryptoPredictionResponse } from "@/lib/api";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useCrypto } from "@/lib/CryptoContext";

const PRESET_AMOUNTS = [1000, 5000, 10000, 50000];

export function OneYearOutlookSection() {
  const { selectedTicker } = useCrypto();
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);

  const [prediction, setPrediction] = useState<CryptoPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedTicker) return;

    let mounted = true;
    setLoading(true);

    getPrediction(selectedTicker)
      .then((res) => {
        if (mounted) setPrediction(res);
      })
      .catch(() => {
        if (mounted) setPrediction(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedTicker]);

  // Derived 1-year projections based on daily forecast direction & historical bounds
  const hasData = prediction && prediction.expected_change_percent != null;
  const expectedChange = prediction?.expected_change_percent ?? 0;
  // Scenario projections:
  // Base Case: Extrapolated daily momentum bounded reasonably
  const baseReturnPct = hasData ? Math.min(Math.max(expectedChange * 12, -35), 65) : 0;
  // Bull Case: Favorable trend continuation
  const bullReturnPct = hasData ? Math.max(baseReturnPct + 25, 15) : 0;
  // Bear Case: Adverse market contraction
  const bearReturnPct = hasData ? Math.min(baseReturnPct - 25, -15) : 0;

  const calculateScenario = (pct: number) => {
    const projectedValue = investmentAmount * (1 + pct / 100);
    const profitLoss = projectedValue - investmentAmount;
    return { projectedValue, profitLoss, returnPct: pct };
  };

  const bearCase = calculateScenario(bearReturnPct);
  const baseCase = calculateScenario(baseReturnPct);
  const bullCase = calculateScenario(bullReturnPct);

  return (
    <Card variant="default" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Badge variant="neutral" size="sm" icon={<Calculator className="w-3.5 h-3.5" />}>
            SCENARIO-BASED MODELING
          </Badge>
          <h3 className="text-2xl font-extrabold text-white mt-1">1-YEAR INVESTMENT OUTLOOK PREVIEW</h3>
          <p className="text-xs text-slate-400">
            Simulated 1-year potential scenarios for {prediction?.cryptocurrency || selectedTicker} based on Neural Network momentum extrapolation.
          </p>
        </div>

        {/* Investment Amount Calculator Controls */}
        <div className="flex flex-col space-y-1.5 self-start sm:self-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Simulated Amount ($)</span>
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setInvestmentAmount(amt)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                  investmentAmount === amt
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                ${amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Breakdown Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading 1-year scenario outlook...</div>
      ) : hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BEAR CASE */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1">
                <TrendingDown className="w-4 h-4" />
                <span>Bear Case</span>
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">{bearCase.returnPct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Potential Value</span>
              <span className="text-2xl font-extrabold text-white">${bearCase.projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between">
              <span>Potential Profit/Loss</span>
              <span className="font-mono text-rose-400">-${Math.abs(bearCase.profitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* BASE CASE */}
          <div className="bg-slate-950/90 border border-blue-500/30 rounded-2xl p-5 space-y-3 shadow-lg shadow-blue-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Base Case</span>
              </span>
              <span className={`text-xs font-mono font-bold ${baseCase.returnPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {baseCase.returnPct >= 0 ? "+" : ""}{baseCase.returnPct.toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Potential Value</span>
              <span className="text-2xl font-extrabold text-white">${baseCase.projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between">
              <span>Potential Profit/Loss</span>
              <span className={`font-mono ${baseCase.profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {baseCase.profitLoss >= 0 ? "+" : ""}${baseCase.profitLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* BULL CASE */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Bull Case</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">+{bullCase.returnPct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Potential Value</span>
              <span className="text-2xl font-extrabold text-white">${bullCase.projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex justify-between">
              <span>Potential Profit/Loss</span>
              <span className="font-mono text-emerald-400">+${bullCase.profitLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl text-center space-y-2">
          <ShieldAlert className="w-6 h-6 text-amber-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">LONG-TERM OUTLOOK UNAVAILABLE</p>
          <p className="text-xs text-slate-500">Not enough forecasting information is currently available to model a long-term scenario outlook for {selectedTicker}.</p>
        </div>
      )}

      {/* Uncertainty Notice */}
      <p className="text-[11px] text-slate-500 text-center italic">
        * 1-Year scenarios are statistical projections derived from daily forecast trends for informational modeling purposes. They are NOT guaranteed prices or returns.
      </p>
    </Card>
  );
}
