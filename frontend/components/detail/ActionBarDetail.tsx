"use client";

import React from "react";
import Link from "next/link";
import { BarChart2, Cpu } from "lucide-react";
import { Card } from "@/components/common/Card";

interface ActionBarDetailProps {
  ticker: string;
  cryptoName: string;
}

export function ActionBarDetail({ ticker, cryptoName }: ActionBarDetailProps) {
  return (
    <Card variant="gradient" className="p-6 sm:p-8 space-y-6 border-blue-500/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Ready to Go Deeper?</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Run full AI predictions or inspect broader market analysis for {cryptoName}.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/markets"
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl text-center transition-all flex items-center justify-center space-x-2"
          >
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <span>Explore Market Analysis →</span>
          </Link>

          <Link
            href={`/prediction/${encodeURIComponent(ticker)}`}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl text-center transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2"
          >
            <Cpu className="w-4 h-4" />
            <span>Run AI Prediction →</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
