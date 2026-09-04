"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCrypto } from "@/lib/CryptoContext";
import { LoadingState } from "@/components/common/LoadingState";

function PredictionRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedTicker } = useCrypto();

  useEffect(() => {
    const tickerFromUrl = searchParams.get("ticker");
    const targetTicker = tickerFromUrl || selectedTicker || "BTC-USD";
    router.replace(`/prediction/${encodeURIComponent(targetTicker)}`);
  }, [searchParams, selectedTicker, router]);

  return <LoadingState message="Opening AI Prediction workspace..." />;
}

export default function PredictionPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading prediction workspace..." />}>
      <PredictionRedirectContent />
    </Suspense>
  );
}
