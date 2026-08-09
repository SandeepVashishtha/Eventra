import {
  CalendarDays,
  Clock,
  Eye,
  FileEdit,
  Trash2,
} from "lucide-react";
import {
  formatDraftUpdatedAt,
} from "../../utils/eventDraftUtils";

const DraftEventCard = ({
  draft,
  onEdit,
  onPreview,
  onDelete,
}) => {
  if (!draft) return null;

  const eventName =
    draft.name ||
    draft.title ||
    "Untitled Event";

  const updatedAt =
    formatDraftUpdatedAt(draft);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <FileEdit size={13} />
            Draft
          </div>

          <h3 className="truncate text-lg font-bold text-slate-800 dark:text-white">
            {eventName}
          </h3>
        </div>
      </div>

      {/* Event details */}
      <div className="mt-4 space-y-2">
        {draft.date && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CalendarDays size={16} />
            <span>{formatEventDate(draft.date)}</span>
          </div>
        )}

        {draft.time && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock size={16} />
            <span>{draft.time}</span>
          </div>
        )}

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Last updated: {updatedAt}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(draft)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <FileEdit size={16} />
          Continue Editing
        </button>

        <button
          type="button"
          onClick={() => onPreview?.(draft)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Eye size={16} />
          Preview
        </button>

        <button
          type="button"
          onClick={() => onDelete?.(draft.id)}
          aria-label={`Delete ${eventName} draft`}
          className="inline-flex items-center justify-center rounded-xl border border-red-200 px-3 py-2.5 text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
};

const formatEventDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default DraftEventCard;