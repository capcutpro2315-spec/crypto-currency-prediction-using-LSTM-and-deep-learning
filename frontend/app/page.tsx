"use client";

import React, { useState, useEffect } from "react";
import { useCrypto } from "@/lib/CryptoContext";
import {
  getLiveMarketData,
  getMarketSummary,
  getPrediction,
  getPredictionStatus,
  getDecisionSupport,
  LiveMarketData,
  MarketSummaryResponse,
  CryptoPredictionResponse,
  ModelStatusResponse,
  CryptoDecisionResponse,
} from "@/lib/api";

import { HeroSection } from "@/components/home/HeroSection";
import { LiveTickerBar } from "@/components/home/LiveTickerBar";
import { CryptoDiscovery } from "@/components/home/CryptoDiscovery";
import { CoinSnapshot } from "@/components/home/CoinSnapshot";
import { HistoricalStory } from "@/components/home/HistoricalStory";
import { FutureForecast as FutureOutlook } from "@/components/home/FutureForecast";
import { ScenarioCards } from "@/components/home/ScenarioCards";
import { RiskOverview } from "@/components/home/RiskOverview";
import { AISignalSection } from "@/components/home/AISignalSection";
import { ThingsYouShouldKnow } from "@/components/home/ThingsYouShouldKnow";
import { CryptoComparison } from "@/components/home/CryptoComparison";
import { ExploreCards } from "@/components/home/ExploreCards";
import { TrustSection } from "@/components/home/TrustSection";
import { DisclaimerSection } from "@/components/home/DisclaimerSection";

export default function HomePage() {
  const { selectedTicker } = useCrypto();

  const [liveData, setLiveData] = useState<LiveMarketData | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummaryResponse | null>(null);
  const [prediction, setPrediction] = useState<CryptoPredictionResponse | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [decisionData, setDecisionData] = useState<CryptoDecisionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (!selectedTicker) return;

    setLoading(true);

    Promise.allSettled([
      getLiveMarketData(selectedTicker),
      getMarketSummary(selectedTicker),
      getPrediction(selectedTicker),
      getPredictionStatus(selectedTicker),
      getDecisionSupport(selectedTicker),
    ]).then(([liveRes, summaryRes, predRes, statusRes, decisionRes]) => {
      if (!isMounted) return;

      if (liveRes.status === "fulfilled") setLiveData(liveRes.value);
      else setLiveData(null);

      if (summaryRes.status === "fulfilled") setMarketSummary(summaryRes.value);
      else setMarketSummary(null);

      if (predRes.status === "fulfilled") setPrediction(predRes.value);
      else setPrediction(null);

      if (statusRes.status === "fulfilled") setModelStatus(statusRes.value);
      else setModelStatus(null);

      if (decisionRes.status === "fulfilled") setDecisionData(decisionRes.value);
      else setDecisionData(null);

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedTicker]);

  return (
    <div className="space-y-16 pb-12">
      {/* SECTION 1 — HERO */}
      <HeroSection />

      {/* SECTION 2 — LIVE MARKET STRIP */}
      <LiveTickerBar />

      {/* SECTION 3 — CRYPTO DISCOVERY */}
      <CryptoDiscovery />

      {/* SECTION 4 — CURRENT COIN SNAPSHOT */}
      <CoinSnapshot
        ticker={selectedTicker}
        liveData={liveData}
        marketSummary={marketSummary}
        decisionData={decisionData}
        loading={loading}
      />

      {/* SECTION 5 — HISTORICAL STORY */}
      <HistoricalStory ticker={selectedTicker} />

      {/* SECTION 6 — FUTURE OUTLOOK */}
      <FutureOutlook
        ticker={selectedTicker}
        prediction={prediction}
        modelStatus={modelStatus}
        loading={loading}
      />

      {/* SECTION 7 — POSSIBLE FUTURE SCENARIOS */}
      <ScenarioCards
        ticker={selectedTicker}
        prediction={prediction}
        loading={loading}
      />

      {/* SECTION 8 — RISK */}
      <RiskOverview
        ticker={selectedTicker}
        decisionData={decisionData}
        liveData={liveData}
        marketSummary={marketSummary}
        loading={loading}
      />

      {/* SECTION 9 — AI CONCLUSION */}
      <AISignalSection
        ticker={selectedTicker}
        decisionData={decisionData}
        loading={loading}
      />

      {/* SECTION 10 — SIMPLE INSIGHTS */}
      <ThingsYouShouldKnow
        ticker={selectedTicker}
        liveData={liveData}
        marketSummary={marketSummary}
        decisionData={decisionData}
      />

      {/* SECTION 11 — COMPARE CRYPTOCURRENCIES */}
      <CryptoComparison />

      {/* SECTION 12 — EXPLORE MORE */}
      <ExploreCards selectedTicker={selectedTicker} />

      {/* SECTION 13 — TRUST / TRANSPARENCY */}
      <TrustSection />

      {/* SECTION 14 — DISCLAIMER */}
      <DisclaimerSection />
    </div>
  );
}

