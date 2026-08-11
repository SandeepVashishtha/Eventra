import React, { useState, useMemo, useEffect } from "react";
import { Sliders } from "lucide-react";
import { areFiltersEqual } from "../../utils/filterUtils.js";

export default function EventCatalogHydration({ initialFilters = { category: "all", search: "", date: "" } }) {
  const [filters, setFilters] = useState(initialFilters);
  const [currentQueryKey, setCurrentQueryKey] = useState(["events", initialFilters]);

  // Stable memoized dependency comparison
  const stableFilters = useMemo(() => {
    return filters;
  }, [filters.category, filters.search, filters.date]);

  // Effect updates query key only if structure changes
  useEffect(() => {
    const nextKey = ["events", stableFilters];
    if (!areFiltersEqual(currentQueryKey[1], stableFilters)) {
      setCurrentQueryKey(nextKey);
    }
  }, [stableFilters]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white">
      {/* Search Filter Header Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Catalog Filter Configuration</span>
        </div>

        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
          Stable Query Keys Active
        </span>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-3 gap-3">
        {["all", "web3", "ai"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilters({ ...filters, category: cat })}
            className={`py-2 rounded-xl border text-center font-semibold transition-all ${
              filters.category === cat
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            }`}
          >
            {cat.toUpperCase()} Category
          </button>
        ))}
      </div>

      {/* Query Key Badge */}
      <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 font-mono text-[10px] text-gray-400">
        Active Query Key Hash: {JSON.stringify(currentQueryKey)}
      </div>
    </div>
  );
}
