import React from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";

const DEFAULT_SUGGESTIONS = [
  "Check your spelling",
  "Use fewer keywords",
  "Try a broader topic",
];

const SEARCH_LINKS = [
  { label: "Events", to: "/events" },
  { label: "Hackathons", to: "/hackathons" },
  { label: "Projects", to: "/projects" },
];

const SearchEmptyState = ({
  query,
  itemLabel,
  browseLabel,
  browsePath,
  onClear,
  suggestions = DEFAULT_SUGGESTIONS,
  popularTags = [],
}) => {
  const hasQuery = Boolean(query?.trim());

  return (
    <div className="relative z-10 mx-auto max-w-2xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
        <Search size={30} />
      </div>

      <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {hasQuery ? `No results found for "${query}"` : `No ${itemLabel} found`}
      </h3>
      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
        Try one of these quick actions to keep exploring Eventra.
      </p>

      <ul className="mt-5 grid gap-2 text-left text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-3">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion}
            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/70"
          >
            {suggestion}
          </li>
        ))}
      </ul>

      {popularTags.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {popularTags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          <X size={16} />
          Clear Search
        </button>
        <Link
          to={browsePath}
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
        >
          {browseLabel}
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span>Search across</span>
        {SEARCH_LINKS.map((link) => (
          <Link
            key={link.to}
            to={hasQuery ? `${link.to}?search=${encodeURIComponent(query)}` : link.to}
            className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchEmptyState;
