"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface CryptoSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function CryptoSearch({ onSearch, placeholder = "Search cryptocurrency by name or symbol..." }: CryptoSearchProps) {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  return (
    <div className="relative w-full">
      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-slate-200 placeholder-slate-500 rounded-xl py-2.5 pl-10 pr-4 transition-colors"
      />
    </div>
  );
}
