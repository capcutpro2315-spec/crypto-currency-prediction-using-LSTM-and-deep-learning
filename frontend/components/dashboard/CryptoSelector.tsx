"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, Sparkles, Star, Loader2, Database, RefreshCw } from "lucide-react";
import { CryptoAsset, getCryptocurrencies, SupportedCryptosResponse } from "@/lib/api";
import { LoadingState } from "../common/LoadingState";
import { ErrorState } from "../common/ErrorState";

interface CryptoSelectorProps {
  selectedTicker: string;
  onSelectTicker: (ticker: string) => void;
}

const POPULAR_SYMBOLS = ["BTC", "ETH", "SOL", "DOGE", "XRP"];

export function CryptoSelector({ selectedTicker, onSelectTicker }: CryptoSelectorProps) {
  const [cryptos, setCryptos] = useState<CryptoAsset[]>([]);
  const [catalogInfo, setCatalogInfo] = useState<{ count: number; source: string; cached: boolean; last_updated: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 320,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCryptos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCryptocurrencies();
      const itemsList = res.items || res.cryptocurrencies || [];
      setCryptos(itemsList);
      setCatalogInfo({
        count: res.count || itemsList.length,
        source: res.source || "Dynamic Provider",
        cached: res.cached ?? true,
        last_updated: res.last_updated || new Date().toISOString(),
      });
      if (!selectedTicker && itemsList.length > 0) {
        onSelectTicker(itemsList[0].ticker);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load cryptocurrency catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptos();
  }, []);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 360),
      });
    }
  }, []);

  const toggleDropdown = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  // Close on scroll or window resize or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, updatePosition]);

  const selectedAsset = cryptos.find((c) => c.ticker === selectedTicker) || {
    name: selectedTicker.split("-")[0],
    symbol: selectedTicker.split("-")[0],
    ticker: selectedTicker,
    has_trained_model: false,
    model_available: false,
    training_status: "not_started",
    image: null,
  };

  const filteredCryptos = cryptos.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.id && c.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Performance optimization: slice top 50 matching items for fluid rendering
  const displayedCryptos = filteredCryptos.slice(0, 50);

  const popularCryptos = cryptos.filter((c) => POPULAR_SYMBOLS.includes(c.symbol.toUpperCase()));

  if (loading) {
    return <LoadingState message="Loading dynamic cryptocurrency discovery catalog..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchCryptos} />;
  }

  const renderStatusBadge = (crypto: CryptoAsset | any) => {
    if (crypto.training_status === "training") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded-full animate-pulse">
          <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" /> Training Model
        </span>
      );
    }
    if (crypto.has_trained_model || crypto.model_available || crypto.training_status === "ready") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-full">
          <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-400" /> LSTM Model Ready
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] text-gray-400 border border-gray-800 rounded-full">
        <Database className="w-2.5 h-2.5 mr-1 text-gray-400" /> Historical Data
      </span>
    );
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
          Select Cryptocurrency
        </label>
        {catalogInfo && (
          <span className="text-[10px] text-gray-500 font-mono">
            {catalogInfo.count.toLocaleString()} assets available
          </span>
        )}
      </div>

      {/* Selector Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/90 border border-gray-700/80 rounded-xl hover:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-left shadow-md cursor-pointer"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          {selectedAsset.image ? (
            <img src={selectedAsset.image} alt={selectedAsset.name} className="w-7 h-7 rounded-full shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
              {selectedAsset.symbol}
            </div>
          )}
          <div className="truncate">
            <div className="flex items-center space-x-2 truncate">
              <span className="font-semibold text-white truncate">{selectedAsset.name}</span>
              <span className="text-xs text-gray-400 truncate">({selectedAsset.ticker})</span>
            </div>
            <div className="mt-0.5">{renderStatusBadge(selectedAsset)}</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu Portal Overlay */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: `${dropdownCoords.top}px`,
              left: `${dropdownCoords.left}px`,
              width: `${dropdownCoords.width}px`,
              zIndex: 99999,
            }}
            className="bg-[#0b101d] border border-gray-700/90 rounded-xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-[28rem] flex flex-col transition-all duration-150 animate-in fade-in zoom-in-95"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10 flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, symbol, or ID (e.g. PEPE, SUI, Bitcoin)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto divide-y divide-gray-800/60 max-h-80 flex-1">
              {/* Popular Section */}
              {!searchTerm && popularCryptos.length > 0 && (
                <div className="p-2 bg-gray-900/40 border-b border-gray-800">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Popular Cryptocurrencies
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {popularCryptos.map((coin) => (
                      <button
                        key={`popular-${coin.id || coin.ticker}`}
                        type="button"
                        onClick={() => {
                          onSelectTicker(coin.ticker);
                          setIsOpen(false);
                          setSearchTerm("");
                        }}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/80 text-left transition-colors cursor-pointer"
                      >
                        {coin.image ? (
                          <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded bg-blue-900/50 text-[10px] font-bold text-blue-300 flex items-center justify-center shrink-0">
                            {coin.symbol}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-white truncate">{coin.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Catalog Search Results */}
              {displayedCryptos.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No matching cryptocurrencies found in discovery catalog.</div>
              ) : (
                displayedCryptos.map((crypto) => {
                  const isSelected = crypto.ticker === selectedTicker;
                  return (
                    <button
                      key={crypto.id ? `${crypto.id}-${crypto.ticker}` : crypto.ticker}
                      type="button"
                      onClick={() => {
                        onSelectTicker(crypto.ticker);
                        setIsOpen(false);
                        setSearchTerm("");
                      }}
                      className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer hover:bg-gray-800/70 ${
                        isSelected ? "bg-blue-900/30 text-white" : "text-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        {crypto.image ? (
                          <img src={crypto.image} alt={crypto.name} className="w-7 h-7 rounded-full shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                            {crypto.symbol}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="font-medium text-sm text-white truncate flex items-center gap-1.5">
                            <span>{crypto.name}</span>
                            {crypto.market_cap_rank && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-gray-800 text-gray-400 rounded font-mono">
                                #{crypto.market_cap_rank}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{crypto.symbol} • {crypto.ticker}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        {renderStatusBadge(crypto)}
                        {isSelected && <Check className="w-4 h-4 text-blue-400 ml-1" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Catalog Info Footer */}
            {catalogInfo && (
              <div className="px-3 py-2 bg-gray-900/90 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400 sticky bottom-0">
                <span className="flex items-center gap-1 truncate">
                  <RefreshCw className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{catalogInfo.source} • {catalogInfo.count.toLocaleString()} coins</span>
                </span>
                <span className="font-mono shrink-0 ml-2">30-min cache</span>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}


