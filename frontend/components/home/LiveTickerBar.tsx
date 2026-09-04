"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Clock, Activity } from "lucide-react";
import { getCryptocurrencies, getLiveMarketData, CryptoAsset, LiveMarketData } from "@/lib/api";
import { useCrypto } from "@/lib/CryptoContext";

interface TickerItemWithPrice extends CryptoAsset {
  livePrice?: number;
  change24h?: number;
  timestamp?: string;
}

export function LiveTickerBar() {
  const { setSelectedTicker } = useCrypto();
  const [items, setItems] = useState<TickerItemWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedText, setLastUpdatedText] = useState("Just now");

  useEffect(() => {
    let mounted = true;

    async function loadLiveData() {
      try {
        const res = await getCryptocurrencies();
        if (!mounted) return;
        const catalog = res.items || res.cryptocurrencies || [];
        const topCoins = catalog.slice(0, 8);

        // Fetch live market metrics for top coins in parallel
        const livePromises = topCoins.map(async (coin) => {
          try {
            const live = await getLiveMarketData(coin.ticker);
            return {
              ...coin,
              livePrice: live.price,
              change24h: live.change_24h,
              timestamp: live.timestamp,
            };
          } catch {
            return { ...coin } as TickerItemWithPrice;
          }
        });

        const enriched = await Promise.all(livePromises);
        if (mounted) {
          setItems(enriched);
          const firstTs = enriched.find((e) => e.timestamp)?.timestamp;
          if (firstTs) {
            setLastUpdatedText("Live • Updated ~1 min ago");
          } else {
            setLastUpdatedText("Live • Synced from market feed");
          }
        }
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadLiveData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full bg-slate-950/90 border-y border-slate-800/80 py-3.5 px-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              What&apos;s Moving Right Now
            </h2>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{lastUpdatedText}</span>
          </div>
        </div>

        {/* Horizontally scrolling cards */}
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-1">
          {loading ? (
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-40 h-14 bg-slate-900 rounded-xl animate-pulse border border-slate-800 shrink-0" />
              ))}
            </div>
          ) : items.length > 0 ? (
            items.map((coin) => {
              const priceDisplay = coin.livePrice != null ? `$${coin.livePrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unavailable";
              const changeVal = coin.change24h;
              const isPositive = changeVal != null && changeVal >= 0;

              return (
                <button
                  key={coin.ticker || coin.symbol}
                  onClick={() => setSelectedTicker(coin.ticker)}
                  className="flex items-center space-x-3 p-2.5 px-3.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all shrink-0 text-left cursor-pointer group"
                >
                  {coin.image ? (
                    <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {coin.symbol.slice(0, 3).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">
                        {coin.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">({coin.symbol})</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-mono mt-0.5">
                      <span className="text-slate-200 font-semibold">{priceDisplay}</span>
                      {changeVal != null ? (
                        <span className={`flex items-center text-[11px] font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {isPositive ? "+" : ""}{changeVal.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">N/A</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-xs text-slate-500">Live market telemetry currently syncing...</div>
          )}
        </div>
      </div>
    </div>
  );
}

