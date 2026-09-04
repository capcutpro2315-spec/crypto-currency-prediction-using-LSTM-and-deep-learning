"use client";

import React from "react";
import Link from "next/link";
import { Cpu, ArrowRight, Database, LineChart, Cpu as CpuIcon, Sparkles, ShieldCheck } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

const PIPELINE_STEPS = [
  { label: "Market Data", icon: Database },
  { label: "Historical Analysis", icon: LineChart },
  { label: "Data Processing", icon: CpuIcon },
  { label: "LSTM Deep Learning", icon: Cpu },
  { label: "Future Forecast", icon: Sparkles },
  { label: "Risk Analysis", icon: ShieldCheck },
];

export function HowAIWorks() {
  return (
    <Card variant="gradient" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span>How Our AI Works</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end deep learning pipeline for quantitative time series forecasting
          </p>
        </div>

        <Button href="/about" variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
          See How the AI Works
        </Button>
      </div>

      {/* Visual Pipeline Horizontal Flow */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        {PIPELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === PIPELINE_STEPS.length - 1;
          return (
            <div key={idx} className="relative">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col items-center text-center space-y-2 hover:border-slate-700 transition-colors h-full">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-200">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
