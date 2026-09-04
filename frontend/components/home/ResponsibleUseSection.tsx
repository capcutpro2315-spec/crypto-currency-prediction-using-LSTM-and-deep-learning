"use client";

import { ShieldAlert, RefreshCw, Info } from "lucide-react";
import { Badge } from "@/components/common/Badge";

export function ResponsibleUseSection() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-base">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h2>USE AI AS A DECISION SUPPORT TOOL</h2>
        </div>

        <Badge variant="neutral" size="sm" icon={<RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />}>
          Telemetry Refreshed ~60s
        </Badge>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
        Cryptocurrency markets are highly volatile. AI forecasts are built on historical pattern recognition and sequence probabilities, and can be wrong. Use this system strictly as a decision support tool, not as a guarantee of future investment returns.
      </p>

      <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-1">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Data ingested directly from remote CoinGecko & Yahoo Finance REST providers.</span>
      </div>
    </div>
  );
}
