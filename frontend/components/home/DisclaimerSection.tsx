"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export function DisclaimerSection() {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 backdrop-blur-md space-y-2">
      <div className="flex items-center space-x-2 text-slate-400">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Important Disclaimer
        </h3>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        Cryptocurrency markets are highly volatile. AI-generated forecasts are estimates based on available market and historical data and do not guarantee future prices or investment returns. This platform is intended for educational and decision-support purposes and does not provide personalized financial advice.
      </p>
    </div>
  );
}

