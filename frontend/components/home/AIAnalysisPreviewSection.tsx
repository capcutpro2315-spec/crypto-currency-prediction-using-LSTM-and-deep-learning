"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Activity, ShieldCheck, Cpu, AlertTriangle } from "lucide-react";
import { getPrediction, getDecisionSupport, CryptoPredictionResponse, CryptoDecisionResponse } from "@/lib/api";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { useCrypto } from "@/lib/CryptoContext";

export function AIAnalysisPreviewSection() {
  const { selectedTicker } = useCrypto();

  const [prediction, setPrediction] = useState<CryptoPredictionResponse | null>(null);
  const [decision, setDecision] = useState<CryptoDecisionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTicker) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([getPrediction(selectedTicker), getDecisionSupport(selectedTicker)])
      .then(([predRes, decRes]) => {
        if (!mounted) return;
        if (predRes.status === "fulfilled") setPrediction(predRes.value);
        else setPrediction(null);

        if (decRes.status === "fulfilled") setDecision(decRes.value);
        else setDecision(null);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Unable to fetch AI prediction status.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedTicker]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Badge variant="info" size="sm" icon={<Cpu className="w-3.5 h-3.5" />}>
            INTELLIGENT AI SYNTHESIS
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Your Crypto. One Intelligent View.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time synthesis combining deep-learning neural predictions, confidence metrics, and market risk profiling.
          </p>
        </div>

        <Button
          href={`/prediction/${encodeURIComponent(selectedTicker)}`}
          variant="secondary"
          size="sm"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Full Prediction Details
        </Button>
      </div>

      {loading ? (
        <Card variant="default" className="p-8 text-center text-xs text-slate-400">
          Fetching deep-learning inference & decision support for {selectedTicker}...
        </Card>
      ) : prediction || decision ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          {/* CURRENT PRICE */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-500 block text-[10px]">Current Price</span>
            <span className="text-lg font-bold text-white">
              {prediction?.current_price
                ? `$${prediction.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : decision?.current_price
                ? `$${decision.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : "N/A"}
            </span>
            <span className="text-[10px] text-slate-500 block">OHLCV Close</span>
          </div>

          {/* PREDICTED NEXT-DAY PRICE */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-500 block text-[10px]">Predicted Price</span>
            <span className="text-lg font-bold text-blue-400">
              {prediction?.predicted_price
                ? `$${prediction.predicted_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : "N/A"}
            </span>
            <span className="text-[10px] text-slate-500 block">LSTM 1-Day Forecast</span>
          </div>

          {/* EXPECTED MOVEMENT */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-500 block text-[10px]">Expected Movement</span>
            <span
              className={`text-lg font-bold ${
                prediction && prediction.expected_change_percent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {prediction
                ? `${prediction.expected_change_percent >= 0 ? "+" : ""}${prediction.expected_change_percent.toFixed(2)}%`
                : "N/A"}
            </span>
            <span className="text-[10px] text-slate-500 block">24h Projection</span>
          </div>

          {/* MODEL CONFIDENCE */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-500 block text-[10px]">Model Confidence</span>
            <span className="text-lg font-bold text-slate-200">
              {decision?.confidence_score !== undefined && decision?.confidence_score !== null
                ? `${Math.round(decision.confidence_score)} / 100`
                : "N/A"}
            </span>
            <span className="text-[10px] text-slate-500 block">Historical Accuracy</span>
          </div>

          {/* MARKET RISK */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-500 block text-[10px]">Market Risk</span>
            <span
              className={`text-lg font-bold ${
                decision?.risk_label === "HIGH"
                  ? "text-rose-400"
                  : decision?.risk_label === "MODERATE"
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {decision?.risk_label || "MODERATE"}
            </span>
            <span className="text-[10px] text-slate-500 block">Volatility Profile</span>
          </div>

          {/* AI SIGNAL */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-slate-500 block text-[10px]">AI Signal</span>
            <div className="pt-0.5">
              <Badge
                variant={
                  decision?.decision === "CONSIDER"
                    ? "success"
                    : decision?.decision === "AVOID"
                    ? "danger"
                    : "warning"
                }
                size="sm"
              >
                {decision?.decision || "WAIT"}
              </Badge>
            </div>
            <span className="text-[10px] text-slate-500 block">Synthesized Output</span>
          </div>
        </div>
      ) : (
        <Card variant="default" className="p-6 text-center text-xs text-slate-400">
          AI inference details will populate once neural network model forecast is executed.
        </Card>
      )}
    </div>
  );
}
