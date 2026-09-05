"use client";

import React from "react";
import { LineChart } from "lucide-react";
import { Card } from "@/components/common/Card";
import { PredictionChart } from "@/components/charts/PredictionChart";

interface ForecastChartProps {
  ticker: string;
}

export function ForecastChart({ ticker }: ForecastChartProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Price Forecast</h2>
        <p className="text-xs text-slate-400 mt-1">
          See how closely the AI forecast follows the coin&apos;s real historical price movement.
        </p>
      </div>

      <PredictionChart ticker={ticker} />
    </section>
  );
}
