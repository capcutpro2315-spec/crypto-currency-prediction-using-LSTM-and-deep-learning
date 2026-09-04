"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCrypto } from "@/lib/CryptoContext";
import { LoadingState } from "@/components/common/LoadingState";

export default function DecisionRedirectPage() {
  const { selectedTicker } = useCrypto();
  const router = useRouter();

  useEffect(() => {
    const target = selectedTicker || "BTC-USD";
    router.replace(`/decision/${encodeURIComponent(target)}`);
  }, [selectedTicker, router]);

  return <LoadingState message="Opening AI Decision Support workspace..." />;
}
