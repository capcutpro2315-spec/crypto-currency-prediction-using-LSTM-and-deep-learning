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
    <Card variant="gradient" className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
          <LineChart className="w-5 h-5 text-blue-400" />
          <span>PRICE FORECAST</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          See how closely the AI forecast follows the coin's real historical prices.
        </p>
      </div>

      <PredictionChart ticker={ticker} />
    </Card>
  );
}
