"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, SlidersHorizontal, RefreshCw, BarChart2, Cpu } from "lucide-react";
import { getCryptocurrencies, CryptoAsset } from "@/lib/api";
import { CryptoCard } from "@/components/crypto/CryptoCard";
import { CryptoSearch } from "@/components/crypto/CryptoSearch";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

export default function MarketsPage() {
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "ai_ready">("all");
  const [sortBy, setSortBy] = useState<"name" | "symbol">("name");

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCryptocurrencies();
      const items = res.items || res.cryptocurrencies || [];
      setCryptos(items);
    } catch (err: any) {
      setError(err.message || "Failed to load cryptocurrency catalog from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredCryptos = useMemo(() => {
    return cryptos
      .filter((c) => {
        const matchQuery =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.ticker.toLowerCase().includes(searchQuery.toLowerCase());
        const matchFilter =
          filterMode === "all" ? true : c.model_available || c.has_trained_model;
        return matchQuery && matchFilter;
      })
      .sort((a, b) => {
        if (sortBy === "symbol") return a.symbol.localeCompare(b.symbol);
        return a.name.localeCompare(b.name);
      });
  }, [cryptos, searchQuery, filterMode, sortBy]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-semibold text-blue-400 mb-2">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Cryptocurrency Explorer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Market Asset Catalog</h1>
          <p className="text-sm text-slate-400 mt-1">
            Search and select supported cryptocurrencies for market analysis and deep-learning price forecasts.
          </p>
        </div>

        <button
          onClick={fetchCatalog}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-colors self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Controls Bar: Search, Filter, Sort */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <CryptoSearch onSearch={setSearchQuery} placeholder="Search by name, ticker, or symbol..." />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterMode === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Assets ({cryptos.length})
            </button>
            <button
              onClick={() => setFilterMode("ai_ready")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                filterMode === "ai_ready" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Ready</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="name" className="bg-slate-900">Name (A-Z)</option>
              <option value="symbol" className="bg-slate-900">Symbol (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid State Handler */}
      {loading ? (
        <LoadingState message="Loading cryptocurrency market catalog from backend..." />
      ) : error ? (
        <ErrorState title="Catalog Unavailable" message={error} onRetry={fetchCatalog} />
      ) : filteredCryptos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCryptos.map((crypto) => (
            <CryptoCard key={crypto.ticker || crypto.symbol} crypto={crypto} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2">
          <p className="text-slate-300 font-bold text-base">No cryptocurrencies found.</p>
          <p className="text-xs text-slate-500">Try adjusting your search query or filter selection.</p>
        </div>
      )}
    </div>
  );
}
