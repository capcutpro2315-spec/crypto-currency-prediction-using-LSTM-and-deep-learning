"use client";

import React, { useState, useEffect } from "react";
import { useCrypto } from "@/lib/CryptoContext";
import {
  getCryptocurrencies,
  getLiveMarketData,
  CryptoAsset,
  LiveMarketData,
} from "@/lib/api";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMarketOverview } from "@/components/dashboard/DashboardMarketOverview";
import { MarketMovers } from "@/components/dashboard/MarketMovers";
import { CryptoExplorer } from "@/components/dashboard/CryptoExplorer";
import { TrendingCoins } from "@/components/dashboard/TrendingCoins";
import { DashboardMarketChart } from "@/components/dashboard/DashboardMarketChart";
import { DashboardAIInsights } from "@/components/dashboard/DashboardAIInsights";
import { PredictionCoverage } from "@/components/dashboard/PredictionCoverage";
import { RecentlyViewed } from "@/components/dashboard/RecentlyViewed";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";

export default function DashboardPage() {
  const { selectedTicker, setSelectedTicker } = useCrypto();
  const activeTicker = selectedTicker || "BTC-USD";

  const [catalog, setCatalog] = useState<CryptoAsset[]>([]);
  const [liveData, setLiveData] = useState<LiveMarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.allSettled([
      getCryptocurrencies(),
      getLiveMarketData(activeTicker),
    ]).then(([catRes, liveRes]) => {
      if (!mounted) return;

      if (catRes.status === "fulfilled") {
        const val = catRes.value as any;
        const list = Array.isArray(val)
          ? val
          : val?.items || val?.cryptocurrencies || [];
        setCatalog(list);
      }
      if (liveRes.status === "fulfilled") {
        setLiveData(liveRes.value);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [activeTicker]);

  const handleSelectCrypto = (ticker: string) => {
    if (ticker) {
      setSelectedTicker(ticker);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* 1. DASHBOARD HEADER */}
      <DashboardHeader lastUpdatedTimestamp={liveData?.timestamp} />

      {/* 2. MARKET OVERVIEW CARDS */}
      <DashboardMarketOverview
        catalog={catalog}
        liveData={liveData}
        loading={loading}
      />

      {/* 3. MARKET MOVERS (GAINERS & LOSERS) */}
      <MarketMovers
        catalog={catalog}
        loading={loading}
        onSelectCrypto={handleSelectCrypto}
      />

      {/* 4. DISCOVER CRYPTOCURRENCIES (SEARCH & FILTER) */}
      <CryptoExplorer
        catalog={catalog}
        loading={loading}
        onSelectCrypto={handleSelectCrypto}
      />

      {/* 5. TRENDING / INTERESTING COINS */}
      <TrendingCoins
        catalog={catalog}
        loading={loading}
        onSelectCrypto={handleSelectCrypto}
      />

      {/* 6. MARKET OVERVIEW TREND CHART */}
      <DashboardMarketChart />

      {/* 7. AI INSIGHTS SUMMARY TABLE */}
      <DashboardAIInsights
        catalog={catalog}
        loading={loading}
        onSelectCrypto={handleSelectCrypto}
      />

      {/* 8. PREDICTION AVAILABILITY COVERAGE */}
      <PredictionCoverage catalog={catalog} loading={loading} />

      {/* 9. RECENTLY VIEWED */}
      <RecentlyViewed
        currentTicker={activeTicker}
        onSelectCrypto={handleSelectCrypto}
      />

      {/* 10 & 11. QUICK ACTIONS & DATA FRESHNESS */}
      <DashboardQuickActions selectedTicker={activeTicker} />
    </div>
  );
}
