// src/Pages/WhatsNew/WhatsNewPage.jsx
import { useState, useMemo } from "react";
import { whatsNewEntries } from "../../data/whatsNewEntries";
import WhatsNewItem from "../../components/whatsnew/WhatsNewItem";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "improved", label: "Improved" },
  { key: "fixed", label: "Fixed" },
];

export default function WhatsNewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return whatsNewEntries
      .map((entry) => {
        const filteredItems = entry.items.filter((item) => {
          const matchesFilter =
            activeFilter === "all" || item.type === activeFilter;
          const matchesSearch =
            query === "" || item.text.toLowerCase().includes(query);
          return matchesFilter && matchesSearch;
        });
        return { ...entry, items: filteredItems };
      })
      .filter((entry) => entry.items.length > 0);
  }, [searchQuery, activeFilter]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          What's New ✨
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse the full history of updates, improvements, and fixes.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search updates..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
        {filteredEntries.length === 0 ? (
          <p className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No updates match your search.
          </p>
        ) : (
          filteredEntries.map((entry) => (
            <WhatsNewItem key={entry.version} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}