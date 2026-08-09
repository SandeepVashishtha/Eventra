import {
  Clock3,
  Search,
  Trash2,
} from "lucide-react";

import {
  getSearchTimeLabel,
} from "../../utils/recentEventSearchUtils";

const RecentSearchItem = ({
  search = {},
  onSelect,
  onDelete,
}) => {
  const query =
    search.query || "";

  const timeLabel =
    getSearchTimeLabel(
      search.searchedAt ||
        search.createdAt
    );

  const handleSelect = () => {
    if (!query) {
      return;
    }

    onSelect?.(search);
  };

  const handleDelete = (
    event
  ) => {
    event.stopPropagation();
    onDelete?.(search);
  };

  if (!query) {
    return null;
  }

  return (
    <div className="group flex items-center gap-2 rounded-xl px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/70">
      {/* Reuse search */}
      <button
        type="button"
        onClick={handleSelect}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        aria-label={`Reuse search: ${query}`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <Search
            size={16}
            className="text-slate-500 dark:text-slate-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
            {query}
          </p>

          {timeLabel && (
            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Clock3 size={11} />
              {timeLabel}
            </span>
          )}
        </div>
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        className="shrink-0 rounded-lg p-2 text-slate-400 opacity-70 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        aria-label={`Delete recent search: ${query}`}
        title="Delete search"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

export default RecentSearchItem;