import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import EmptyState from "./EmptyState";

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
  query = "",
  itemLabel = "items",
  browseLabel = "Browse",
  browsePath = "/",
  onClear,
  onTagClick,
  popularTags = [],
  variant = "search",
  title: customTitle,
  description: customDescription,
}) => {
  const hasQuery = Boolean(query?.trim());

  const title =
    customTitle ||
    (hasQuery
      ? `No results found for "${query}"`
      : `No ${itemLabel} found`);

  const description =
    customDescription ||
    "Try adjusting your search or filters, or explore other sections on Eventra.";

  const suggestions = DEFAULT_SUGGESTIONS;

  return (
    <EmptyState
      title={title}
      description={description}
      icon={Search}
    >
      {/* Suggestions */}
      <ul className="mt-6 grid gap-3 text-left text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-3">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm"
          >
            {suggestion}
          </li>
        ))}
      </ul>

      {/* Popular tags — clickable shortcuts to start a fresh search */}
      {popularTags.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Try a popular search
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularTags.map((tag) =>
              onTagClick ? (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  aria-label={`Search for ${tag}`}
                >
                  {tag}
                </button>
              ) : (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <X size={16} />
          Clear Search
        </button>

        <Link
          to={browsePath}
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {browseLabel}
        </Link>
      </div>

      {/* Footer Links */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span>Search across</span>

        {SEARCH_LINKS.map((link) => (
          <Link
            key={link.to}
            to={
              hasQuery
                ? `${link.to}?search=${encodeURIComponent(query)}`
                : link.to
            }
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </EmptyState>
  );
};

export default SearchEmptyState;