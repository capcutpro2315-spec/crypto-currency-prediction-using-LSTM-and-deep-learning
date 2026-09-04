"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export function PredictionDisclaimer() {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 backdrop-blur-md space-y-2">
      <div className="flex items-center space-x-2 text-slate-400">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Educational & Decision-Support Disclaimer
        </h3>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        AI-generated forecasts are estimates based on available historical and market data. Cryptocurrency markets are highly volatile, and actual prices may differ significantly. This platform provides educational decision support and does not guarantee investment returns.
      </p>
    </div>
  );
}
