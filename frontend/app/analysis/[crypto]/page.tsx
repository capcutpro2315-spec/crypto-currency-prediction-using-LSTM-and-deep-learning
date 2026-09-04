"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCrypto } from "@/lib/CryptoContext";
import {
  getLiveMarketData,
  getMarketSummary,
  getPrediction,
  getPredictionStatus,
  getDecisionSupport,
  getCryptocurrencies,
  LiveMarketData,
  MarketSummaryResponse,
  CryptoPredictionResponse,
  ModelStatusResponse,
  CryptoDecisionResponse,
} from "@/lib/api";

import { DetailHeader } from "@/components/detail/DetailHeader";
import { QuickSummary } from "@/components/detail/QuickSummary";
import { HappeningNow } from "@/components/detail/HappeningNow";
import { PriceJourney } from "@/components/detail/PriceJourney";
import { MarketBehaviorDetail } from "@/components/detail/MarketBehaviorDetail";
import { FutureOutlookDetail } from "@/components/detail/FutureOutlookDetail";
import { ScenarioCardsDetail } from "@/components/detail/ScenarioCardsDetail";
import { RiskOverviewDetail } from "@/components/detail/RiskOverviewDetail";
import { AISignalDetail } from "@/components/detail/AISignalDetail";
import { PriceOutlookChart } from "@/components/detail/PriceOutlookChart";
import { DataCoverageDetail } from "@/components/detail/DataCoverageDetail";
import { CoinComparisonDetail } from "@/components/detail/CoinComparisonDetail";
import { RelatedCryptos } from "@/components/detail/RelatedCryptos";
import { ActionBarDetail } from "@/components/detail/ActionBarDetail";
import { DisclaimerSection } from "@/components/home/DisclaimerSection";

export default function AnalysisCryptoPage() {
  const params = useParams();
  const rawCrypto = (params?.crypto as string) || "BTC-USD";
  const ticker = rawCrypto.includes("-") ? rawCrypto.toUpperCase() : `${rawCrypto.toUpperCase()}-USD`;
  const symbol = ticker.split("-")[0];

  const { setSelectedTicker } = useCrypto();

  const [liveData, setLiveData] = useState<LiveMarketData | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummaryResponse | null>(null);
  const [prediction, setPrediction] = useState<CryptoPredictionResponse | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [decisionData, setDecisionData] = useState<CryptoDecisionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync global context ticker
  useEffect(() => {
    if (ticker) {
      setSelectedTicker(ticker);
    }
  }, [ticker, setSelectedTicker]);

  // Fetch telemetry for dynamic selected coin
  useEffect(() => {
    let isMounted = true;
    if (!ticker) return;

    setLoading(true);

    Promise.allSettled([
      getLiveMarketData(ticker),
      getMarketSummary(ticker),
      getPrediction(ticker),
      getPredictionStatus(ticker),
      getDecisionSupport(ticker),
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
  }, [ticker]);

  const cryptoName = liveData?.name || marketSummary?.cryptocurrency || symbol;

  return (
    <div className="space-y-12 pb-12">
      {/* PAGE HEADER */}
      <DetailHeader
        ticker={ticker}
        symbol={symbol}
        cryptoName={cryptoName}
        liveData={liveData}
        marketSummary={marketSummary}
      />

      {/* SECTION 1 — QUICK SUMMARY (AT A GLANCE) */}
      <QuickSummary
        ticker={ticker}
        cryptoName={cryptoName}
        symbol={symbol}
        liveData={liveData}
        marketSummary={marketSummary}
        decisionData={decisionData}
        loading={loading}
      />

      {/* SECTION 2 — WHAT'S HAPPENING NOW? */}
      <HappeningNow
        cryptoName={cryptoName}
        symbol={symbol}
        liveData={liveData}
        marketSummary={marketSummary}
        decisionData={decisionData}
        loading={loading}
      />

      {/* SECTION 3 — PRICE JOURNEY (WHERE HAS IT BEEN?) */}
      <PriceJourney ticker={ticker} />

      {/* SECTION 4 — MARKET BEHAVIOR (HOW HAS IT BEEN BEHAVING?) */}
      <MarketBehaviorDetail
        ticker={ticker}
        cryptoName={cryptoName}
        liveData={liveData}
        marketSummary={marketSummary}
        decisionData={decisionData}
        loading={loading}
      />

      {/* SECTION 5 — FUTURE OUTLOOK (WHERE COULD IT GO?) */}
      <FutureOutlookDetail
        ticker={ticker}
        cryptoName={cryptoName}
        prediction={prediction}
        modelStatus={modelStatus}
        loading={loading}
      />

      {/* SECTION 6 — POSSIBLE SCENARIOS (WHAT COULD HAPPEN?) */}
      <ScenarioCardsDetail
        ticker={ticker}
        prediction={prediction}
        loading={loading}
      />

      {/* SECTION 7 — WHAT COULD GO WRONG? */}
      <RiskOverviewDetail
        ticker={ticker}
        cryptoName={cryptoName}
        decisionData={decisionData}
        liveData={liveData}
        marketSummary={marketSummary}
        loading={loading}
      />

      {/* SECTION 8 — WHAT DOES OUR ANALYSIS SAY? */}
      <AISignalDetail
        ticker={ticker}
        cryptoName={cryptoName}
        decisionData={decisionData}
        loading={loading}
      />

      {/* SECTION 9 — PRICE OUTLOOK CHART */}
      <PriceOutlookChart
        ticker={ticker}
        cryptoName={cryptoName}
        prediction={prediction}
        loading={loading}
      />

      {/* SECTION 10 — DATA COVERAGE (WHAT DATA DO WE HAVE?) */}
      <DataCoverageDetail
        ticker={ticker}
        cryptoName={cryptoName}
        liveData={liveData}
        marketSummary={marketSummary}
        prediction={prediction}
        modelStatus={modelStatus}
        decisionData={decisionData}
        loading={loading}
      />

      {/* SECTION 11 — COIN COMPARISON */}
      <CoinComparisonDetail currentTicker={ticker} />

      {/* SECTION 12 — RELATED CRYPTOCURRENCIES */}
      <RelatedCryptos currentTicker={ticker} />

      {/* SECTION 13 — ACTION BAR */}
      <ActionBarDetail ticker={ticker} cryptoName={cryptoName} />

      {/* SECTION 14 — DISCLAIMER */}
      <DisclaimerSection />
    </div>
  );
}

