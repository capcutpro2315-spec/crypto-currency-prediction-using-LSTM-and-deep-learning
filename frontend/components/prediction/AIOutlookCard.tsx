"use client";

import React from "react";
import { Compass, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoPredictionResponse } from "@/lib/api";

interface AIOutlookCardProps {
  prediction: CryptoPredictionResponse | null;
}

export function AIOutlookCard({ prediction }: AIOutlookCardProps) {
  const changePct = prediction?.expected_change_percent;

  let outlook: "POSITIVE" | "NEUTRAL" | "NEGATIVE" = "NEUTRAL";
  let explanation = "Our model currently expects limited price movement over the forecast horizon.";

  if (changePct !== undefined && changePct !== null) {
    if (changePct > 0.15) {
      outlook = "POSITIVE";
      explanation = "Our model currently expects upward price movement over the forecast horizon.";
    } else if (changePct < -0.15) {
      outlook = "NEGATIVE";
      explanation = "Our model currently expects downward price pressure over the forecast horizon.";
    }
  }

  const getStyle = (o: string) => {
    switch (o) {
      case "POSITIVE":
        return {
          bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
          icon: TrendingUp,
        };
      case "NEGATIVE":
        return {
          bg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
          icon: TrendingDown,
        };
      default:
        return {
          bg: "bg-blue-500/15 border-blue-500/40 text-blue-400",
          icon: Minus,
        };
    }
  };

  const style = getStyle(outlook);
  const Icon = style.icon;

  return (
    <Card variant="hover" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span>AI OUTLOOK</span>
        </h2>
        <span
          className={`px-3 py-1 rounded-xl text-xs font-mono font-extrabold uppercase border flex items-center space-x-1.5 ${style.bg}`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{outlook}</span>
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
        &quot;{explanation}&quot;
      </p>

      <span className="text-[11px] text-slate-500 block pt-1 border-t border-slate-800">
        * Reflects directional model expectation only.
      </span>
    </Card>
  );
}
