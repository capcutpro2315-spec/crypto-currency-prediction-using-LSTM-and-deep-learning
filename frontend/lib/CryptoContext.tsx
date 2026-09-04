"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CryptoContextType {
  selectedTicker: string;
  setSelectedTicker: (ticker: string) => void;
}

const CryptoContext = createContext<CryptoContextType>({
  selectedTicker: "BTC-USD",
  setSelectedTicker: () => {},
});

export const CryptoProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedTicker, setSelectedTickerState] = useState<string>("BTC-USD");

  useEffect(() => {
    const saved = localStorage.getItem("crypto_selected_ticker");
    if (saved) {
      setSelectedTickerState(saved);
    }
  }, []);

  const setSelectedTicker = (ticker: string) => {
    if (!ticker) return;
    // Normalize clean symbol to ticker if needed (e.g. BTC -> BTC-USD)
    const normalized = ticker.includes("-") ? ticker : `${ticker.toUpperCase()}-USD`;
    setSelectedTickerState(normalized);
    localStorage.setItem("crypto_selected_ticker", normalized);
  };

  return (
    <CryptoContext.Provider value={{ selectedTicker, setSelectedTicker }}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => useContext(CryptoContext);
