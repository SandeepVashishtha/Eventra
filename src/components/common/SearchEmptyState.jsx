import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import EmptyState from "./EmptyState";

const DEFAULT_SUGGESTIONS = ["Check your spelling", "Use fewer keywords", "Try a broader topic"];

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
  const title = hasQuery ? `No results found for "${query}"` : `No ${itemLabel} found`;
  const description = "Try one of these suggestions or explore other sections on Eventra.";

  return (
    <EmptyState title={title} description={description} icon={Search}>
      {/* Suggestions */}
      <ul className="mt-6 grid gap-3 text-left text-sm text-slate-700 sm:grid-cols-3 dark:text-slate-300">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {suggestion}
          </li>
        ))}
      </ul>

      {/* Tags */}
      {popularTags.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {popularTags.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700"
        >
          <X size={16} aria-hidden="true" />
          Clear Search
        </button>

        <Link
          to={browsePath}
          onClick={onClear}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
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
            to={hasQuery ? `${link.to}?search=${encodeURIComponent(query)}` : link.to}
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </EmptyState>
  );
};

export default SearchEmptyState;
