"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { HomeCryptoSearch } from "@/components/home/HomeCryptoSearch";
import { useCrypto } from "@/lib/CryptoContext";

export function HeroSection() {
  const { selectedTicker } = useCrypto();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
      {/* Background Radial Glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Core Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Know Your Crypto <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Before You Decide.
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Explore the market, understand what is happening now, and see what could happen next.
        </p>

        {/* Search & Selection Component */}
        <div className="max-w-xl mx-auto pt-2">
          <HomeCryptoSearch />
        </div>

        {/* Primary CTA & Direct Navigation */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/analysis/${encodeURIComponent(selectedTicker)}`}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <span>Explore Crypto →</span>
          </Link>

          <Link
            href={`/prediction/${encodeURIComponent(selectedTicker)}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white font-medium text-sm border border-slate-700/80 transition-all flex items-center justify-center space-x-2"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>View Prediction</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

