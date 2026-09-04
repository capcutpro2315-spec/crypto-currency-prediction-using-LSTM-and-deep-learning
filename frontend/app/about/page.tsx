"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Info,
  Cpu,
  Code2,
  Database,
  ShieldAlert,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  HelpCircle,
  Activity,
  Zap,
  Sparkles,
  Sliders,
  Target,
  ShieldCheck,
  Scale,
  Clock,
  Grid,
  FileText,
  Check,
  X,
  TrendingUp,
  BarChart2,
  Lock,
  Search,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";

export default function AboutPage() {
  const [activePipelineStep, setActivePipelineStep] = useState<number | null>(0);
  const [showTechnicalArch, setShowTechnicalArch] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<"expected" | "best" | "worst">("expected");

  const pipelineSteps = [
    {
      id: "market_data",
      title: "Market Data",
      subtitle: "Live Telemetry",
      description:
        "Fetches current 24h market metrics (price, volume, 24h change, market cap) from CoinGecko, Binance, or Yahoo Finance.",
      icon: Activity,
      tag: "Data Ingestion",
    },
    {
      id: "historical_data",
      title: "Historical Data",
      subtitle: "OHLCV Series",
      description:
        "Retrieves clean daily historical price sequences used by the model to learn time-series behavior.",
      icon: Database,
      tag: "Time Series",
    },
    {
      id: "preprocessing",
      title: "Data Preprocessing",
      subtitle: "Cleaning & Split",
      description:
        "Cleans missing values and splits series chronologically into train (80%) and test (20%) sets to prevent data leakage.",
      icon: Sliders,
      tag: "Data Prep",
    },
    {
      id: "normalization",
      title: "Normalization",
      subtitle: "MinMax Scaling",
      description:
        "Scales price values into a bounded range (0 to 1) fitted ONLY on training data, enabling stable neural network gradient updates.",
      icon: Scale,
      tag: "Feature Scaling",
    },
    {
      id: "sequence_creation",
      title: "Sequence Creation",
      subtitle: "Sliding Window",
      description:
        "Transforms sequential price history into sliding 60-day input matrices (X) and next-day targets (y).",
      icon: Grid,
      tag: "Tensor Prep",
    },
    {
      id: "lstm_model",
      title: "LSTM Model",
      subtitle: "Deep Recurrent Network",
      description:
        "Processes historical sequences through a 2-layer Stacked LSTM network (64 & 32 units) with dropout layers.",
      icon: Cpu,
      tag: "Neural Engine",
    },
    {
      id: "price_forecast",
      title: "Price Forecast",
      subtitle: "Inverse Scaling",
      description:
        "Generates raw predicted output and applies inverse scaling to produce the next day's estimated USD closing price.",
      icon: TrendingUp,
      tag: "Inference",
    },
    {
      id: "risk_analysis",
      title: "Risk Analysis",
      subtitle: "Volatility & Error",
      description:
        "Calculates 30-day historical price volatility and penalties based on relative model prediction errors (RMSE/R²).",
      icon: ShieldAlert,
      tag: "Risk Engine",
    },
    {
      id: "decision_support",
      title: "AI Decision Support",
      subtitle: "Signal Matrix",
      description:
        "Combines price movement, risk score, and model confidence into an actionable CONSIDER, WAIT, or AVOID signal.",
      icon: Target,
      tag: "Decision Layer",
    },
    {
      id: "user_insight",
      title: "User Insight",
      subtitle: "Dashboard & Visuals",
      description:
        "Presents predicted values, scenario ranges, evaluation metrics, and explanatory factors in a clean fintech UI.",
      icon: Sparkles,
      tag: "Presentation",
    },
  ];

  return (
    <div className="space-y-16 py-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* ==================================================
          1. HERO SECTION
          ================================================== */}
      <section className="text-center space-y-6 pt-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide uppercase">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>DEEP LEARNING • LSTM • MARKET ANALYSIS</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          How Our AI Understands{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Cryptocurrency
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          From live market data to deep learning forecasts, our system analyzes cryptocurrency behavior to help users understand possible future price movements.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/prediction"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
          >
            <span>Explore AI Prediction</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/markets"
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all hover:scale-[1.02]"
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Explore Market Analysis</span>
          </Link>
        </div>
      </section>

      {/* ==================================================
          2. OUR GOAL
          ================================================== */}
      <section>
        <Card variant="gradient" className="p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="flex items-center space-x-3 text-blue-400 font-bold text-xl">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <Target className="w-6 h-6" />
            </div>
            <h2>Our Goal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300 leading-relaxed text-sm sm:text-base">
            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-white block text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" /> Why This System Exists
              </span>
              <p>
                Cryptocurrency prices can change rapidly, making it difficult to understand what may happen next. Our system combines historical market data, deep learning, and risk analysis to provide an understandable view of possible future price movement.
              </p>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
              <span className="font-semibold text-white block text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Beyond A Single Number
              </span>
              <p>
                We don't simply show a predicted number. We try to put that prediction into context by showing expected movement, possible scenarios, model confidence, market risk, and the factors behind the AI signal.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <p>
              <strong className="text-amber-200">No Guaranteed Predictions:</strong> Deep learning models identify statistical patterns in historical data, but cannot guarantee future returns or predict unexpected external market events.
            </p>
          </div>
        </Card>
      </section>

      {/* ==================================================
          3. WHAT THE SYSTEM DOES
          ================================================== */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">What The System Does</h2>
          <p className="text-sm text-slate-400">Three pillar architecture powering our decision-support platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="hover" className="space-y-4 border-blue-500/30">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
              1
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">STEP 1</span>
              <h3 className="text-xl font-bold text-white mt-1">UNDERSTAND</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Understand the current condition of a cryptocurrency through market data and historical trends.
            </p>
          </Card>

          <Card variant="hover" className="space-y-4 border-indigo-500/30">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
              2
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">STEP 2</span>
              <h3 className="text-xl font-bold text-white mt-1">PREDICT</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Use a Long Short-Term Memory (LSTM) deep learning model to estimate future price movement.
            </p>
          </Card>

          <Card variant="hover" className="space-y-4 border-emerald-500/30">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              3
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">STEP 3</span>
              <h3 className="text-xl font-bold text-white mt-1">EVALUATE</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Combine the forecast with model performance and market risk to provide decision-support information.
            </p>
          </Card>
        </div>
      </section>

      {/* ==================================================
          4. COMPLETE SYSTEM PIPELINE
          ================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Complete System Pipeline</h2>
            <p className="text-sm text-slate-400">Click or hover over any step to explore how data flows through the AI engine</p>
          </div>
          <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30 self-start sm:self-auto">
            10-Step Sequential Flow
          </span>
        </div>

        {/* Pipeline Navigation Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activePipelineStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActivePipelineStep(idx)}
                onMouseEnter={() => setActivePipelineStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-950/40 ring-1 ring-blue-500"
                    : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
                  <Icon className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                </div>
                <span className="text-xs font-bold truncate block">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Pipeline Active Step Detail Box */}
        {activePipelineStep !== null && (
          <Card variant="bordered" className="p-6 bg-slate-900/90 border-blue-500/40 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  {(() => {
                    const Icon = pipelineSteps[activePipelineStep].icon;
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-blue-400">STAGE 0{activePipelineStep + 1}</span>
                    <Badge variant="info" size="sm">
                      {pipelineSteps[activePipelineStep].tag}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {pipelineSteps[activePipelineStep].title} —{" "}
                    <span className="text-slate-400 font-normal">
                      {pipelineSteps[activePipelineStep].subtitle}
                    </span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <span>
                  Step {activePipelineStep + 1} of {pipelineSteps.length}
                </span>
              </div>
            </div>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {pipelineSteps[activePipelineStep].description}
            </p>
          </Card>
        )}
      </section>

      {/* ==================================================
          5. DATA COLLECTION
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 1 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">1. Market Data Collection</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            The system collects cryptocurrency market information such as historical prices and current market values from supported data providers.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Supported Market Data Fields (CoinGecko / Binance / Yahoo Finance)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              {[
                { label: "Current Price", icon: Activity },
                { label: "Historical Prices", icon: Database },
                { label: "Market Capitalization", icon: BarChart2 },
                { label: "Trading Volume", icon: TrendingUp },
                { label: "24-Hour Movement", icon: RefreshCw },
                { label: "Timestamps", icon: Clock },
              ].map((field, idx) => {
                const Icon = field.icon;
                return (
                  <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-center">
                    <Icon className="w-4 h-4 text-blue-400 mx-auto" />
                    <span className="font-semibold text-slate-200 block">{field.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 italic">
              Note: Field availability depends on the specific external provider returned during API query. Not all providers supply every field.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white">Data Freshness Architecture</h4>
            <p className="text-xs sm:text-sm text-slate-400">
              Current market data and historical training data have different freshness requirements. Live prices update frequently while model training is executed separately.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">LIVE MARKET DATA</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                </div>
                <p className="text-slate-300">
                  Frequent updates (~30–60 second in-memory cache) to show current market status.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider">MODEL TRAINING DATA</span>
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <p className="text-slate-300">
                  Updated/retrained separately (e.g. 24-hour cycle or on-demand background worker).
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ==================================================
          6. HISTORICAL DATA
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 2 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">2. Historical Price Analysis</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Historical cryptocurrency prices provide the patterns used by the deep learning model. Continuous daily closing price sequences are evaluated to learn trends and momentum.
          </p>

          {/* Visual Timeline Diagram */}
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block text-center">
              Historical Time-Series Continuum
            </span>

            <div className="relative py-6 flex items-center justify-between max-w-xl mx-auto">
              <div className="absolute left-0 right-0 h-1 bg-slate-800 top-1/2 -translate-y-1/2 z-0" />
              <div className="absolute left-1/4 right-1/4 h-1 bg-blue-500 top-1/2 -translate-y-1/2 z-0" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-500" />
                <span className="text-xs text-slate-400 mt-2 font-mono">Past</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-slate-950 shadow-lg shadow-blue-500/50 animate-pulse" />
                <span className="text-xs text-blue-400 font-bold mt-2 font-mono">Historical Prices</span>
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-slate-700 border-2 border-slate-500" />
                <span className="text-xs text-slate-400 mt-2 font-mono">Present</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            The amount of available history differs between cryptocurrencies. Established coins like Bitcoin have years of historical daily observations, while newly listed tokens may have a limited history.
          </p>
        </Card>
      </section>

      {/* ==================================================
          7. ADAPTIVE LOOKBACK
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 3 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">3. Adaptive Historical Data</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            To accommodate cryptocurrencies with varying dataset lengths, the system uses an adaptive historical data lookback framework.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <span className="font-bold text-emerald-400 block text-base">60+ Days History</span>
              <p className="text-slate-300">
                Configured standard lookback window (60 days). Used for established cryptocurrencies with abundant history.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-2">
              <span className="font-bold text-blue-400 block text-base">30–59 Days History</span>
              <p className="text-slate-300">
                Adaptive lookback equal to available history. Model is specifically trained/configured for that matching sequence length.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <span className="font-bold text-amber-400 block text-base">&lt; 30 Days History</span>
              <p className="text-slate-300">
                Below minimum requirement. Market information is displayed, but AI price prediction remains unavailable.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
              Important Technical Note on Neural Fixed Shapes
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              An existing fixed-shape LSTM neural network cannot accept an arbitrary input lookback without compatible layer shape configuration and training. The model must be trained with the exact same sequence/lookback configuration used during inference.
            </p>
          </div>

          {/* Visual Adaptive Flow */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-center gap-2 text-center">
            <span className="px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">AVAILABLE HISTORY</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">CHECK SUFFICIENCY</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-3 py-1.5 bg-blue-950 text-blue-400 rounded-lg border border-blue-800">SELECT VALID LOOKBACK</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-3 py-1.5 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800">TRAINED COMPATIBLE MODEL</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="px-3 py-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">PREDICTION</span>
          </div>
        </Card>
      </section>

      {/* ==================================================
          8. DATA PREPROCESSING
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 4 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">4. Preparing Data for the AI</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Raw cryptocurrency prices vary widely in magnitude (e.g. Bitcoin at $60,000 vs. Shiba Inu at $0.00002). Raw values are transformed into a normalized format suitable for the neural network.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans font-bold">1. Raw Prices</span>
              <span className="text-[10px] text-slate-500">OHLCV USD</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans font-bold">2. Cleaning</span>
              <span className="text-[10px] text-slate-500">Null check</span>
            </div>
            <div className="p-3 bg-blue-950/60 text-blue-300 rounded-xl border border-blue-800">
              <span className="block font-sans font-bold">3. MinMax Scale</span>
              <span className="text-[10px] text-blue-400">[0, 1] Range</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans font-bold">4. Sequences</span>
              <span className="text-[10px] text-slate-500">Sliding Window</span>
            </div>
            <div className="p-3 bg-indigo-950/60 text-indigo-300 rounded-xl border border-indigo-800">
              <span className="block font-sans font-bold">5. Feed LSTM</span>
              <span className="text-[10px] text-indigo-400">Tensor Input</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
              MinMaxScaler Explanation
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Min-Max scaling transforms raw price values into a bounded range between 0 and 1. This prevents large absolute price numbers from distorting neural network weights during gradient descent. Crucially, the scaler is fit <strong>only on training set data</strong> to prevent future-data leakage into test evaluations.
            </p>
          </div>
        </Card>
      </section>

      {/* ==================================================
          9. WHY LSTM?
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 5 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">5. Why LSTM?</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            LSTM (Long Short-Term Memory) is a specialized type of recurrent neural network (RNN) designed to work with sequential time-series data.
          </p>

          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Cryptocurrency prices are sequential observations. The chronological order of previous days matters significantly. Unlike traditional feedforward networks, an LSTM uses specialized internal memory gates (Input Gate, Forget Gate, Output Gate) to retain context across long price sequences without suffering from vanishing gradients.
          </p>

          {/* Simple Visual Diagram */}
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block text-center">
              Sequential Memory Flow Example
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">Price T-5</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">Price T-4</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">Price T-3</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">Price T-2</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">Price T-1</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
              <span className="p-2.5 bg-blue-950 border border-blue-500 rounded-lg text-blue-300 font-bold">LSTM NEURAL NET</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
              <span className="p-2.5 bg-emerald-950 border border-emerald-500 rounded-lg text-emerald-300 font-bold">Future Price (T)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <p>
              LSTM models detect statistical momentum in numerical price histories, but cannot anticipate unexpected real-world events such as regulatory news, macroeconomic shocks, or sudden exchange outages.
            </p>
          </div>
        </Card>
      </section>

      {/* ==================================================
          10. TRAINING THE MODEL
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 6 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">6. Training the LSTM Model</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Model training is performed offline or asynchronously via background workers. The trained network weights are compiled and saved into serialized `.keras` model artifacts alongside JSON metadata.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans font-bold">1. History</span>
              <span className="text-[10px] text-slate-500">OHLCV Data</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans font-bold">2. Sequences</span>
              <span className="text-[10px] text-slate-500">X, y Arrays</span>
            </div>
            <div className="p-3 bg-blue-950/60 text-blue-300 rounded-xl border border-blue-800">
              <span className="block font-sans font-bold">3. LSTM</span>
              <span className="text-[10px] text-blue-400">2-Layer Stack</span>
            </div>
            <div className="p-3 bg-indigo-950/60 text-indigo-300 rounded-xl border border-indigo-800">
              <span className="block font-sans font-bold">4. Learn</span>
              <span className="text-[10px] text-indigo-400">Adam / MSE</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans font-bold">5. Validate</span>
              <span className="text-[10px] text-slate-500">Test Set</span>
            </div>
            <div className="p-3 bg-emerald-950/60 text-emerald-300 rounded-xl border border-emerald-800">
              <span className="block font-sans font-bold">6. Save Artifact</span>
              <span className="text-[10px] text-emerald-400">.keras & .json</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Operational Distinction: Live Market vs Training Cycle
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              The model is <strong>not retrained every minute</strong> simply because live market prices refresh. Live market feeds update current prices on-screen, while model retraining is executed on separate 24-hour schedules or background job triggers.
            </p>
          </div>
        </Card>
      </section>

      {/* ==================================================
          11. MAKING A PREDICTION
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 7 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">7. Generating the Forecast</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            When a user selects a cryptocurrency, the system retrieves valid historical data, applies the required preprocessing, and sends the latest sequence to the trained LSTM model for inference.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block font-sans font-bold">1. LSTM Output</span>
              <span className="text-[10px] text-slate-500">Scaled prediction [0-1]</span>
            </div>
            <div className="p-3 bg-blue-950/60 text-blue-300 rounded-xl border border-blue-800">
              <span className="block font-sans font-bold">2. Inverse Scaling</span>
              <span className="text-[10px] text-blue-400">Convert back to USD</span>
            </div>
            <div className="p-3 bg-indigo-950/60 text-indigo-300 rounded-xl border border-indigo-800">
              <span className="block font-sans font-bold">3. Predicted Price</span>
              <span className="text-[10px] text-indigo-400">Target Day Forecast</span>
            </div>
            <div className="p-3 bg-emerald-950/60 text-emerald-300 rounded-xl border border-emerald-800">
              <span className="block font-sans font-bold">4. Expected Movement</span>
              <span className="text-[10px] text-emerald-400">Percentage % Change</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Expected Percentage Change Formula
            </span>
            <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-blue-300 text-center overflow-x-auto">
              Expected Change % = ((Predicted Price - Current Price) / Current Price) × 100
            </div>
          </div>
        </Card>
      </section>

      {/* ==================================================
          12. BEST / EXPECTED / WORST CASE
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 8 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">8. Possible Future Scenarios</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            A single predicted price does not describe all possible outcomes. Our decision-support layer can represent the forecast using multiple scenarios to reflect potential market volatility.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">BEST CASE</span>
              <h4 className="text-base font-bold text-white">Optimistic Outcome</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                An optimistic scenario representing upper target bounds under highly favorable market conditions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">EXPECTED CASE</span>
              <h4 className="text-base font-bold text-white">Central AI Forecast</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The central baseline prediction produced by the trained LSTM neural network.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">WORST CASE</span>
              <h4 className="text-base font-bold text-white">Downside Outcome</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                A downside scenario representing potential lower support levels under unfavorable market conditions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Implementation Note on Scenarios:</span>
            <p>
              The backend calculates Best Case and Worst Case scenarios using statistical uncertainty bounds based on held-out test set Root Mean Squared Error (RMSE × 1.25) when model evaluation metrics exist. If evaluation metrics are not yet available, the UI cleanly displays &quot;Scenario analysis unavailable&quot; without fabricating fake bounds.
            </p>
          </div>
        </Card>
      </section>

      {/* ==================================================
          13. RISK ANALYSIS
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 9 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">9. Understanding Risk</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Cryptocurrency prediction is inherently uncertain. The system therefore considers risk separately from the predicted price.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Implemented Factors */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Implemented Risk Factors</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>Price Volatility:</strong> 30-day standard deviation of daily percentage returns.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>Forecast Magnitude:</strong> Large expected price swings increase risk rating.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>Historical Data Availability:</strong> Shorter history increases uncertainty penalty.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">•</span>
                  <span><strong>Model Test Performance:</strong> Low test R² or high RMSE reduces confidence.</span>
                </li>
              </ul>
            </div>

            {/* Planned Enhancements */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Planned Risk Enhancements</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>Order Book Liquidity Depth:</strong> Planned enhancement.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>Social News Sentiment Index:</strong> Planned enhancement.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span><strong>Macroeconomic Interest Volatility:</strong> Planned enhancement.</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* ==================================================
          14. AI DECISION SUPPORT
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">STEP 10 OF PIPELINE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">10. From Prediction to AI Insight</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            The predicted price alone is not presented as an investment recommendation. The decision-support layer puts the forecast into context using available model and market information.
          </p>

          {/* Decision Support Matrix Diagram */}
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block text-center">
              AI Decision Synthesis Formula
            </span>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-blue-400">Forecast Movement</span>
              <span className="text-slate-500">+</span>
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-amber-400">Market Volatility</span>
              <span className="text-slate-500">+</span>
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-indigo-400">Model Confidence</span>
              <span className="text-slate-500">+</span>
              <span className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">Data Length</span>
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span className="p-2.5 bg-blue-950 border border-blue-500 rounded-lg text-white font-bold">
                CONSIDER / WAIT / AVOID
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <span className="font-extrabold text-emerald-400 text-lg block">CONSIDER</span>
              <p className="text-xs text-slate-300">Positive forecast with acceptable model confidence and controlled risk.</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="font-extrabold text-amber-400 text-lg block">WAIT</span>
              <p className="text-xs text-slate-300">Neutral forecast or elevated risk/uncertainty requiring observation.</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
              <span className="font-extrabold text-rose-400 text-lg block">AVOID</span>
              <p className="text-xs text-slate-300">Negative forecast, high volatility penalty, or low model confidence.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <strong className="text-slate-200">Decision Signal Disclaimer:</strong> CONSIDER / WAIT / AVOID is an AI-generated decision-support signal for educational analysis, not a guarantee of future returns or personalized financial advice.
          </div>
        </Card>
      </section>

      {/* ==================================================
          15. MODEL PERFORMANCE
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">EVALUATION METRICS</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">11. How Do We Evaluate the Model?</h2>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Model predictions are rigorously evaluated against unseen test-set prices using standard statistical regression metrics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card variant="hover" className="space-y-2 border-blue-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-400 font-bold">METRIC 1</span>
              <Badge variant="info">R² Score</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">R² (Coefficient of Determination)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Shows how well the model explains variation in the observed price data. An R² close to 1.0 indicates strong pattern capture.
            </p>
          </Card>

          <Card variant="hover" className="space-y-2 border-indigo-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-indigo-400 font-bold">METRIC 2</span>
              <Badge variant="neutral">RMSE</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">Typical Prediction Error (RMSE)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Measures the typical size of prediction errors in the same units as the target price (USD), with larger errors receiving more weight.
            </p>
          </Card>

          <Card variant="hover" className="space-y-2 border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 font-bold">METRIC 3</span>
              <Badge variant="success">MAE</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">Average Prediction Error (MAE)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Measures the average absolute difference between predicted and actual price values across the test evaluation period.
            </p>
          </Card>

          <Card variant="hover" className="space-y-2 border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 font-bold">METRIC 4</span>
              <Badge variant="warning">MSE</Badge>
            </div>
            <h3 className="text-lg font-bold text-white">Prediction Error Loss (MSE)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Measures the average squared prediction error, giving larger errors greater influence during model training loss optimization.
            </p>
          </Card>
        </div>
      </section>

      {/* ==================================================
          16. DATA FRESHNESS
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">SYSTEM DESIGN</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">12. Keeping Information Fresh</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            The platform explicitly separates real-time market telemetry streaming from neural network retraining tasks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-blue-400 uppercase tracking-wider block">LIVE MARKET DATA</span>
              <p className="text-slate-300">
                Frequently refreshed current prices, volume, and 24h market metrics from API providers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-indigo-400 uppercase tracking-wider block">HISTORICAL DATA</span>
              <p className="text-slate-300">
                Stored daily OHLCV datasets used for sequence generation and trend evaluation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider block">MODEL ARTIFACT</span>
              <p className="text-slate-300">
                Trained and cached separately. The neural network is not retrained every minute.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ==================================================
          17. NEW CRYPTOCURRENCIES
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">CATALOG ARCHITECTURE</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">13. Supporting a Growing Crypto Market</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            The system is designed to work with a dynamically discovered cryptocurrency catalog rather than relying only on a fixed list of coins.
          </p>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Newly Discovered Coin Readiness Matrix
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-sans">Market Data</span>
                <span className="text-emerald-400 font-bold text-sm">✓ Available</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-sans">Historical Data</span>
                <span className="text-blue-400 font-bold text-sm">✓ / Limited</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-sans">Prediction Model</span>
                <span className="text-amber-400 font-bold text-sm">✓ / Training</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-slate-400 block font-sans">AI Prediction</span>
                <span className="text-indigo-400 font-bold text-sm">✓ / Pending</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            This design is intentional: a cryptocurrency will <strong>not disappear</strong> from market listings simply because an LSTM prediction model is not yet trained or available.
          </p>
        </Card>
      </section>

      {/* ==================================================
          18. LIMITATIONS
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="warning">MODEL LIMITATIONS</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">14. What the AI Cannot Know</h2>
        </div>

        <Card variant="bordered" className="p-6 border-amber-500/30 bg-amber-950/10 space-y-4">
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            The model is based on available historical price data and cannot reliably anticipate unexpected real-world external events:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              "Unexpected breaking news & media coverage",
              "Government regulatory policy changes",
              "Market-wide macroeconomic crashes",
              "Sudden exchange liquidity shocks",
              "Major geopolitical events",
              "Abnormal market manipulation or pumps",
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center space-x-2 text-slate-300">
                <X className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 italic">
            Historical price LSTM models evaluate continuous numerical series and do not analyze news sentiment unless a sentiment model is explicitly attached.
          </p>
        </Card>
      </section>

      {/* ==================================================
          19. SIMPLE EXAMPLE
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">BEGINNER WALKTHROUGH</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">15. From Data to Decision</h2>
        </div>

        <Card variant="default" className="p-6 space-y-6">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Step-by-step example of how the platform transforms raw inputs into actionable decision-support information for a user:
          </p>

          <div className="space-y-3 text-xs sm:text-sm">
            {[
              { step: "1. User Selects Asset", desc: "User picks a cryptocurrency (e.g. BTC, ETH, or SOL) from the catalog." },
              { step: "2. Live Market Data Fetched", desc: "System fetches current market price, 24h volume, and 24h change." },
              { step: "3. History Checked", desc: "System verifies available historical daily price records." },
              { step: "4. Sufficiency Validated", desc: "Checks if valid lookback window exists (e.g. 60+ days)." },
              { step: "5. Forecast Generated", desc: "Preprocessed sequences are sent to the trained LSTM model for inference." },
              { step: "6. Risk & Metrics Evaluated", desc: "Volatility, confidence score, and error metrics are synthesized." },
              { step: "7. User Dashboard Display", desc: "User views Current Price, Predicted Price, Scenarios, Confidence, Risk, and AI Signal." },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.step}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ==================================================
          20. TECHNICAL ARCHITECTURE (Collapsible)
          ================================================== */}
      <section className="space-y-4">
        <button
          onClick={() => setShowTechnicalArch(!showTechnicalArch)}
          className="w-full p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-all text-left group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-indigo-400 block uppercase">ACADEMIC & DEVELOPER ARCHITECTURE</span>
              <h3 className="text-lg font-bold text-white">View Full Technical Architecture</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-400 group-hover:text-white">
            <span className="text-xs font-mono hidden sm:inline">{showTechnicalArch ? "Hide Diagram" : "Expand Diagram"}</span>
            {showTechnicalArch ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showTechnicalArch && (
          <Card variant="bordered" className="p-6 space-y-6 bg-slate-950 border-indigo-500/40">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              System Component Architecture & Data Flow
            </h4>

            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3 leading-relaxed overflow-x-auto">
              <div className="flex flex-col space-y-2 min-w-[600px]">
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-blue-400">
                  Frontend UI (Next.js 14 / React 18 / TypeScript / Tailwind CSS / Recharts)
                </div>
                <div className="text-center text-slate-600">↓ REST API HTTP Request</div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-indigo-400">
                  Backend API Router (Python 3.11 / FastAPI / Pydantic Schemas)
                </div>
                <div className="text-center text-slate-600">↓ Provider Resolution</div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-emerald-400">
                  Data Service (CoinGecko REST API / Binance / Yahoo Finance yfinance)
                </div>
                <div className="text-center text-slate-600">↓ Cleaned Dataframe</div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-amber-400">
                  Preprocessing Pipeline (MinMaxScaler fit on Train Set / Sliding Window 60d)
                </div>
                <div className="text-center text-slate-600">↓ Tensor Input (X_test)</div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-purple-400">
                  LSTM Deep Learning Model (TensorFlow / Keras Stacked 64-32 LSTM + Dropout)
                </div>
                <div className="text-center text-slate-600">↓ Inference Raw Output & Inverse Scaling</div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-rose-400">
                  Risk & Decision Support Engine (Volatility, Confidence, R²/RMSE Penalty, CONSIDER/WAIT/AVOID)
                </div>
                <div className="text-center text-slate-600">↓ JSON API Response</div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 text-blue-400">
                  Frontend Render (Interactive Charts, Metrics Cards, AI Signals)
                </div>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* ==================================================
          21. PROJECT TECHNOLOGY
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">VERIFIED CODEBASE TECH STACK</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">17. Technology Stack</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <Card variant="hover" className="space-y-2 border-blue-500/30">
            <span className="font-bold text-blue-400 text-sm block">Frontend</span>
            <p className="text-slate-300">Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons</p>
          </Card>

          <Card variant="hover" className="space-y-2 border-indigo-500/30">
            <span className="font-bold text-indigo-400 text-sm block">Backend API</span>
            <p className="text-slate-300">Python 3.11+, FastAPI, Uvicorn ASGI, Pydantic v2 schemas, Pytest</p>
          </Card>

          <Card variant="hover" className="space-y-2 border-emerald-500/30">
            <span className="font-bold text-emerald-400 text-sm block">Machine Learning</span>
            <p className="text-slate-300">TensorFlow 2.16+ / Keras, Scikit-Learn, Pandas, NumPy, yfinance</p>
          </Card>

          <Card variant="hover" className="space-y-2 border-amber-500/30">
            <span className="font-bold text-amber-400 text-sm block">Data Providers</span>
            <p className="text-slate-300">CoinGecko Public API, Binance API, Yahoo Finance</p>
          </Card>
        </div>
      </section>

      {/* ==================================================
          22. PROJECT FLOW FOR EVALUATORS
          ================================================== */}
      <section className="space-y-6">
        <div className="space-y-2">
          <Badge variant="info">ACADEMIC REVIEW</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">18. Project Flow at a Glance</h2>
        </div>

        <Card variant="default" className="p-6 space-y-4">
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Comprehensive 12-step summary prepared for project evaluators and academic presentation defense:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {[
              "1. Cryptocurrency Selection",
              "2. Market Data Retrieval",
              "3. Historical Data Retrieval",
              "4. Data Validation",
              "5. Preprocessing",
              "6. Sequence Creation",
              "7. LSTM Prediction",
              "8. Inverse Scaling",
              "9. Forecast Evaluation",
              "10. Risk Analysis",
              "11. Decision Support",
              "12. User Presentation",
            ].map((step, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-semibold flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ==================================================
          23. DISCLAIMER
          ================================================== */}
      <section>
        <Card variant="bordered" className="p-6 border-amber-500/40 bg-amber-950/10 space-y-3">
          <div className="flex items-center space-x-3 text-amber-400 font-bold text-lg">
            <ShieldAlert className="w-5 h-5" />
            <h2>Important Disclaimer</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Cryptocurrency markets are highly volatile. AI forecasts are estimates based on available historical and market data and may differ significantly from actual future prices. This platform is intended for educational and decision-support purposes and does not provide personalized financial advice or guarantee investment returns.
          </p>
        </Card>
      </section>
    </div>
  );
}

