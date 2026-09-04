"use client";

import Link from "next/link";
import { TrendingUp, ShieldAlert, Cpu, Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a12] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Purpose */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-[#0b0f19] rounded-[6px] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold text-white">CryptoPredict AI</span>
              <p className="text-xs text-slate-500">AI Powered Cryptocurrency Analysis</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Helping users understand cryptocurrency market conditions and evaluate risk using deep learning predictions, quantitative volatility metrics, and dynamic decision support.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Platform Routes</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/markets" className="hover:text-blue-400 transition-colors">Cryptocurrency Explorer</Link>
            </li>
            <li>
              <Link href="/prediction" className="hover:text-blue-400 transition-colors">AI Price Forecasting</Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-blue-400 transition-colors">How AI Works</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-blue-400 transition-colors">About & Methodology</Link>
            </li>
          </ul>
        </div>

        {/* Academic Disclaimer */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-amber-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Academic Disclaimer</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Educational & research project. AI price forecasts, risk scores, and signals do NOT constitute financial advice. Crypto markets are volatile.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 CryptoPredict AI — Cryptocurrency Price Prediction System Using Deep Learning</p>
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>LSTM Neural Network</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
