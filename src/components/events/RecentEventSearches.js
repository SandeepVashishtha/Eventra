import {
  Clock3,
  History,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  clearRecentSearchHistory,
  deleteRecentSearchFromStorage,
  getRecentSearches,
  loadRecentSearchesFromStorage,
  saveRecentSearch,
} from "../../utils/recentEventSearchUtils";

import RecentSearchItem from "./RecentSearchItem";

const RecentEventSearches = ({
  userId,
  onSearchSelect,
  storageKey,
  maxSearches = 10,
  searchPath = "/events/search",
  className = "",
}) => {
  const [searches, setSearches] =
    useState([]);

  const [isVisible, setIsVisible] =
    useState(true);

  const resolvedStorageKey =
    storageKey ||
    `eventra:recent-event-searches${
      userId
        ? `:${userId}`
        : ""
    }`;

  useEffect(() => {
    const stored =
      loadRecentSearchesFromStorage({
        storageKey:
          resolvedStorageKey,
        maxSearches,
      });

    setSearches(
      getRecentSearches(
        stored,
        maxSearches
      )
    );
  }, [
    resolvedStorageKey,
    maxSearches,
  ]);

  const handleSearchSelect = (
    search
  ) => {
    const query =
      search?.query || "";

    if (!query) {
      return;
    }

    // Update the selected search so it
    // becomes the most recent query.
    const result =
      saveRecentSearch(
        query,
        {
          storageKey:
            resolvedStorageKey,
          maxSearches,
        }
      );

    setSearches(
      getRecentSearches(
        result.searches,
        maxSearches
      )
    );

    if (onSearchSelect) {
      onSearchSelect(
        query,
        search
      );
      return;
    }

    // Fallback navigation when no callback
    // is supplied.
    if (
      typeof window !==
        "undefined"
    ) {
      const params =
        new URLSearchParams();

      params.set(
        "q",
        query
      );

      if (searchPath) {
        window.location.href = `${searchPath}?${params.toString()}`;
      }
    }
  };

  const handleDelete = (
    search
  ) => {
    if (!search?.id) {
      return;
    }

    const result =
      deleteRecentSearchFromStorage(
        search.id,
        {
          storageKey:
            resolvedStorageKey,
          maxSearches,
        }
      );

    setSearches(
      getRecentSearches(
        result.searches,
        maxSearches
      )
    );
  };

  const handleClear = () => {
    const result =
      clearRecentSearchHistory({
        storageKey:
          resolvedStorageKey,
      });

    if (result.cleared) {
      setSearches([]);
    }
  };

  if (
    !searches.length ||
    !isVisible
  ) {
    return null;
  }

  return (
    <section
      className={`w-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
      aria-label="Recent event searches"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <History
              size={17}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-slate-800 dark:text-white">
                Recent Searches
              </h2>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {searches.length}
              </span>
            </div>

            <p className="mt-0.5 text-[11px] text-slate-400">
              Reuse a previous event search
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            aria-label="Clear search history"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">
              Clear
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setIsVisible(false)
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Hide recent searches"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Search history */}
      <div className="p-3">
        <div className="space-y-1">
          {searches.map(
            (search) => (
              <RecentSearchItem
                key={search.id}
                search={search}
                onSelect={
                  handleSearchSelect
                }
                onDelete={
                  handleDelete
                }
              />
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400 dark:border-slate-800">
        <Clock3 size={13} />

        <span>
          Your recent event searches are stored
          locally on this device.
        </span>
      </div>
    </section>
  );
};

export default RecentEventSearches;