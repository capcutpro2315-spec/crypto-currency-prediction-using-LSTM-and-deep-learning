"use client";

import React from "react";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "hover" | "bordered" | "gradient";
}

export function Card({ children, className, variant = "default" }: CardProps) {
  const baseStyles = "rounded-xl p-6 transition-all duration-200";

  const variants = {
    default: "bg-[#0d1322]/90 border border-slate-800/80 backdrop-blur-sm",
    hover:
      "bg-[#0d1322]/90 border border-slate-800/80 hover:border-slate-700/90 hover:bg-[#10182b] transition-all backdrop-blur-sm",
    bordered: "bg-[#090d16] border border-slate-800/90",
    gradient:
      "bg-gradient-to-b from-[#0f172a] to-[#0b101d] border border-slate-800/80 backdrop-blur-md",
  };

  return <div className={clsx(baseStyles, variants[variant], className)}>{children}</div>;
}
