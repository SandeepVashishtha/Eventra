import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Monitor,
} from "lucide-react";

import {
  formatEventSchedule,
  formatScheduleOverlap,
  getEventTitle,
} from "../../utils/scheduleConflictUtils";

const ConflictingEventCard = ({
  conflict,
  event = null,
  onViewEvent,
  showViewButton = true,
  className = "",
}) => {
  const conflictingEvent =
    conflict?.event || event || {};

  const title =
    getEventTitle(
      conflictingEvent
    );

  const schedule =
    formatEventSchedule(
      conflictingEvent
    );

  const overlap =
    conflict?.overlap || null;

  const eventUrl =
    conflictingEvent.url ||
    conflictingEvent.href ||
    conflictingEvent.link ||
    null;

  const location =
    conflictingEvent.venue ||
    conflictingEvent.location ||
    conflictingEvent.address ||
    null;

  const mode =
    conflictingEvent.mode ||
    conflictingEvent.eventMode ||
    null;

  const eventId =
    conflictingEvent.id ||
    conflictingEvent.eventId ||
    conflict?.eventId ||
    null;

  const handleViewEvent = () => {
    if (onViewEvent) {
      onViewEvent(
        conflictingEvent
      );
      return;
    }

    if (eventUrl) {
      window.open(
        eventUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <article
      className={`rounded-2xl border border-red-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-red-900/40 dark:bg-slate-900 ${className}`}
      data-event-id={eventId || undefined}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
          <CalendarDays
            size={19}
            className="text-red-600 dark:text-red-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600 dark:bg-red-900/20 dark:text-red-400">
              Schedule Conflict
            </span>

            {overlap?.durationMinutes >
              0 && (
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                {overlap.durationMinutes}{" "}
                min overlap
              </span>
            )}
          </div>

          <h3 className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
            {title}
          </h3>
        </div>
      </div>

      {/* Event details */}
      <div className="mt-4 space-y-2.5">
        <DetailRow
          icon={Clock}
          label="Schedule"
          value={schedule}
        />

        {overlap && (
          <DetailRow
            icon={Clock}
            label="Overlapping time"
            value={formatScheduleOverlap(
              overlap
            )}
            danger
          />
        )}

        {location && (
          <DetailRow
            icon={MapPin}
            label="Location"
            value={location}
          />
        )}

        {mode && (
          <DetailRow
            icon={Monitor}
            label="Mode"
            value={mode}
          />
        )}
      </div>

      {/* Conflict explanation */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
        <p className="text-[11px] leading-5 text-slate-600 dark:text-slate-400">
          This event overlaps with the event you
          are trying to register for. Review the
          schedule before continuing.
        </p>
      </div>

      {/* Action */}
      {showViewButton &&
        (onViewEvent || eventUrl) && (
          <div className="mt-4">
            <button
              type="button"
              onClick={
                handleViewEvent
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 dark:focus:ring-offset-slate-900"
            >
              View Conflicting Event
              <ArrowRight size={14} />
            </button>
          </div>
        )}
    </article>
  );
};

const DetailRow = ({
  icon: Icon,
  label,
  value,
  danger = false,
}) => {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        size={14}
        className={`mt-0.5 shrink-0 ${
          danger
            ? "text-red-500 dark:text-red-400"
            : "text-slate-400 dark:text-slate-500"
        }`}
      />

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          {label}
        </p>

        <p
          className={`mt-0.5 break-words text-xs font-medium ${
            danger
              ? "text-red-600 dark:text-red-400"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default ConflictingEventCard;