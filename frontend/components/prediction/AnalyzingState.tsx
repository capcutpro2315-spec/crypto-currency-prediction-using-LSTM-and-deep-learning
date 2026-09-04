"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Database, LineChart, Cpu, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/common/Card";

interface AnalyzingStateProps {
  cryptoName: string;
}

const STEPS = [
  { label: "Preparing Market Data", icon: Database },
  { label: "Analyzing Historical Patterns", icon: LineChart },
  { label: "Running Deep Learning Model", icon: Cpu },
  { label: "Evaluating Risk", icon: ShieldCheck },
  { label: "Preparing AI Insight", icon: Sparkles },
];

export function AnalyzingState({ cryptoName }: AnalyzingStateProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card variant="gradient" className="space-y-8 py-10 max-w-3xl mx-auto text-center border-blue-500/30">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Analyzing {cryptoName}...</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Executing Stacked LSTM deep-learning model inference and risk evaluation.
        </p>
      </div>

      {/* 5-Step Progress Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 max-w-2xl mx-auto pt-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStepIndex;
          const isDone = idx < currentStepIndex;

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border transition-all text-xs flex flex-col items-center text-center space-y-1.5 ${
                isActive
                  ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/20 ring-1 ring-blue-500/40"
                  : isDone
                  ? "bg-slate-900/90 border-slate-800 text-emerald-400"
                  : "bg-slate-950/40 border-slate-800/60 text-slate-500"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : isDone
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-slate-800 text-slate-600"
                }`}
              >
                {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className="text-[11px] font-semibold leading-tight">{step.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
