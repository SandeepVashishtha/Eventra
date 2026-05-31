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
  <div className="relative z-10 mx-auto max-w-2xl text-center px-4">
    
    {/* Icon */}
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 shadow-sm">
      <Search size={30} />
    </div>

    {/* Heading */}
    <h3 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
      {hasQuery
        ? `No results found for "${query}"`
        : `No ${itemLabel} found`}
    </h3>

    {/* Subtitle */}
    <p className="mt-3 text-sm sm:text-base leading-6 text-slate-600 dark:text-slate-300">
      Try one of these suggestions or explore other sections on Eventra.
    </p>

    {/* Suggestions */}
    <ul className="mt-6 grid gap-3 text-left text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-3">
      {suggestions.map((suggestion) => (
        <li
          key={suggestion}
          className="
            rounded-xl
            border border-slate-200 dark:border-slate-700
            bg-white dark:bg-slate-900
            px-4 py-3
            shadow-sm
          "
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
            className="
              rounded-full
              border border-slate-200 dark:border-slate-700
              bg-slate-100 dark:bg-slate-800
              px-3 py-1
              text-xs font-medium
              text-slate-700 dark:text-slate-200
            "
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
        className="
          inline-flex items-center justify-center gap-2
          rounded-xl
          bg-blue-600
          px-5 py-3
          text-sm font-semibold
          text-white
          transition-all duration-200
          hover:bg-blue-700
          shadow-sm
        "
       aria-label="button">
        <X size={16} aria-hidden="true" />
        Clear Search
      </button>

      <Link
        to={browsePath}
        onClick={onClear}
        className="
          inline-flex items-center justify-center
          rounded-xl
          border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-900
          px-5 py-3
          text-sm font-semibold
          text-slate-800 dark:text-white
          transition-all duration-200
          hover:bg-slate-50 dark:hover:bg-slate-800
        "
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
          className="
            font-medium
            text-blue-600
            hover:text-blue-700
            dark:text-blue-400
            dark:hover:text-blue-300
          "
        >
          {link.label}
        </Link>
      ))}
    </div>
  </div>
);
};

export default SearchEmptyState;
