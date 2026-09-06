"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useCrypto } from "@/lib/CryptoContext";
import {
  getLiveMarketData,
  getMarketSummary,
  getPrediction,
  getPredictionStatus,
  getDecisionSupport,
  triggerModelTraining,
  LiveMarketData,
  MarketSummaryResponse,
  CryptoPredictionResponse,
  ModelStatusResponse,
  CryptoDecisionResponse,
} from "@/lib/api";

import { PredictionPageHeader } from "@/components/prediction/PredictionPageHeader";
import { PreRunState } from "@/components/prediction/PreRunState";
import { AnalyzingState } from "@/components/prediction/AnalyzingState";
import { MainForecastResult } from "@/components/prediction/MainForecastResult";
import { PredictionScenarios } from "@/components/prediction/PredictionScenarios";
import { AIOutlookCard } from "@/components/prediction/AIOutlookCard";
import { ConfidenceAndRisk } from "@/components/prediction/ConfidenceAndRisk";
import { AIDecisionSupportSection } from "@/components/prediction/AIDecisionSupportSection";
import { WhatCouldChangeSection } from "@/components/prediction/WhatCouldChangeSection";
import { ForecastChart } from "@/components/prediction/ForecastChart";
import { DataUsedSection } from "@/components/prediction/DataUsedSection";
import { SimplifiedModelPerformance } from "@/components/prediction/SimplifiedModelPerformance";
import { CollapsibleTechnicalDetails } from "@/components/prediction/CollapsibleTechnicalDetails";
import { WhatsHappeningNowSection } from "@/components/prediction/WhatsHappeningNowSection";
import { WhereCouldItGoSection } from "@/components/prediction/WhereCouldItGoSection";
import { PredictionDisclaimer } from "@/components/prediction/PredictionDisclaimer";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/common/Card";

export default function PredictionCryptoPage() {
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

  const [hasRun, setHasRun] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticker) {
      setSelectedTicker(ticker);
    }
  }, [ticker, setSelectedTicker]);

  // Initial load of telemetry
  useEffect(() => {
    let isMounted = true;
    if (!ticker) return;

    setPageLoading(true);
    setHasRun(false);

    Promise.allSettled([
      getLiveMarketData(ticker),
      getMarketSummary(ticker),
      getPredictionStatus(ticker),
      getDecisionSupport(ticker),
    ]).then(([liveRes, summaryRes, statusRes, decisionRes]) => {
      if (!isMounted) return;

      if (liveRes.status === "fulfilled") setLiveData(liveRes.value);
      else setLiveData(null);

      if (summaryRes.status === "fulfilled") setMarketSummary(summaryRes.value);
      else setMarketSummary(null);

      if (statusRes.status === "fulfilled") setModelStatus(statusRes.value);
      else setModelStatus(null);

      if (decisionRes.status === "fulfilled") setDecisionData(decisionRes.value);
      else setDecisionData(null);

      setPageLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [ticker]);

  // Execute AI Inference
  const handleRunForecast = useCallback(async () => {
    if (!ticker) return;
    setAnalyzing(true);
    setError(null);

    try {
      const statusRes = await getPredictionStatus(ticker);
      setModelStatus(statusRes);

      if (statusRes.training_status === "insufficient_data") {
        setError("Insufficient historical data for reliable LSTM training.");
        setPrediction(null);
      } else if (statusRes.training_status === "not_started") {
        await triggerModelTraining(ticker);
        const predRes = await getPrediction(ticker);
        setPrediction(predRes);
      } else {
        const predRes = await getPrediction(ticker);
        setPrediction(predRes);
      }

      setHasRun(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate AI price forecast.");
      setPrediction(null);
    } finally {
      setAnalyzing(false);
    }
  }, [ticker]);

  const cryptoName = liveData?.name || marketSummary?.cryptocurrency || symbol;
  const isInsufficientHistory = modelStatus?.training_status === "insufficient_data";
  const isModelNotReady = modelStatus?.training_status === "not_started" && !prediction;

  return (
    <div className="space-y-10 pb-12">
      {/* 1. PAGE HEADER */}
      <PredictionPageHeader
        cryptoName={cryptoName}
        symbol={symbol}
        ticker={ticker}
        onRunForecast={handleRunForecast}
        loading={analyzing}
      />

      {/* 2. WHAT'S HAPPENING RIGHT NOW? */}
      <WhatsHappeningNowSection
        cryptoName={cryptoName}
        symbol={symbol}
        ticker={ticker}
        liveData={liveData}
        marketSummary={marketSummary}
        decisionData={decisionData}
        loading={pageLoading}
      />

      {/* STATE 1: ANALYZING LOADING STEP FLOW */}
      {analyzing ? (
        <AnalyzingState cryptoName={cryptoName} />
      ) : isInsufficientHistory ? (
        /* INSUFFICIENT HISTORY STATE */
        <Card variant="gradient" className="space-y-4 border-amber-500/30 text-center py-8">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Insufficient Historical Data</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            This cryptocurrency currently has {modelStatus?.available_history_days || 18} days of historical data. More historical information is required before the deep learning model can generate a forecast.
          </p>
        </Card>
      ) : isModelNotReady && hasRun ? (
        /* MODEL NOT TRAINED STATE */
        <Card variant="gradient" className="space-y-4 border-blue-500/30 text-center py-8">
          <AlertCircle className="w-8 h-8 text-blue-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">LSTM Model Not Ready</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            The cryptocurrency has sufficient historical data, but its prediction model is not currently ready.
          </p>
          <button
            onClick={handleRunForecast}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg inline-flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Train & Run Model</span>
          </button>
        </Card>
      ) : !hasRun ? (
        /* 3. BEFORE PREDICTION PRE-RUN STATE / CONTROL */
        <PreRunState
          cryptoName={cryptoName}
          ticker={ticker}
          modelStatus={modelStatus}
          liveData={liveData}
          onRunForecast={handleRunForecast}
        />
      ) : prediction && prediction.current_price > 0 && prediction.predicted_price > 0 ? (
        /* MAIN PREDICTION RESULT HIERARCHY */
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* 4. MAIN FORECAST RESULT & EXPECTED MOVEMENT */}
          <MainForecastResult
            cryptoName={cryptoName}
            ticker={ticker}
            prediction={prediction}
          />

          {/* 5. POSSIBLE FUTURE SCENARIOS & VISUAL RANGE */}
          <PredictionScenarios ticker={ticker} prediction={prediction} />

          {/* 6. AI OUTLOOK */}
          <AIOutlookCard prediction={prediction} />

          {/* 7. WHERE COULD IT GO? (FORECAST METRICS + FORECAST CHART) */}
          <WhereCouldItGoSection ticker={ticker} prediction={prediction} />

          {/* 8. FORECAST CONFIDENCE & MARKET RISK */}
          <ConfidenceAndRisk decisionData={decisionData} loading={pageLoading} />

          {/* 9. AI DECISION SUPPORT, SCORE & WHY THIS SIGNAL */}
          <AIDecisionSupportSection
            ticker={ticker}
            decisionData={decisionData}
            loading={pageLoading}
          />

          {/* 10. WHAT COULD CHANGE THIS FORECAST? */}
          <WhatCouldChangeSection />

          {/* 11. DATA USED FOR THIS FORECAST & FRESHNESS */}
          <DataUsedSection
            ticker={ticker}
            modelStatus={modelStatus}
            liveData={liveData}
            prediction={prediction}
          />

          {/* 12. HOW WELL THE MODEL PERFORMS */}
          <SimplifiedModelPerformance ticker={ticker} />

          {/* 13. COLLAPSIBLE TECHNICAL DETAILS */}
          <CollapsibleTechnicalDetails ticker={ticker} />

          {/* 14. DISCLAIMER */}
          <PredictionDisclaimer />
        </div>
      ) : (
        /* FALLBACK ERROR STATE */
        <Card variant="gradient" className="space-y-4 border-rose-500/30 text-center py-8">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Prediction Error</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {error || "Unable to generate prediction results for this asset at present."}
          </p>
          <button
            onClick={handleRunForecast}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg inline-flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Prediction</span>
          </button>
        </Card>
      )}
    </div>
  );
}
