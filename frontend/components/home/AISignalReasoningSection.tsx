"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle2, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { getDecisionSupport, CryptoDecisionResponse } from "@/lib/api";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useCrypto } from "@/lib/CryptoContext";

export function AISignalReasoningSection() {
  const { selectedTicker } = useCrypto();
  const [decision, setDecision] = useState<CryptoDecisionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedTicker) return;

    let mounted = true;
    setLoading(true);

    getDecisionSupport(selectedTicker)
      .then((res) => {
        if (mounted) setDecision(res);
      })
      .catch(() => {
        if (mounted) setDecision(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedTicker]);

  if (!decision && !loading) return null;

  const isConflicting =
    decision &&
    decision.expected_change_percent !== undefined &&
    decision.expected_change_percent !== null &&
    decision.expected_change_percent > 0 &&
    (decision.risk_label === "HIGH" || (decision.confidence_score !== null && decision.confidence_score < 65));

  return (
    <Card variant="gradient" className="space-y-6">
      {/* Signal Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">AI Decision Support Engine</span>
            <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <span>{decision?.cryptocurrency || selectedTicker}</span>
              <span className="text-sm font-mono text-slate-400 font-normal">({selectedTicker})</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-medium">Signal:</span>
          <Badge
            variant={
              decision?.decision === "CONSIDER"
                ? "success"
                : decision?.decision === "AVOID"
                ? "danger"
                : "warning"
            }
            size="md"
          >
            {decision?.decision || "WAIT / CAUTIOUS"}
          </Badge>
        </div>
      </div>

      {/* Conflicting Signal Warning Explanation (Requirement 15) */}
      {isConflicting && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs text-amber-300 flex items-start space-x-3 backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-white">Conflicting Market Risk Indicator</span>
            <p className="mt-0.5 leading-relaxed">
              Although the model forecasts a positive movement ({decision.expected_change_percent?.toFixed(2)}%), model confidence is currently limited ({decision.confidence_score ? Math.round(decision.confidence_score) : "N/A"}/100) and market volatility risk is elevated ({decision.risk_label}).
            </p>
          </div>
        </div>
      )}

      {/* EXPLANATION DIRECTLY BELOW SIGNAL (Requirement 14) */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Why This Signal? (Dynamic AI Rationale)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Positive Factors */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Supporting Factors</span>
            </span>
            {decision?.supporting_factors && decision.supporting_factors.length > 0 ? (
              <ul className="space-y-2">
                {decision.supporting_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No strong positive indicators recorded for current market context.</p>
            )}
          </div>

          {/* Risks to Consider */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="font-bold text-amber-400 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Risks to Consider</span>
            </span>
            {decision?.risk_factors && decision.risk_factors.length > 0 ? (
              <ul className="space-y-2">
                {decision.risk_factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-300">
                    <span className="text-amber-500 font-bold">⚠</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">Standard market volatility conditions apply.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
