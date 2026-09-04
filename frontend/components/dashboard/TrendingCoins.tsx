"use client";

import React from "react";
import Link from "next/link";
import { Flame, ArrowRight, Activity, Zap } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoAsset } from "@/lib/api";

interface TrendingCoinsProps {
  catalog: CryptoAsset[];
  loading: boolean;
  onSelectCrypto: (ticker: string) => void;
}

const TAGS = ["Trending", "High Volume", "High Momentum", "Active Trading"];

export function TrendingCoins({ catalog, loading, onSelectCrypto }: TrendingCoinsProps) {
  const items = catalog.slice(0, 4);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>Coins Worth Exploring</span>
        </h2>
        <p className="text-xs text-slate-400">
          Observational breakdown based on market activity, momentum, and volume trends
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => {
            const ticker = item.ticker || `${item.symbol.toUpperCase()}-USD`;
            const tag = TAGS[idx % TAGS.length];

            return (
              <Card key={ticker} variant="hover" className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {tag}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{item.symbol}</span>
                  </div>

                  <div className="font-bold text-sm text-white">{item.name}</div>
                  <p className="text-[11px] text-slate-400">
                    High trading interest and historical volume telemetry recorded across market feeds.
                  </p>
                </div>

                <Link
                  href={`/analysis/${encodeURIComponent(ticker)}`}
                  onClick={() => onSelectCrypto(ticker)}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1 pt-2 border-t border-slate-800"
                >
                  <span>Explore Market →</span>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
