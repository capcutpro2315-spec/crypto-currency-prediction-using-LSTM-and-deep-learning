"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCrypto } from "@/lib/CryptoContext";
import { LoadingState } from "@/components/common/LoadingState";

export default function MarketAnalysisRedirect() {
  const { selectedTicker } = useCrypto();
  const router = useRouter();

  useEffect(() => {
    const target = selectedTicker || "BTC-USD";
    router.replace(`/analysis/${encodeURIComponent(target)}`);
  }, [selectedTicker, router]);

  return <LoadingState message="Loading Market Analysis workspace..." />;
}
