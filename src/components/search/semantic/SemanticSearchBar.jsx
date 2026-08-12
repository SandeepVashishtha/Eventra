import React, { useState } from "react";
import { Sparkles, Search, Cpu, ArrowRight } from "lucide-react";

export default function SemanticSearchBar({ onSearch = () => {} }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-4 text-indigo-500">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by intent: e.g. 'Hands-on Web3 & AI workshops this weekend for beginners'..."
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
        >
          <span>Vector Search</span> <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* AI Concept Tags */}
      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="text-gray-400 font-bold flex items-center gap-1">
          <Cpu className="w-3 h-3 text-indigo-400" /> Extracted Intent Tags:
        </span>
        {["#Web3", "#HandsOnCoding", "#BeginnerFriendly", "#WeekendEvents"].map((tag, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
