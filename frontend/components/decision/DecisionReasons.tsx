"use client";

import { CheckCircle2, ShieldAlert } from "lucide-react";

interface DecisionReasonsProps {
  supportingFactors?: string[];
  riskFactors?: string[];
}

export function DecisionReasons({ supportingFactors = [], riskFactors = [] }: DecisionReasonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Supporting Reasons */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Supporting Factors (Favorable Indicators)</span>
        </div>
        {supportingFactors.length > 0 ? (
          <ul className="space-y-2 text-xs text-slate-300">
            {supportingFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">No strong positive indicators recorded for current market context.</p>
        )}
      </div>

      {/* Risk Factors */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Risk Factors & Market Hazards</span>
        </div>
        {riskFactors.length > 0 ? (
          <ul className="space-y-2 text-xs text-slate-300">
            {riskFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-amber-500 font-bold">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 italic">Standard market volatility conditions apply.</p>
        )}
      </div>
    </div>
  );
}
