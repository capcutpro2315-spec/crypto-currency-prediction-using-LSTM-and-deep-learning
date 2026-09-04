"use client";

import React from "react";
import { BarChart2 } from "lucide-react";
import { HomeCryptoSearch } from "@/components/home/HomeCryptoSearch";

interface MarketPageHeaderProps {
  cryptoName: string;
  symbol: string;
  ticker: string;
}

export function MarketPageHeader({ cryptoName, symbol, ticker }: MarketPageHeaderProps) {
  return (
    <div className="space-y-6 pb-6 border-b border-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* Badge & Ticker */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-extrabold text-sm shrink-0">
              {symbol.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{cryptoName}</h1>
                <span className="text-sm font-mono text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-lg">
                  {symbol.toUpperCase()}
                </span>
              </div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400 mt-0.5">
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Market Analysis</span>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Understand the current market condition, recent movement, and historical behavior of this cryptocurrency.
          </p>
        </div>

        {/* Dynamic Selector Dropdown Container */}
        <div className="w-full md:w-80">
          <HomeCryptoSearch />
        </div>
      </div>
    </div>
  );
}
