"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Compass, Cpu, ArrowRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoAsset } from "@/lib/api";

interface CryptoExplorerProps {
  catalog: CryptoAsset[];
  loading: boolean;
  onSelectCrypto: (ticker: string) => void;
}

type CategoryFilter = "All" | "Large Cap" | "Mid Cap" | "Small Cap";

export function CryptoExplorer({ catalog, loading, onSelectCrypto }: CryptoExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const filteredItems = useMemo(() => {
    let list = Array.isArray(catalog) ? catalog : [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q) ||
          c.ticker.toLowerCase().includes(q)
      );
    }

    if (category === "Large Cap") {
      list = list.slice(0, 10);
    } else if (category === "Mid Cap") {
      list = list.slice(10, 30);
    } else if (category === "Small Cap") {
      list = list.slice(30);
    }

    return list.slice(0, 8);
  }, [catalog, searchQuery, category]);

  return (
    <Card variant="gradient" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <span>Explore Cryptocurrencies</span>
          </h2>
          <p className="text-xs text-slate-400">Discover and inspect assets across the dynamic catalog</p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crypto..."
              className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-48"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(["All", "Large Cap", "Mid Cap", "Small Cap"] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  category === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Asset Table / Grid */}
      {loading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
          No cryptocurrencies found matching &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">AI Model Status</th>
                <th className="py-3 px-4 text-right">Market Cap</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const ticker = item.ticker || `${item.symbol.toUpperCase()}-USD`;

                return (
                  <tr key={ticker} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-200 shrink-0">
                        {item.symbol.slice(0, 3).toUpperCase()}
                      </div>
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 uppercase">{item.symbol}</td>
                    <td className="py-3 px-4">
                      {item.has_trained_model || item.model_available ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          <Cpu className="w-3 h-3" />
                          <span>AI Ready</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Catalog</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-slate-400">Unavailable</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/analysis/${encodeURIComponent(ticker)}`}
                        onClick={() => onSelectCrypto(ticker)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
