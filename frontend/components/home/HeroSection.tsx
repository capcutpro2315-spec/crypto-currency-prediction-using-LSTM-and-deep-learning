"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { HomeCryptoSearch } from "@/components/home/HomeCryptoSearch";
import { useCrypto } from "@/lib/CryptoContext";

export function HeroSection() {
  const { selectedTicker } = useCrypto();

  return (
    <section className="py-12 sm:py-16 text-center border-b border-slate-800/60 pb-16">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Core Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Know Your Crypto <br />
          <span className="text-blue-400">Before You Decide.</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto font-normal leading-relaxed">
          Explore current market behavior, track price momentum, and evaluate AI price forecasts before making your next financial decision.
        </p>

        {/* Primary Interaction — Search Box */}
        <div className="max-w-xl mx-auto pt-4">
          <HomeCryptoSearch />
        </div>

        {/* Primary CTA Navigation */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={`/analysis/${encodeURIComponent(selectedTicker)}`}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore Market Analysis →</span>
          </Link>

          <Link
            href={`/prediction/${encodeURIComponent(selectedTicker)}`}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-800 transition-all flex items-center justify-center space-x-2"
          >
            <span>Run AI Prediction →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

