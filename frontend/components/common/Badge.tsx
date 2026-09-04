"use client";

import React from "react";
import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "md", icon, className }: BadgeProps) {
  const baseStyles = "inline-flex items-center font-medium rounded-full border";

  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    neutral: "bg-slate-800/80 text-slate-300 border-slate-700",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-xs gap-1.5",
  };

  return (
    <span className={clsx(baseStyles, variants[variant], sizes[size], className)}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
