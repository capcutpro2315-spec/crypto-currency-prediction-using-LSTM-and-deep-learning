"use client";

import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hover" | "bordered" | "gradient";
}

export function Card({ children, className, variant = "default" }: CardProps) {
  const baseStyles = "rounded-2xl p-6 transition-all duration-200";

  const variants = {
    default: "bg-slate-900/70 border border-slate-800 backdrop-blur-md",
    hover:
      "bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-950/20 backdrop-blur-md",
    bordered: "bg-slate-950/80 border border-slate-700/60 backdrop-blur-sm",
    gradient:
      "bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl",
  };

  return <div className={clsx(baseStyles, variants[variant], className)}>{children}</div>;
}
