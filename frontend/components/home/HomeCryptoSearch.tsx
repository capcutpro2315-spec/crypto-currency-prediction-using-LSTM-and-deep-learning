"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, Check, Sparkles, Cpu, Flame, X } from "lucide-react";
import { getCryptocurrencies, CryptoAsset } from "@/lib/api";
import { useCrypto } from "@/lib/CryptoContext";

const POPULAR_SHORTCUTS = [
  { name: "Bitcoin", symbol: "BTC", ticker: "BTC-USD" },
  { name: "Ethereum", symbol: "ETH", ticker: "ETH-USD" },
  { name: "Solana", symbol: "SOL", ticker: "SOL-USD" },
  { name: "Dogecoin", symbol: "DOGE", ticker: "DOGE-USD" },
];

export function HomeCryptoSearch() {
  const { selectedTicker, setSelectedTicker } = useCrypto();

  const [catalog, setCatalog] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch full dynamic catalog from backend API
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCryptocurrencies()
      .then((res) => {
        if (mounted) {
          const list = res.items || res.cryptocurrencies || [];
          setCatalog(list);
        }
      })
      .catch(() => {
        if (mounted) setCatalog([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Filter catalog based on search query
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalog;
    const q = searchQuery.toLowerCase().trim();
    return catalog.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.symbol.toLowerCase().includes(q) ||
        item.ticker.toLowerCase().includes(q)
    );
  }, [catalog, searchQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredCatalog.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredCatalog.length - 1));
    } else if (e.key === "Enter" && focusedIndex >= 0 && filteredCatalog[focusedIndex]) {
      e.preventDefault();
      handleSelect(filteredCatalog[focusedIndex].ticker || `${filteredCatalog[focusedIndex].symbol.toUpperCase()}-USD`);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (ticker: string) => {
    setSelectedTicker(ticker);
    setIsOpen(false);
    setSearchQuery("");
  };

  const currentSelectedAsset = useMemo(() => {
    return catalog.find((c) => c.ticker === selectedTicker || c.symbol.toUpperCase() === selectedTicker.replace("-USD", "").toUpperCase());
  }, [catalog, selectedTicker]);

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Popular Crypto Shortcuts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mr-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Popular:</span>
        </span>
        {POPULAR_SHORTCUTS.map((item) => {
          const isSelected = selectedTicker === item.ticker;
          return (
            <button
              key={item.ticker}
              type="button"
              onClick={() => handleSelect(item.ticker)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
                isSelected
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <span>{item.name}</span>
              <span className="font-mono text-[10px] opacity-75">({item.symbol})</span>
            </button>
          );
        })}
      </div>

      {/* Main Search Input & Absolute Z-100 Dropdown Container */}
      <div className="relative z-[100]">
        <div
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          className={`flex items-center bg-slate-900/90 border rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl transition-all cursor-text ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20 shadow-blue-950/40"
              : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <Search className="w-5 h-5 text-blue-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentSelectedAsset
                ? `Selected: ${currentSelectedAsset.name} (${selectedTicker}) — Search another...`
                : "Search a cryptocurrency by name or symbol (e.g. Bitcoin, ETH, SOL)..."
            }
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm font-medium focus:outline-none px-3"
          />

          {searchQuery && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
              }}
              className="p-1 text-slate-500 hover:text-slate-300 rounded-lg mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center space-x-2 shrink-0 border-l border-slate-800 pl-3">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              {catalog.length > 0 ? `${catalog.length} Assets` : "Loading..."}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* OVERLAY DROPDOWN MENU (MUST ALWAYS RENDER ON TOP z-[100]) */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-[#0d1322] border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-2xl max-h-80 overflow-y-auto z-[100] divide-y divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading dynamic asset catalog...</div>
            ) : filteredCatalog.length > 0 ? (
              filteredCatalog.map((item, idx) => {
                const itemTicker = item.ticker || `${item.symbol.toUpperCase()}-USD`;
                const isSelected = selectedTicker === itemTicker;
                const isFocused = idx === focusedIndex;

                return (
                  <div
                    key={itemTicker}
                    onClick={() => handleSelect(itemTicker)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-600/15 text-white"
                        : isFocused
                        ? "bg-slate-800/80 text-white"
                        : "hover:bg-slate-800/50 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                          {item.symbol.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-sm flex items-center space-x-2">
                          <span>{item.name}</span>
                          <span className="text-xs font-mono text-slate-400 uppercase">({item.symbol})</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{itemTicker}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.model_available || item.has_trained_model ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          <Cpu className="w-3 h-3" />
                          <span>AI Ready</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">Catalog</span>
                      )}

                      {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                No cryptocurrency matching &quot;{searchQuery}&quot; found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
