"use client";

import Link from "next/link";
import { HelpCircle, Database, Layers, Cpu, TrendingUp, ShieldCheck, ArrowRight, Activity, FileText } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Market Data Collection",
      summary: "Ingesting daily historical OHLCV records (Open, High, Low, Close, Volume) from remote crypto providers.",
      detail: "Clean historical time series datasets spanning up to 365 trading days are ingested to ensure continuous sequence modeling.",
      icon: Database,
    },
    {
      num: "02",
      title: "Data Preprocessing & Feature Scaling",
      summary: "Normalizing continuous price records using MinMaxScaler to bound values strictly between 0 and 1.",
      detail: "Deep learning models require feature scaling to prevent exploding gradients during backpropagation. Prices are scaled using MinMax normalization before training.",
      icon: Layers,
    },
    {
      num: "03",
      title: "Sequence Formatting (60 Day Lookback)",
      summary: "Structuring historical data into sliding 60 day sequence windows for temporal pattern extraction.",
      detail: "The LSTM network takes 60 consecutive daily closing prices to learn short term momentum, volatility regimes, and trend acceleration.",
      icon: Activity,
    },
    {
      num: "04",
      title: "Stacked LSTM Deep Learning Network",
      summary: "Training 2 layer stacked Long Short Term Memory neural network with dropout regularization.",
      detail: "LSTM recurrent neural networks maintain cell memory state across sequences, capturing long range dependencies in financial time series.",
      icon: Cpu,
    },
    {
      num: "05",
      title: "Price Prediction Generation",
      summary: "Inverting model scale outputs back to original USD units to generate the next daily closing price forecast.",
      detail: "The model outputs normalized next day predictions, which are transformed via inverse scaling to output realistic price predictions ($USD).",
      icon: TrendingUp,
    },
    {
      num: "06",
      title: "Risk & Volatility Quantification",
      summary: "Calculating standard deviation of returns and evaluating historical test set error metrics.",
      detail: "Risk profiles (Low, Moderate, High) are evaluated using historical test RMSE, MAE, R² score, and 30 day market return volatility.",
      icon: Activity,
    },
    {
      num: "07",
      title: "AI Decision Support Signal",
      summary: "Synthesizing price forecast, model confidence, and volatility into a clear support signal.",
      detail: "An algorithmic decision engine outputs CONSIDER (Favorable), WAIT (Cautious), or AVOID (High Risk) alongside explicit supporting factors and risk hazards.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="info" size="md" icon={<HelpCircle className="w-3.5 h-3.5" />}>
          AI METHODOLOGY & ARCHITECTURE
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How CryptoPredict AI Works
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          From raw market feeds to deep learning neural network forecasts and decision support signals. Understand the 7 step pipeline powering our system.
        </p>
      </div>

      {/* 7 Step Interactive Pipeline List */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.num} variant="hover" className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-sm font-mono font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-xl">
                  {step.num}
                </span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-blue-400">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-300 font-medium">{step.summary}</p>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  {step.detail}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CTA Box */}
      <Card variant="gradient" className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 p-8 border-blue-500/30">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-white">Ready to Explore AI Forecasts?</h3>
          <p className="text-xs text-slate-300">
            Select any cryptocurrency to view daily price predictions, scenario distributions, and decision signals.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Button href="/markets" variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore Cryptocurrencies
          </Button>
        </div>
      </Card>
    </div>
  );
}
