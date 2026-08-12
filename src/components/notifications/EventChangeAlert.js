import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Info,
  X,
} from "lucide-react";

const EventChangeAlert = ({
  type = "cancelled",
  eventName = "Event",
  reason = "",
  newDateTime = null,
  oldDateTime = null,
  onDismiss,
  onViewEvent,
}) => {
  const isRescheduled =
    type === "rescheduled";

  const title = isRescheduled
    ? "Event Rescheduled"
    : "Event Cancelled";

  const description = isRescheduled
    ? "The organizer has changed the event schedule."
    : "The organizer has cancelled this event.";

  return (
    <div
      role="alert"
      className={`relative rounded-2xl border p-5 shadow-sm ${
        isRescheduled
          ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      }`}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss event change alert"
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition hover:bg-white/60 hover:text-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
        >
          <X size={17} />
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isRescheduled
              ? "bg-amber-100 dark:bg-amber-900/40"
              : "bg-red-100 dark:bg-red-900/40"
          }`}
        >
          {isRescheduled ? (
            <Calendar
              size={21}
              className="text-amber-600 dark:text-amber-400"
            />
          ) : (
            <AlertTriangle
              size={21}
              className="text-red-600 dark:text-red-400"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 pr-6">
          {/* Heading */}
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-bold ${
                isRescheduled
                  ? "text-amber-900 dark:text-amber-200"
                  : "text-red-900 dark:text-red-200"
              }`}
            >
              {title}
            </h3>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isRescheduled
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
              }`}
            >
              {isRescheduled
                ? "Schedule Change"
                : "Cancelled"}
            </span>
          </div>

          {/* Event name */}
          <p className="mt-1 font-semibold text-slate-800 dark:text-white">
            {eventName}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {description}
          </p>

          {/* Previous date */}
          {isRescheduled &&
            oldDateTime && (
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-white/70 p-3 dark:bg-slate-900/40">
                <Clock
                  size={17}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Previous schedule
                  </p>

                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {formatDateTime(
                      oldDateTime
                    )}
                  </p>
                </div>
              </div>
            )}

          {/* New date */}
          {isRescheduled &&
            newDateTime && (
              <div className="mt-3 flex items-start gap-3 rounded-xl bg-white p-3 dark:bg-slate-900">
                <Calendar
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    New schedule
                  </p>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                    {formatDateTime(
                      newDateTime
                    )}
                  </p>
                </div>
              </div>
            )}

          {/* Cancellation/reschedule reason */}
          {reason && (
            <div className="mt-3 flex items-start gap-3 rounded-xl bg-white/70 p-3 dark:bg-slate-900/40">
              <Info
                size={17}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Organizer message
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-700 dark:text-slate-300">
                  {reason}
                </p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <CheckCircle size={14} />

            <span>
              {isRescheduled
                ? "Your registration remains associated with the updated event schedule."
                : "Please check your dashboard for any additional information."}
            </span>
          </div>

          {/* View event */}
          {onViewEvent && (
            <button
              type="button"
              onClick={onViewEvent}
              className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                isRescheduled
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              View Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export default EventChangeAlert;