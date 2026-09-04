"use client";

import React, { useState, useEffect } from "react";
import { Scale, Plus, X } from "lucide-react";
import { Card } from "@/components/common/Card";
import {
  getCryptocurrencies,
  getLiveMarketData,
  getPrediction,
  getDecisionSupport,
  CryptoAsset,
} from "@/lib/api";

interface ComparisonRow {
  ticker: string;
  name: string;
  symbol: string;
  price?: number;
  change24h?: number;
  expectedChange?: number;
  riskLabel?: string;
  signal?: string;
}

interface CoinComparisonDetailProps {
  currentTicker: string;
}

export function CoinComparisonDetail({ currentTicker }: CoinComparisonDetailProps) {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([currentTicker]);
  const [catalog, setCatalog] = useState<CryptoAsset[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync current ticker if props change
  useEffect(() => {
    if (currentTicker && !selectedTickers.includes(currentTicker)) {
      setSelectedTickers([currentTicker]);
    }
  }, [currentTicker]);

  // Fetch catalog for coin selector
  useEffect(() => {
    let mounted = true;
    getCryptocurrencies()
      .then((res) => {
        if (mounted) setCatalog(res.items || res.cryptocurrencies || []);
      })
      .catch(() => {
        if (mounted) setCatalog([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch telemetry for picked comparison tickers
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function loadComparison() {
      const rows = await Promise.all(
        selectedTickers.map(async (t) => {
          const coinName = catalog.find((c) => c.ticker === t)?.name || t.replace("-USD", "");
          const symbol = catalog.find((c) => c.ticker === t)?.symbol || t.split("-")[0];

          let price: number | undefined;
          let change24h: number | undefined;
          let expectedChange: number | undefined;
          let riskLabel: string | undefined;
          let signal: string | undefined;

          try {
            const live = await getLiveMarketData(t);
            price = live.price;
            change24h = live.change_24h;
          } catch {}

          try {
            const pred = await getPrediction(t);
            expectedChange = pred.expected_change_percent;
          } catch {}

          try {
            const dec = await getDecisionSupport(t);
            riskLabel = dec.risk_label;
            signal = dec.decision;
          } catch {}

          return {
            ticker: t,
            name: coinName,
            symbol,
            price,
            change24h,
            expectedChange,
            riskLabel,
            signal,
          };
        })
      );

      if (mounted) {
        setComparisonData(rows);
        setLoading(false);
      }
    }

    loadComparison();
    return () => {
      mounted = false;
    };
  }, [selectedTickers, catalog]);

  const handleAddTicker = (t: string) => {
    if (selectedTickers.includes(t) || selectedTickers.length >= 3) return;
    setSelectedTickers([...selectedTickers, t]);
  };

  const handleRemoveTicker = (t: string) => {
    if (selectedTickers.length <= 1 || t === currentTicker) return;
    setSelectedTickers(selectedTickers.filter((item) => item !== t));
  };

  const mapSignalLabel = (sig: string | undefined) => {
    if (!sig || sig === "UNAVAILABLE") return "Unavailable";
    const s = sig.toUpperCase();
    if (s === "CONSIDER" || s === "BUY") return "BUY";
    if (s === "WAIT" || s === "HOLD") return "HOLD";
    if (s === "AVOID") return "AVOID";
    return sig;
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <span>Compare With Another Crypto</span>
          </h2>
          <p className="text-xs text-slate-400">Side-by-side metric comparison (Select up to 3 cryptocurrencies)</p>
        </div>

        {/* Ticker Selector Controls */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {selectedTickers.map((t) => (
            <span
              key={t}
              className={`inline-flex items-center space-x-1.5 px-3 py-1 border rounded-xl text-xs font-mono ${
                t === currentTicker
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-300 font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-300"
              }`}
            >
              <span>{t.replace("-USD", "")}</span>
              {selectedTickers.length > 1 && t !== currentTicker && (
                <button onClick={() => handleRemoveTicker(t)} className="hover:text-rose-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}

          {selectedTickers.length < 3 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddTicker(e.target.value);
                  e.target.value = "";
                }
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-blue-400 font-semibold rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="">+ Add Crypto</option>
              {catalog
                .filter((c) => !selectedTickers.includes(c.ticker))
                .slice(0, 15)
                .map((c) => (
                  <option key={c.ticker} value={c.ticker}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 bg-slate-900/60 rounded-2xl border border-slate-800 animate-pulse h-40" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Cryptocurrency</th>
                <th className="p-4 font-semibold">Current Price</th>
                <th className="p-4 font-semibold">24h Change</th>
                <th className="p-4 font-semibold">Risk Level</th>
                <th className="p-4 font-semibold">Expected Movement</th>
                <th className="p-4 font-semibold">AI Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisonData.map((row) => {
                const priceText = row.price != null ? `$${row.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "Unavailable";
                const changePos = row.change24h != null && row.change24h >= 0;
                const expPos = row.expectedChange != null && row.expectedChange >= 0;
                const mappedSignal = mapSignalLabel(row.signal);

                return (
                  <tr key={row.ticker} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white font-sans flex items-center space-x-2">
                      <span>{row.name}</span>
                      <span className="text-slate-500 font-mono">({row.symbol})</span>
                    </td>
                    <td className="p-4 font-mono text-slate-200 font-semibold">{priceText}</td>
                    <td className="p-4 font-mono font-bold">
                      {row.change24h != null ? (
                        <span className={changePos ? "text-emerald-400" : "text-rose-400"}>
                          {changePos ? "+" : ""}{row.change24h.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Unavailable</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {row.riskLabel ? (
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] ${
                            row.riskLabel.toUpperCase().includes("LOW")
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : row.riskLabel.toUpperCase().includes("HIGH")
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {row.riskLabel.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-500">Unavailable</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      {row.expectedChange != null ? (
                        <span className={expPos ? "text-emerald-400" : "text-rose-400"}>
                          {expPos ? "+" : ""}{row.expectedChange.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Unavailable</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] ${
                          mappedSignal === "BUY"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : mappedSignal === "HOLD"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : mappedSignal === "AVOID"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {mappedSignal}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
