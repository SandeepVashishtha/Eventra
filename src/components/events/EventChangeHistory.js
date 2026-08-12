import {
  ArrowRight,
  CalendarClock,
  ChevronDown,
  Clock,
  FileText,
  History,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const CHANGE_TYPES = {
  date: {
    label: "Event Date",
    icon: CalendarClock,
  },
  registrationDeadline: {
    label: "Registration Deadline",
    icon: Clock,
  },
  venue: {
    label: "Venue",
    icon: MapPin,
  },
  capacity: {
    label: "Capacity",
    icon: Users,
  },
  rules: {
    label: "Rules",
    icon: FileText,
  },
  description: {
    label: "Description",
    icon: FileText,
  },
  registrationStatus: {
    label: "Registration Status",
    icon: History,
  },
};

const EventChangeHistory = ({
  changes = [],
  title = "Event Change History",
  className = "",
  maxItems = 20,
}) => {
  const [expanded, setExpanded] =
    useState(null);

  const normalizedChanges = useMemo(() => {
    if (!Array.isArray(changes)) {
      return [];
    }

    return changes
      .filter(Boolean)
      .map((change, index) =>
        normalizeChange(
          change,
          index
        )
      )
      .sort(
        (a, b) =>
          b.timestamp -
          a.timestamp
      )
      .slice(0, maxItems);
  }, [changes, maxItems]);

  const toggleExpanded = (id) => {
    setExpanded((current) =>
      current === id ? null : id
    );
  };

  return (
    <section
      aria-labelledby="event-change-history-title"
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <History
            size={19}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id="event-change-history-title"
            className="text-sm font-bold text-slate-800 dark:text-white"
          >
            {title}
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            Important changes made to this event are
            displayed below.
          </p>
        </div>

        {normalizedChanges.length >
          0 && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {normalizedChanges.length}
          </span>
        )}
      </div>

      {/* Empty state */}
      {normalizedChanges.length ===
        0 && (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <History
            size={24}
            className="mx-auto text-slate-400"
          />

          <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
            No changes recorded
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Event updates will appear here when
            important details are modified.
          </p>
        </div>
      )}

      {/* Timeline */}
      {normalizedChanges.length >
        0 && (
        <div className="relative mt-6">
          <div className="absolute bottom-3 left-[15px] top-3 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-5">
            {normalizedChanges.map(
              (change) => {
                const config =
                  CHANGE_TYPES[
                    change.type
                  ] ||
                  CHANGE_TYPES.description;

                const Icon =
                  config.icon;

                const isExpanded =
                  expanded ===
                  change.id;

                return (
                  <article
                    key={change.id}
                    className="relative pl-10"
                  >
                    {/* Timeline point */}
                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-indigo-100 dark:border-slate-900 dark:bg-indigo-900/40">
                      <Icon
                        size={13}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      {/* Change header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                              {config.label}
                            </span>

                            {change.actor && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                {change.actor}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatDateTime(
                              change.timestamp
                            )}
                          </p>
                        </div>

                        {change.hasLongValue && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleExpanded(
                                change.id
                              )
                            }
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            aria-label={
                              isExpanded
                                ? "Collapse change details"
                                : "Expand change details"
                            }
                            aria-expanded={
                              isExpanded
                            }
                          >
                            <ChevronDown
                              size={15}
                              className={`transition-transform ${
                                isExpanded
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Change values */}
                      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                        <ChangeValue
                          label="Previous"
                          value={
                            change.previousValue
                          }
                          expanded={
                            isExpanded
                          }
                        />

                        <div className="hidden justify-center sm:flex">
                          <ArrowRight
                            size={15}
                            className="text-indigo-400"
                          />
                        </div>

                        <ChangeValue
                          label="Updated"
                          value={
                            change.newValue
                          }
                          updated
                          expanded={
                            isExpanded
                          }
                        />
                      </div>

                      {/* Mobile arrow */}
                      <div className="flex justify-center py-1 sm:hidden">
                        <ArrowRight
                          size={15}
                          className="rotate-90 text-indigo-400"
                        />
                      </div>

                      {/* Reason */}
                      {change.reason && (
                        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                            Reason
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                            {change.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Change value
----------------------------------- */

const ChangeValue = ({
  label,
  value,
  updated = false,
  expanded = false,
}) => {
  const displayValue =
    formatValue(value);

  const isLong =
    displayValue.length > 160;

  const shouldTruncate =
    isLong && !expanded;

  return (
    <div
      className={`rounded-xl border p-3 ${
        updated
          ? "border-green-200 bg-green-50/70 dark:border-green-900/40 dark:bg-green-900/10"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"
      }`}
    >
      <p
        className={`text-[9px] font-semibold uppercase tracking-wide ${
          updated
            ? "text-green-600 dark:text-green-400"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 whitespace-pre-wrap break-words text-xs leading-5 ${
          updated
            ? "font-semibold text-green-700 dark:text-green-300"
            : "text-slate-600 dark:text-slate-300"
        }`}
      >
        {shouldTruncate
          ? `${displayValue.slice(
              0,
              160
            )}...`
          : displayValue}
      </p>
    </div>
  );
};

/* ----------------------------------
   Normalize history entries
----------------------------------- */

const normalizeChange = (
  change,
  index
) => {
  const type =
    change.type ||
    change.field ||
    change.changeType ||
    "description";

  const rawTimestamp =
    change.timestamp ||
    change.createdAt ||
    change.updatedAt ||
    change.date ||
    Date.now();

  const timestamp =
    new Date(
      rawTimestamp
    ).getTime();

  const previousValue =
    change.previousValue ??
    change.oldValue ??
    change.from ??
    "";

  const newValue =
    change.newValue ??
    change.value ??
    change.to ??
    "";

  const previousText =
    formatValue(
      previousValue
    );

  const newText =
    formatValue(newValue);

  return {
    id:
      change.id ||
      change.changeId ||
      `${type}-${timestamp}-${index}`,
    type,
    timestamp:
      Number.isNaN(timestamp)
        ? Date.now()
        : timestamp,
    previousValue,
    newValue,
    actor:
      change.actorName ||
      change.actor ||
      change.updatedBy ||
      change.changedBy ||
      "",
    reason:
      change.reason ||
      change.note ||
      "",
    hasLongValue:
      previousText.length >
        160 ||
      newText.length >
        160,
  };
};

/* ----------------------------------
   Format values
----------------------------------- */

const formatValue = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not specified";
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  if (
    Array.isArray(value)
  ) {
    if (!value.length) {
      return "None";
    }

    return value
      .map((item) =>
        typeof item ===
        "object"
          ? item.name ||
            item.label ||
            item.title ||
            JSON.stringify(
              item
            )
          : String(item)
      )
      .join(", ");
  }

  if (
    typeof value ===
    "object"
  ) {
    return (
      value.name ||
      value.label ||
      value.title ||
      value.value ||
      JSON.stringify(
        value,
        null,
        2
      )
    );
  }

  return String(value);
};

/* ----------------------------------
   Date formatting
----------------------------------- */

const formatDateTime = (
  timestamp
) => {
  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default EventChangeHistory;