"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, ChevronRight, Cpu } from "lucide-react";
import { CryptoAsset } from "@/lib/api";
import { Badge } from "@/components/common/Badge";
import { useCrypto } from "@/lib/CryptoContext";

interface CryptoCardProps {
  crypto: CryptoAsset;
}

export function CryptoCard({ crypto }: CryptoCardProps) {
  const { setSelectedTicker } = useCrypto();
  const ticker = crypto.ticker || `${crypto.symbol.toUpperCase()}-USD`;

  return (
    <div
      onClick={() => setSelectedTicker(ticker)}
      className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 backdrop-blur-sm transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-blue-950/20 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {crypto.image ? (
              <img src={crypto.image} alt={crypto.name} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                {crypto.symbol.slice(0, 3).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                {crypto.name}
              </h3>
              <span className="text-xs font-mono text-slate-400 uppercase">{crypto.symbol}</span>
            </div>
          </div>

          {crypto.model_available || crypto.has_trained_model ? (
            <Badge variant="success" size="sm" icon={<Cpu className="w-3 h-3" />}>
              AI Ready
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Catalog
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <Link
          href={`/analysis/${encodeURIComponent(ticker)}`}
          className="text-xs font-medium text-slate-300 group-hover:text-blue-400 flex items-center space-x-1"
        >
          <span>Market Analysis</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href={`/prediction/${encodeURIComponent(ticker)}`}
          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-medium transition-colors"
        >
          Run AI Forecast
        </Link>
      </div>
    </div>
  );
}
