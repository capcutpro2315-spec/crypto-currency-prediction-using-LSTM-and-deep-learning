"use client";

import React from "react";
import Link from "next/link";
import { BarChart2, TrendingUp, HelpCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/common/Card";

interface ExploreCardsProps {
  selectedTicker: string;
}

export function ExploreCards({ selectedTicker }: ExploreCardsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Explore More</h2>
        <p className="text-xs text-slate-400">Discover deeper market telemetry, forecasts, and project details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Market */}
        <Card variant="hover" className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 w-fit">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">MARKET</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              See what&apos;s happening across the crypto market.
            </p>
          </div>
          <Link
            href="/markets"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 pt-2 border-t border-slate-800"
          >
            <span>Explore Market →</span>
          </Link>
        </Card>

        {/* Card 2: Predictions */}
        <Card variant="hover" className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 w-fit">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">PREDICTIONS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore future price forecasts and possible scenarios.
            </p>
          </div>
          <Link
            href={`/prediction/${encodeURIComponent(selectedTicker)}`}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 pt-2 border-t border-slate-800"
          >
            <span>View Predictions →</span>
          </Link>
        </Card>

        {/* Card 3: How It Works */}
        <Card variant="hover" className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 w-fit">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">HOW IT WORKS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Learn how our cryptocurrency analysis system works.
            </p>
          </div>
          <Link
            href="/about"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 pt-2 border-t border-slate-800"
          >
            <span>How It Works →</span>
          </Link>
        </Card>
      </div>
    </section>
  );
}

