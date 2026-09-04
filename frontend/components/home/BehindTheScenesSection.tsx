"use client";

import { Database, Activity, Layers, Cpu, TrendingUp, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

export function BehindTheScenesSection() {
  const steps = [
    { title: "LIVE MARKET DATA", desc: "Real-time OHLCV Ingestion", icon: Database },
    { title: "HISTORICAL PATTERNS", desc: "365-Day Time Series", icon: Activity },
    { title: "DATA PROCESSING", desc: "MinMax Feature Scaling", icon: Layers },
    { title: "LSTM DEEP LEARNING", desc: "60-Day Stacked Sequences", icon: Cpu },
    { title: "PRICE FORECAST", desc: "Next-Day Inverse Scaling", icon: TrendingUp },
    { title: "RISK + CONFIDENCE", desc: "Test Error & Volatility", icon: Activity },
    { title: "AI DECISION SUPPORT", desc: "Synthesized Action Signal", icon: ShieldCheck },
  ];

  return (
    <Card variant="gradient" className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Badge variant="info" size="sm" icon={<Cpu className="w-3.5 h-3.5" />}>
          TRANSPARENT SYSTEM ARCHITECTURE
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          WHAT HAPPENS BEHIND THE SCENES?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Complex calculations happen in the background. We present the important results in a simple, actionable way.
        </p>
      </div>

      {/* Horizontal / Grid Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center space-y-2 relative group hover:border-blue-500/50 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white leading-tight">{step.title}</span>
              <span className="text-[10px] text-slate-500">{step.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Action link to How It Works */}
      <div className="text-center pt-2">
        <Button href="/how-it-works" variant="outline" size="md" icon={<HelpCircle className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
          How does the AI work? Read Detailed Methodology
        </Button>
      </div>
    </Card>
  );
}
