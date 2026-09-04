"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, Clock, Activity } from "lucide-react";

interface DashboardHeaderProps {
  lastUpdatedTimestamp?: string | null;
}

export function DashboardHeader({ lastUpdatedTimestamp }: DashboardHeaderProps) {
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      if (lastUpdatedTimestamp) {
        try {
          const date = new Date(lastUpdatedTimestamp);
          setTimeString(date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
          return;
        } catch {
          // fallback to current time
        }
      }
      setTimeString(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastUpdatedTimestamp]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-400">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Bloomberg-Style Command Center</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Crypto Intelligence Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Monitor market conditions, discover cryptocurrencies, and explore AI-powered forecasts.
        </p>
      </div>

      {/* Top-Right Status Controls */}
      <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Market Status: LIVE</span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{timeString || "Live"}</span>
        </div>
      </div>
    </div>
  );
}
