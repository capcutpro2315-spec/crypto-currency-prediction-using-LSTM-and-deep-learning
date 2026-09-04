"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { History, ArrowRight } from "lucide-react";
import { Card } from "@/components/common/Card";

interface RecentlyViewedProps {
  currentTicker: string;
  onSelectCrypto: (ticker: string) => void;
}

export function RecentlyViewed({ currentTicker, onSelectCrypto }: RecentlyViewedProps) {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("crypto_recent_viewed");
      let list: string[] = stored ? JSON.parse(stored) : [];

      if (currentTicker && !list.includes(currentTicker)) {
        list = [currentTicker, ...list.filter((t) => t !== currentTicker)].slice(0, 5);
        localStorage.setItem("crypto_recent_viewed", JSON.stringify(list));
      }

      // Default fallback list if local storage is empty
      if (list.length === 0) {
        list = ["BTC-USD", "ETH-USD", "SOL-USD"];
      }

      setHistory(list);
    } catch {
      setHistory(["BTC-USD", "ETH-USD", "SOL-USD"]);
    }
  }, [currentTicker]);

  return (
    <Card variant="hover" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-400" />
          <span>Recently Viewed</span>
        </h2>
        <span className="text-xs text-slate-500 font-mono">Local Workspace Session</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {history.map((ticker) => {
          const symbol = ticker.split("-")[0];
          return (
            <Link
              key={ticker}
              href={`/analysis/${encodeURIComponent(ticker)}`}
              onClick={() => onSelectCrypto(ticker)}
              className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 text-xs font-bold text-slate-200 transition-all flex items-center space-x-2 group cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[9px] font-mono shrink-0">
                {symbol.slice(0, 2)}
              </div>
              <span>{symbol}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
