"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/common/Card";
import { getCryptocurrencies, getLiveMarketData, CryptoAsset } from "@/lib/api";
import { useCrypto } from "@/lib/CryptoContext";

interface RelatedCoin extends CryptoAsset {
  livePrice?: number;
  change24h?: number;
}

interface RelatedCryptosProps {
  currentTicker: string;
}

export function RelatedCryptos({ currentTicker }: RelatedCryptosProps) {
  const { setSelectedTicker } = useCrypto();
  const [coins, setCoins] = useState<RelatedCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadRelated() {
      try {
        const res = await getCryptocurrencies();
        if (!mounted) return;
        const allItems = res.items || res.cryptocurrencies || [];
        const filtered = allItems.filter((c) => c.ticker !== currentTicker).slice(0, 4);

        const enriched = await Promise.all(
          filtered.map(async (coin) => {
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
          })
        );

        if (mounted) setCoins(enriched);
      } catch {
        if (mounted) setCoins([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRelated();
    return () => {
      mounted = false;
    };
  }, [currentTicker]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>You May Also Want to Explore</span>
        </h2>
        <p className="text-xs text-slate-400">Popular cryptocurrencies in the market catalog</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800 animate-pulse" />
          ))
        ) : (
          coins.map((coin) => {
            const priceText = coin.livePrice != null ? `$${coin.livePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unavailable";
            const changePos = coin.change24h != null && coin.change24h >= 0;

            return (
              <Card key={coin.ticker} variant="hover" className="space-y-3 flex flex-col justify-between">
                <div className="flex items-center space-x-3">
                  {coin.image ? (
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {coin.symbol.slice(0, 3)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-white">{coin.name}</h3>
                    <span className="text-xs font-mono text-slate-500 uppercase">({coin.symbol})</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-extrabold text-white font-mono">{priceText}</div>
                  {coin.change24h != null && (
                    <span className={`text-xs font-mono font-bold flex items-center ${changePos ? "text-emerald-400" : "text-rose-400"}`}>
                      {changePos ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                      {changePos ? "+" : ""}{coin.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>

                <Link
                  href={`/analysis/${encodeURIComponent(coin.ticker)}`}
                  onClick={() => setSelectedTicker(coin.ticker)}
                  className="w-full py-2 bg-slate-950 hover:bg-blue-600/15 border border-slate-800 hover:border-blue-500/40 text-blue-400 hover:text-blue-300 text-xs font-semibold rounded-xl text-center transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}
