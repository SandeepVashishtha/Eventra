import {
  CalendarDays,
  Eye,
  Trash2,
} from "lucide-react";

const RecentlyViewedEventCard = ({
  event,
  onView,
  onRemove,
}) => {
  if (!event) return null;

  const status =
    event.registrationStatus ||
    event.status ||
    "Registration Open";

  const isClosed =
    status.toLowerCase().includes("closed");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* Event information */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-800 dark:text-white">
            {event.name || event.title || "Untitled Event"}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <CalendarDays size={16} />

            <span>
              {formatEventDate(event.date)}
            </span>
          </div>
        </div>

        {/* Registration status */}
        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
            isClosed
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
          }`}
        >
          {status}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => onView?.(event)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Eye size={17} />
          Quick View
        </button>

        <button
          type="button"
          onClick={() => onRemove?.(event.id)}
          aria-label={`Remove ${
            event.name || event.title || "event"
          } from recently viewed`}
          className="flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
};

const formatEventDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

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

export default RecentlyViewedEventCard;