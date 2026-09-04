"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Clock, ArrowRight, BarChart2, Cpu, TrendingUp, TrendingDown } from "lucide-react";
import { LiveMarketData, MarketSummaryResponse } from "@/lib/api";

interface DetailHeaderProps {
  ticker: string;
  symbol: string;
  cryptoName: string;
  liveData: LiveMarketData | null;
  marketSummary: MarketSummaryResponse | null;
}

export function DetailHeader({
  ticker,
  symbol,
  cryptoName,
  liveData,
  marketSummary,
}: DetailHeaderProps) {
  const price = liveData?.price ?? marketSummary?.current_price;
  const change24h = liveData?.change_24h ?? marketSummary?.price_change_24h_percent;
  const logo = (liveData as any)?.image;
  const freshness = liveData?.freshness || (liveData?.timestamp ? `Updated ${new Date(liveData.timestamp).toLocaleTimeString()}` : "Live Feed");

  // Watchlist state backed by LocalStorage
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("crypto_watchlist");
      if (stored) {
        const list: string[] = JSON.parse(stored);
        setInWatchlist(list.includes(ticker));
      }
    } catch {}
  }, [ticker]);

  const toggleWatchlist = () => {
    try {
      const stored = localStorage.getItem("crypto_watchlist");
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (inWatchlist) {
        list = list.filter((item) => item !== ticker);
      } else {
        if (!list.includes(ticker)) list.push(ticker);
      }
      localStorage.setItem("crypto_watchlist", JSON.stringify(list));
      setInWatchlist(!inWatchlist);
    } catch {}
  };

  const priceText = price != null ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unavailable";
  const isPos = change24h != null && change24h >= 0;

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Identity & Price */}
        <div className="flex items-start sm:items-center space-x-4">
          {logo ? (
            <img src={logo} alt={cryptoName} className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shrink-0 border border-slate-700/80 shadow-lg" />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xl flex items-center justify-center shrink-0 border border-slate-700/80 shadow-lg">
              {symbol.slice(0, 3)}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{cryptoName}</h1>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 uppercase">
                {symbol}
              </span>
              <button
                onClick={toggleWatchlist}
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  inWatchlist
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${inWatchlist ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>{inWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
              </button>
            </div>

            <div className="flex items-center space-x-3 text-xs text-slate-400 pt-0.5">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Data Updated: {freshness}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Price & Quick CTAs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{priceText}</div>
            {change24h != null ? (
              <div className={`flex items-center text-xs sm:text-sm font-mono font-bold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                {isPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span>{isPos ? "+" : ""}{change24h.toFixed(2)}% (24h)</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">24h Change unavailable</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/prediction/${encodeURIComponent(ticker)}`}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center space-x-1.5"
            >
              <Cpu className="w-4 h-4" />
              <span>AI Prediction →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
