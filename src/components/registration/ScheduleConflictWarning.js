import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import {
  formatEventSchedule,
  formatScheduleOverlap,
  getEventTitle,
} from "../../utils/scheduleConflictUtils";

const ScheduleConflictWarning = ({
  conflicts = [],
  newEvent = null,
  onContinue,
  continueLabel = "Continue Registration",
  showContinueButton = true,
  defaultExpanded = true,
  collapsible = true,
  className = "",
}) => {
  const [expanded, setExpanded] =
    useState(defaultExpanded);

  const normalizedConflicts =
    Array.isArray(conflicts)
      ? conflicts
      : [];

  if (
    normalizedConflicts.length === 0
  ) {
    return null;
  }

  return (
    <div
      role="alert"
      className={`overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/10 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
          <AlertTriangle
            size={21}
            className="text-amber-600 dark:text-amber-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Schedule Conflict
            </h3>

            <span className="w-fit rounded-full bg-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              {normalizedConflicts.length}{" "}
              {normalizedConflicts.length ===
              1
                ? "conflict"
                : "conflicts"}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            You already have an event scheduled
            during this time. Review the conflicting
            event before continuing.
          </p>

          {newEvent && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/70 p-2.5 dark:bg-slate-900/40">
              <CalendarClock
                size={15}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                  New event
                </p>

                <p className="mt-0.5 truncate text-xs font-medium text-slate-800 dark:text-white">
                  {getEventTitle(
                    newEvent
                  )}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  {formatEventSchedule(
                    newEvent
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {collapsible && (
          <button
            type="button"
            onClick={() =>
              setExpanded(
                (current) => !current
              )
            }
            aria-expanded={expanded}
            aria-label={
              expanded
                ? "Hide conflicting events"
                : "Show conflicting events"
            }
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-amber-700 transition hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30"
          >
            {expanded ? (
              <ChevronUp size={17} />
            ) : (
              <ChevronDown size={17} />
            )}
          </button>
        )}
      </div>

      {/* Conflict list */}
      {expanded && (
        <div className="border-t border-amber-200/80 p-4 dark:border-amber-900/40">
          <div className="space-y-3">
            {normalizedConflicts.map(
              (conflict, index) => (
                <ConflictItem
                  key={
                    conflict?.eventId ||
                    conflict?.event?.id ||
                    index
                  }
                  conflict={conflict}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Action */}
      {showContinueButton &&
        onContinue && (
          <div className="flex flex-col gap-2 border-t border-amber-200/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/40">
            <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
              You can still continue if you are sure
              you want to register.
            </p>

            <button
              type="button"
              onClick={onContinue}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              {continueLabel}
              <ArrowRight size={14} />
            </button>
          </div>
        )}
    </div>
  );
};

/**
 * Individual conflicting event.
 */
const ConflictItem = ({
  conflict,
}) => {
  const event =
    conflict?.event || conflict;

  const title =
    getEventTitle(event);

  const schedule =
    formatEventSchedule(event);

  const overlap =
    conflict?.overlap;

  return (
    <div className="rounded-xl border border-red-100 bg-white/80 p-4 dark:border-red-900/30 dark:bg-slate-900/50">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
          <XCircle
            size={18}
            className="text-red-600 dark:text-red-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                Conflicting Event
              </p>

              <h4 className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-white">
                {title}
              </h4>
            </div>

            {overlap && (
              <span className="w-fit rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {overlap.durationMinutes}{" "}
                min overlap
              </span>
            )}
          </div>

          <div className="mt-3 space-y-2">
            <ScheduleRow
              icon={CalendarClock}
              label="Event time"
              value={schedule}
            />

            {overlap && (
              <ScheduleRow
                icon={Clock}
                label="Overlap"
                value={formatScheduleOverlap(
                  overlap
                )}
                danger
              />
            )}
          </div>

          {event.venue ||
            event.location ||
            event.mode ? (
            <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400">
              {event.mode && (
                <span className="font-medium">
                  {event.mode}
                </span>
              )}

              {event.venue && (
                <span>
                  {event.mode
                    ? " · "
                    : ""}
                  {event.venue}
                </span>
              )}

              {!event.venue &&
                event.location && (
                  <span>
                    {event.mode
                      ? " · "
                      : ""}
                    {event.location}
                  </span>
                )}
            </div>
          ) : null}

          {event.url ||
            event.href ||
            event.link ? (
            <a
              href={
                event.url ||
                event.href ||
                event.link
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View conflicting event
              <ArrowRight size={12} />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};

/**
 * Schedule detail row.
 */
const ScheduleRow = ({
  icon: Icon,
  label,
  value,
  danger = false,
}) => {
  return (
    <div className="flex items-start gap-2">
      <Icon
        size={13}
        className={`mt-0.5 shrink-0 ${
          danger
            ? "text-red-500 dark:text-red-400"
            : "text-slate-400"
        }`}
      />

      <div className="min-w-0">
        <span className="mr-1 text-[10px] text-slate-400">
          {label}:
        </span>

        <span
          className={`text-[10px] font-medium ${
            danger
              ? "text-red-600 dark:text-red-400"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default ScheduleConflictWarning;