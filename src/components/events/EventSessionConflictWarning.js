import {
  AlertTriangle,
  CalendarClock,
  Check,
  Clock3,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventSessionConflictWarning = ({
  currentSession,
  bookmarkedSessions = [],
  onBookmark,
  onRemoveBookmark,
  className = "",
}) => {
  const [dismissed, setDismissed] =
    useState(false);

  const conflicts = useMemo(() => {
    if (!currentSession) {
      return [];
    }

    return bookmarkedSessions.filter(
      (session) =>
        session.id !== currentSession.id &&
        sessionsOverlap(
          currentSession,
          session
        )
    );
  }, [
    currentSession,
    bookmarkedSessions,
  ]);

  const hasConflict =
    conflicts.length > 0;

  const handleBookmark = () => {
    onBookmark?.(currentSession);
    setDismissed(false);
  };

  const handleRemoveConflict = (
    session
  ) => {
    onRemoveBookmark?.(session);
  };

  if (!currentSession) {
    return null;
  }

  return (
    <section
      className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900 ${
        hasConflict
          ? "border-amber-200 dark:border-amber-800"
          : "border-slate-200 dark:border-slate-700"
      } ${className}`}
    >
      {/* Current session */}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            hasConflict
              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          }`}
        >
          {hasConflict ? (
            <AlertTriangle size={18} />
          ) : (
            <CalendarClock size={18} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[9px] font-bold uppercase tracking-wide ${
              hasConflict
                ? "text-amber-600 dark:text-amber-400"
                : "text-indigo-600 dark:text-indigo-400"
            }`}
          >
            {hasConflict
              ? "Schedule Conflict"
              : "Session Schedule"}
          </p>

          <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
            {currentSession.title ||
              "Selected Session"}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} />
              {formatSessionTime(
                currentSession
              )}
            </span>
          </div>
        </div>
      </div>

      {/* No conflict */}
      {!hasConflict && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-900/10">
          <div className="flex items-center gap-2">
            <Check
              size={14}
              className="text-green-600 dark:text-green-400"
            />

            <p className="text-[10px] font-semibold text-green-700 dark:text-green-400">
              No schedule conflicts found.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBookmark}
            className="mt-3 rounded-lg bg-green-600 px-3 py-2 text-[10px] font-bold text-white hover:bg-green-700"
          >
            Bookmark Session
          </button>
        </div>
      )}

      {/* Conflict warning */}
      {hasConflict &&
        !dismissed && (
          <div className="mt-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    ⚠️ Schedule Conflict
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-amber-700 dark:text-amber-400">
                    This session overlaps with another
                    session in your schedule.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDismissed(true)
                  }
                  aria-label="Dismiss warning"
                  className="rounded-lg p-1 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Conflicting sessions */}
            <div className="mt-3 space-y-3">
              {conflicts.map(
                (session) => (
                  <ConflictSessionCard
                    key={session.id}
                    session={session}
                    onRemove={() =>
                      handleRemoveConflict(
                        session
                      )
                    }
                  />
                )
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={
                  handleBookmark
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-white hover:bg-amber-600"
              >
                <Check size={14} />
                Bookmark Anyway
              </button>

              <button
                type="button"
                onClick={() =>
                  setDismissed(true)
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Continue Without Bookmark
              </button>
            </div>
          </div>
        )}

      {/* Dismissed */}
      {hasConflict &&
        dismissed && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {conflicts.length} conflicting session
              {conflicts.length === 1
                ? ""
                : "s"} found.
            </p>

            <button
              type="button"
              onClick={() =>
                setDismissed(false)
              }
              className="text-[10px] font-bold text-amber-600 hover:underline dark:text-amber-400"
            >
              Show Warning
            </button>
          </div>
        )}
    </section>
  );
};

/* ----------------------------------
   Conflicting session card
----------------------------------- */

const ConflictSessionCard = ({
  session,
  onRemove,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <Clock3 size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
            Conflicting Session
          </p>

          <h4 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">
            {session.title ||
              "Untitled Session"}
          </h4>

          <p className="mt-1 text-[10px] text-slate-400">
            {formatSessionTime(
              session
            )}
          </p>
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-red-100 px-2.5 py-2 text-[9px] font-semibold text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

/* ----------------------------------
   Conflict detection
----------------------------------- */

const sessionsOverlap = (
  first,
  second
) => {
  const firstStart =
    getSessionStart(first);

  const firstEnd =
    getSessionEnd(first);

  const secondStart =
    getSessionStart(second);

  const secondEnd =
    getSessionEnd(second);

  if (
    firstStart === null ||
    firstEnd === null ||
    secondStart === null ||
    secondEnd === null
  ) {
    return false;
  }

  return (
    firstStart < secondEnd &&
    secondStart < firstEnd
  );
};

/* ----------------------------------
   Start time
----------------------------------- */

const getSessionStart = (
  session
) => {
  if (
    session.startDateTime
  ) {
    return parseDate(
      session.startDateTime
    );
  }

  if (
    session.startTime &&
    session.date
  ) {
    return parseDate(
      `${session.date}T${session.startTime}`
    );
  }

  if (
    session.startTime &&
    session.startDate
  ) {
    return parseDate(
      `${session.startDate}T${session.startTime}`
    );
  }

  return null;
};

/* ----------------------------------
   End time
----------------------------------- */

const getSessionEnd = (
  session
) => {
  if (
    session.endDateTime
  ) {
    return parseDate(
      session.endDateTime
    );
  }

  if (
    session.endTime &&
    session.date
  ) {
    return parseDate(
      `${session.date}T${session.endTime}`
    );
  }

  if (
    session.endTime &&
    session.startDate
  ) {
    return parseDate(
      `${session.startDate}T${session.endTime}`
    );
  }

  // Support sessions that provide
  // start time + duration.
  const start =
    getSessionStart(session);

  const duration =
    Number(
      session.durationMinutes
    );

  if (
    start !== null &&
    Number.isFinite(duration) &&
    duration > 0
  ) {
    return (
      start +
      duration * 60 * 1000
    );
  }

  return null;
};

/* ----------------------------------
   Date parsing
----------------------------------- */

const parseDate = (
  value
) => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.getTime();
};

/* ----------------------------------
   Format session time
----------------------------------- */

const formatSessionTime = (
  session
) => {
  const start =
    getSessionStart(session);

  const end =
    getSessionEnd(session);

  if (
    start === null ||
    end === null
  ) {
    return (
      session.time ||
      "Time not provided"
    );
  }

  const startDate =
    new Date(start);

  const endDate =
    new Date(end);

  const dateText =
    new Intl.DateTimeFormat(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    ).format(startDate);

  const timeFormatter =
    new Intl.DateTimeFormat(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );

  return `${dateText} • ${timeFormatter.format(
    startDate
  )} - ${timeFormatter.format(
    endDate
  )}`;
};

export default EventSessionConflictWarning;