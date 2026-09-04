"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Cpu } from "lucide-react";

interface ExploreFutureCTAProps {
  ticker: string;
}

export function ExploreFutureCTA({ ticker }: ExploreFutureCTAProps) {
  return (
    <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/50 border border-slate-800 rounded-3xl p-8 text-center space-y-4 backdrop-blur-xl shadow-2xl">
      <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <Cpu className="w-3.5 h-3.5" />
        <span>Deep Learning Forecasting</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Explore the Future?</h2>
      <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
        Use our deep learning model to estimate possible future price movement and explore best-case, expected, and worst-case scenarios.
      </p>

      <div className="pt-2">
        <Link
          href={`/prediction/${encodeURIComponent(ticker)}`}
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-emerald-300" />
          <span>Run AI Prediction →</span>
        </Link>
      </div>
    </div>
  );
}
