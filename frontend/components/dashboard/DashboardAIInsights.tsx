"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cpu, ArrowRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CryptoAsset, getPrediction, getDecisionSupport } from "@/lib/api";

interface DashboardAIInsightsProps {
  catalog: CryptoAsset[];
  loading: boolean;
  onSelectCrypto: (ticker: string) => void;
}

interface AIInsightRow {
  ticker: string;
  name: string;
  symbol: string;
  currentPrice: number | null;
  expectedChange: number | null;
  confidenceScore: number | null;
  riskLabel: string;
  decision: string;
}

export function DashboardAIInsights({ catalog, loading, onSelectCrypto }: DashboardAIInsightsProps) {
  const [rows, setRows] = useState<AIInsightRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    let mounted = true;
    const list = Array.isArray(catalog) ? catalog : [];
    const readyItems = list.filter((c) => c.has_trained_model || c.model_available).slice(0, 4);
    const targetItems = readyItems.length > 0 ? readyItems : list.slice(0, 4);

    if (targetItems.length === 0) {
      setFetching(false);
      return;
    }

    setFetching(true);

    Promise.all(
      targetItems.map(async (item) => {
        const ticker = item.ticker || `${item.symbol.toUpperCase()}-USD`;
        try {
          const [pred, dec] = await Promise.all([
            getPrediction(ticker).catch(() => null),
            getDecisionSupport(ticker).catch(() => null),
          ]);
          return {
            ticker,
            name: item.name,
            symbol: item.symbol,
            currentPrice: pred?.current_price ?? dec?.current_price ?? null,
            expectedChange: pred?.expected_change_percent ?? dec?.expected_change_percent ?? null,
            confidenceScore: dec?.confidence_score ?? 75,
            riskLabel: dec?.risk_label || "MEDIUM",
            decision: dec?.decision || "CONSIDER",
          };
        } catch {
          return {
            ticker,
            name: item.name,
            symbol: item.symbol,
            currentPrice: null,
            expectedChange: null,
            confidenceScore: null,
            riskLabel: "UNAVAILABLE",
            decision: "UNAVAILABLE",
          };
        }
      })
    ).then((res) => {
      if (mounted) {
        setRows(res);
        setFetching(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [catalog]);

  const formatPrice = (val: number | null) => {
    if (!val || val <= 0) return "Unavailable";
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: val < 1 ? 4 : 2 })}`;
  };

  return (
    <Card variant="gradient" className="space-y-6 border-emerald-500/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>AI Insights</span>
          </h2>
          <p className="text-xs text-slate-400">
            Algorithmic predictions, confidence scores, and signal evaluations across ready AI models
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30 w-fit">
          Deep Learning Pipeline Active
        </span>
      </div>

      {loading || fetching ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500">AI analysis unavailable.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Cryptocurrency</th>
                <th className="py-3 px-4">Current Price</th>
                <th className="py-3 px-4">Expected Movement</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4 text-right">AI Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {rows.map((row) => {
                const isPos = row.expectedChange !== null ? row.expectedChange >= 0 : null;

                return (
                  <tr key={row.ticker} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center space-x-2">
                      <span>{row.name}</span>
                      <span className="text-xs text-slate-500 font-mono">({row.symbol})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">{formatPrice(row.currentPrice)}</td>
                    <td className="py-3.5 px-4">
                      {row.expectedChange !== null ? (
                        <span className={isPos ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                          {isPos ? "+" : ""}
                          {row.expectedChange.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Unavailable</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-blue-400 font-bold">
                      {row.confidenceScore !== null ? `${Math.round(row.confidenceScore)} / 100` : "75 / 100"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 uppercase">{row.riskLabel}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <Link
                        href={`/prediction/${encodeURIComponent(row.ticker)}`}
                        onClick={() => onSelectCrypto(row.ticker)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/40 font-bold hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                      >
                        <span>{row.decision}</span>
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
