"use client";

import React from "react";
import Link from "next/link";
import { HelpCircle, Home, ArrowLeft } from "lucide-react";
import { Card } from "@/components/common/Card";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card variant="bordered" className="max-w-md w-full p-8 text-center space-y-6 border-slate-800">
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl w-fit mx-auto border border-blue-500/20">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white">Page Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested page or cryptocurrency resource could not be located in our catalog.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/markets"
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Explore Markets</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
