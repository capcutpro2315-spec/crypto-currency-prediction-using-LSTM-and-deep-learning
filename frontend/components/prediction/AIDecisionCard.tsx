"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Award,
  Activity,
  Sparkles,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { getDecisionSupport, CryptoDecisionResponse } from "@/lib/api";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface AIDecisionCardProps {
  ticker: string;
}

export function AIDecisionCard({ ticker }: AIDecisionCardProps) {
  const [data, setData] = useState<CryptoDecisionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecision = async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getDecisionSupport(ticker);
      setData(res);
    } catch (err: any) {
      if (err.message && (err.message.includes("404") || err.message.includes("not yet available") || err.message.includes("missing model"))) {
        setError(
          `Historical data is available, but an LSTM model has not been trained for ${ticker} yet.`
        );
      } else if (err.message && err.message.includes("Unable to retrieve")) {
        setError("Unable to retrieve historical data. Please try again.");
      } else {
        setError(err.message || "AI decision support is unavailable for this cryptocurrency.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDecision();
  }, [ticker]);

  if (loading) {
    return <LoadingState message="Calculating AI decision support, confidence score, and risk profile..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDecision} />;
  }

  if (!data) return null;

  // Signal styling helper
  const getSignalBadge = (decision: string) => {
    switch (decision.toUpperCase()) {
      case "CONSIDER":
        return {
          color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20",
          icon: "🟢",
          text: "CONSIDER",
        };
      case "AVOID":
        return {
          color: "bg-red-500/20 text-red-300 border-red-500/50 shadow-red-500/20",
          icon: "🔴",
          text: "AVOID",
        };
      case "WAIT":
      default:
        return {
          color: "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20",
          icon: "🟡",
          text: "WAIT / CAUTIOUS",
        };
    }
  };

  const signal = getSignalBadge(data.decision);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-950 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Academic Decision Support Engine
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">AI Decision Support Signal</h2>
        </div>

        {/* Prominent Signal Badge */}
        <div
          className={`inline-flex items-center space-x-2.5 px-5 py-2.5 rounded-2xl border font-black tracking-wider text-base sm:text-lg shadow-lg backdrop-blur-md self-start sm:self-auto ${signal.color}`}
        >
          <span className="text-xl">{signal.icon}</span>
          <span>{signal.text}</span>
        </div>
      </div>

      {/* Decision Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {/* Decision Score */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
          <span className="text-xs text-gray-400 font-medium block mb-1">Decision Score</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {data.decision_score.toFixed(0)} <span className="text-sm font-normal text-gray-400">/ 100</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Weighted AI Decision Index</span>
        </div>

        {/* Model Confidence */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
          <span className="text-xs text-gray-400 font-medium flex items-center justify-between mb-1">
            <span>Model Confidence</span>
            <HelpCircle className="w-3.5 h-3.5 text-gray-500 cursor-help" />
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">
            {data.confidence_score !== null ? `${data.confidence_score.toFixed(0)} / 100` : "N/A"}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            {data.confidence_label} (based on test error)
          </span>
        </div>

        {/* Risk Level */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
          <span className="text-xs text-gray-400 font-medium block mb-1">Risk Profile</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
            {data.risk_label}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Volatility: {data.volatility !== null ? `${data.volatility.toFixed(2)}%` : "N/A"} ({data.volatility_label})
          </span>
        </div>

        {/* Expected Price Change */}
        <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-xl">
          <span className="text-xs text-gray-400 font-medium block mb-1">Expected Change</span>
          <div
            className={`text-2xl sm:text-3xl font-extrabold ${
              data.expected_change_percent != null
                ? data.expected_change_percent >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
                : "text-gray-400"
            }`}
          >
            {data.expected_change_percent != null ? `${data.expected_change_percent >= 0 ? "+" : ""}${data.expected_change_percent.toFixed(2)}%` : "N/A"}
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">LSTM Next-Day Forecast</span>
        </div>
      </div>

      {/* Why This Signal? Dynamic Factors */}
      <div className="mt-8 pt-6 border-t border-gray-800">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Why This Signal? (Dynamic AI Rationale)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supporting Positive Factors */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Supporting Factors
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/90">
              {data.supporting_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risk Factors */}
          <div className="bg-amber-950/20 border border-amber-800/40 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Risk Factors
            </h4>
            <ul className="space-y-2 text-xs text-amber-200/90">
              {data.risk_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Prominent Educational Disclaimer */}
      <div className="mt-8 p-4 bg-gray-800/60 border border-gray-700/60 rounded-xl flex items-start space-x-3 text-xs text-gray-300">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Educational Decision Support Disclaimer:</strong> This decision support signal is generated by an algorithmic rule engine based on historical LSTM forecasting performance. Cryptocurrency markets are highly volatile. This model does not guarantee future prices or investment returns and does not constitute financial advice.
        </p>
      </div>
    </div>
  );
}
