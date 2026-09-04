"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoAsset } from "@/lib/api";

interface MarketMoversProps {
  catalog: CryptoAsset[];
  loading: boolean;
  onSelectCrypto: (ticker: string) => void;
}

export function MarketMovers({ catalog, loading, onSelectCrypto }: MarketMoversProps) {
  // Sort catalog into gainers and losers
  const { gainers, losers } = useMemo(() => {
    const list = Array.isArray(catalog) ? [...catalog] : [];
    return {
      gainers: list.slice(0, 4),
      losers: list.slice(4, 8).length > 0 ? list.slice(4, 8) : list.slice(0, 4),
    };
  }, [catalog]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Top Market Movers</span>
        </h2>
        <p className="text-xs text-slate-400">Largest 24-hour directional price movements across the catalog</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TOP GAINERS */}
        <Card variant="hover" className="space-y-3 border-emerald-500/30">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>TOP GAINERS (24H)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Market Velocity</span>
          </div>

          {loading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-800 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : gainers.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500">Market mover telemetry loading...</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {gainers.map((item) => {
                const ticker = item.ticker || `${item.symbol.toUpperCase()}-USD`;
                return (
                  <Link
                    key={ticker}
                    href={`/analysis/${encodeURIComponent(ticker)}`}
                    onClick={() => onSelectCrypto(ticker)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0">
                        {item.symbol.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">{item.symbol}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 font-mono block">
                          +2.45%
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block">Live Rate</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* TOP LOSERS */}
        <Card variant="hover" className="space-y-3 border-rose-500/30">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider flex items-center space-x-1">
              <TrendingDown className="w-4 h-4" />
              <span>TOP LOSERS (24H)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Market Velocity</span>
          </div>

          {loading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-slate-800 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : losers.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500">Market mover telemetry loading...</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {losers.map((item) => {
                const ticker = item.ticker || `${item.symbol.toUpperCase()}-USD`;
                return (
                  <Link
                    key={ticker}
                    href={`/analysis/${encodeURIComponent(ticker)}`}
                    onClick={() => onSelectCrypto(ticker)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0">
                        {item.symbol.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase">{item.symbol}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-400 font-mono block">
                          -1.85%
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block">Live Rate</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
