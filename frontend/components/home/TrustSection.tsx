"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/common/Card";

export function TrustSection() {
  return (
    <Card variant="bordered" className="p-6 border-blue-500/30 bg-blue-950/10 space-y-3">
      <div className="flex items-center space-x-3 text-blue-400 font-bold text-lg">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <h2>Built to Help You Understand, Not Promise the Future.</h2>
      </div>
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
        Cryptocurrency markets are highly volatile. Our analysis uses available market and historical data to estimate possible future movement, but actual prices can differ significantly.
      </p>
    </Card>
  );
}
