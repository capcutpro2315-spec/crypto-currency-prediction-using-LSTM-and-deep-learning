"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Cpu, BarChart2, TrendingUp, Info, HelpCircle, Menu, X, Search, ShieldCheck } from "lucide-react";
import { useCrypto } from "@/lib/CryptoContext";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Cpu },
  { name: "Markets", path: "/markets", icon: BarChart2 },
  { name: "AI Analysis", path: "/prediction", icon: TrendingUp },
  { name: "How It Works", path: "/how-it-works", icon: HelpCircle },
  { name: "About", path: "/about", icon: Info },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedTicker, setSelectedTicker } = useCrypto();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim().toUpperCase();
    const formattedTicker = query.includes("-") ? query : `${query}-USD`;
    setSelectedTicker(formattedTicker);
    router.push(`/analysis/${encodeURIComponent(formattedTicker)}`);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center space-x-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  CryptoPredict AI
                </span>
              </div>
              <span className="block text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
                AI Powered Cryptocurrency Analysis
              </span>
            </div>
          </Link>

          {/* Desktop Global Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls: Quick Search */}
          <div className="hidden sm:flex items-center space-x-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticker (e.g. BTC, ETH, DOGE)..."
                className="w-48 md:w-64 bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-200 placeholder-slate-500 rounded-xl py-2 pl-9 pr-3 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </form>

            {/* Currently Selected Crypto Indicator Badge */}
            {selectedTicker && (
              <Link
                href={`/analysis/${encodeURIComponent(selectedTicker)}`}
                className="hidden xl:inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 hover:border-slate-700 transition-colors"
                title="Currently Selected Cryptocurrency"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{selectedTicker}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#0d1322] px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cryptocurrency (e.g. SOL, DOGE)..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-sm text-slate-200 placeholder-slate-500 rounded-xl py-2.5 pl-9 pr-3"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          </form>

          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
