"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, TrendingUp, TrendingDown, ArrowRight, Flame, Sparkles } from "lucide-react";
import { Card } from "@/components/common/Card";
import { getCryptocurrencies, getLiveMarketData, CryptoAsset } from "@/lib/api";
import { useCrypto } from "@/lib/CryptoContext";

interface EnrichedCoin extends CryptoAsset {
  livePrice?: number;
  change24h?: number;
}

export function CryptoDiscovery() {
  const { setSelectedTicker } = useCrypto();
  const [catalog, setCatalog] = useState<EnrichedCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "trending" | "gainers" | "losers" | "active">("all");

  useEffect(() => {
    let mounted = true;
    async function loadCatalog() {
      try {
        const res = await getCryptocurrencies();
        if (!mounted) return;
        const items = res.items || res.cryptocurrencies || [];
        const subset = items.slice(0, 16);

        // Fetch live market data for subset to populate price and 24h change
        const enrichedPromises = subset.map(async (coin) => {
          try {
            const live = await getLiveMarketData(coin.ticker);
            return {
              ...coin,
              livePrice: live.price,
              change24h: live.change_24h,
            };
          } catch {
            return coin;
          }
        });

        const enriched = await Promise.all(enrichedPromises);
        if (mounted) {
          setCatalog(enriched);
        }
      } catch {
        if (mounted) setCatalog([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredCoins = useMemo(() => {
    let list = catalog;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q) ||
          c.ticker.toLowerCase().includes(q)
      );
    }

    if (activeFilter === "trending") {
      list = list.filter((c) => c.market_cap_rank != null && c.market_cap_rank <= 10);
    } else if (activeFilter === "gainers") {
      list = [...list].sort((a, b) => (b.change24h ?? -999) - (a.change24h ?? -999));
    } else if (activeFilter === "losers") {
      list = [...list].sort((a, b) => (a.change24h ?? 999) - (b.change24h ?? 999));
    } else if (activeFilter === "active") {
      list = list.filter((c) => c.has_trained_model || c.model_available);
    }

    return list;
  }, [catalog, searchQuery, activeFilter]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Find a Crypto</h2>
          <p className="text-sm text-slate-400">
            Search thousands of cryptocurrencies and explore the ones that interest you.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          {[
            { id: "all", label: "All" },
            { id: "trending", label: "Trending" },
            { id: "gainers", label: "Top Gainers" },
            { id: "losers", label: "Top Losers" },
            { id: "active", label: "AI Ready" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter catalog by coin name or symbol (e.g. BTC, Solana)..."
          className="w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:outline-none text-xs text-slate-200 placeholder-slate-500 rounded-xl py-2.5 pl-9 pr-3 transition-colors"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
      </div>

      {/* Discovery List / Watchlist */}
      <div className="bg-[#0d1322] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-900/60 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredCoins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-slate-400 font-mono">
                  <th className="py-3 px-4 font-medium">Asset</th>
                  <th className="py-3 px-4 font-medium">Symbol</th>
                  <th className="py-3 px-4 font-medium text-right">Price</th>
                  <th className="py-3 px-4 font-medium text-right">24h Change</th>
                  <th className="py-3 px-4 font-medium text-center">AI Model</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-200">
                {filteredCoins.map((coin) => {
                  const priceText = coin.livePrice != null ? `$${coin.livePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unavailable";
                  const changeVal = coin.change24h;
                  const isPos = changeVal != null && changeVal >= 0;

                  return (
                    <tr
                      key={coin.ticker || coin.symbol}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedTicker(coin.ticker);
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {coin.image ? (
                            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {coin.symbol.slice(0, 3).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {coin.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {coin.symbol.toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-100 text-right">
                        {priceText}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {changeVal != null ? (
                          <span className={`font-mono font-bold inline-flex items-center ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPos ? "+" : ""}{changeVal.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {coin.has_trained_model || coin.model_available ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Ready
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/analysis/${encodeURIComponent(coin.ticker)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicker(coin.ticker);
                          }}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 text-xs font-medium rounded border border-slate-700 hover:border-blue-500/40 transition-colors"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No cryptocurrencies found matching your query or filter criteria.
          </div>
        )}
      </div>
    </section>
  );
}
