import {
  CalendarClock,
  Clock3,
  History,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_HISTORY = [
  {
    id: 1,
    previousDeadline: null,
    newDeadline: "2026-08-10T23:59:00",
    changedAt: "2026-08-01T10:30:00",
    organizer: "Event Organizer",
    reason: "Original registration deadline",
  },
  {
    id: 2,
    previousDeadline: "2026-08-10T23:59:00",
    newDeadline: "2026-08-13T23:59:00",
    changedAt: "2026-08-08T14:20:00",
    organizer: "Event Organizer",
    reason: "Extended due to high participant demand",
  },
  {
    id: 3,
    previousDeadline: "2026-08-13T23:59:00",
    newDeadline: "2026-08-15T23:59:00",
    changedAt: "2026-08-12T09:15:00",
    organizer: "Event Organizer",
    reason: "Additional registration requests received",
  },
];

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RegistrationDeadlineHistory = ({
  history = DEFAULT_HISTORY,
  currentDeadline,
  isOrganizer = false,
  onDeadlineChange,
}) => {
  const [expandedId, setExpandedId] =
    useState(null);

  const [showChangeForm, setShowChangeForm] =
    useState(false);

  const [newDeadline, setNewDeadline] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const sortedHistory = [...history].sort(
    (a, b) =>
      new Date(b.changedAt) -
      new Date(a.changedAt)
  );

  const latestDeadline =
    currentDeadline ||
    sortedHistory[0]?.newDeadline;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!newDeadline) return;

    setSaving(true);

    const previousDeadline =
      latestDeadline || null;

    const change = {
      previousDeadline,
      newDeadline,
      changedAt:
        new Date().toISOString(),
      organizer: "Current Organizer",
      reason:
        reason.trim() ||
        "Registration deadline updated",
    };

    try {
      await onDeadlineChange?.(change);

      setNewDeadline("");
      setReason("");
      setShowChangeForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <History size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Deadline Extension History
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Track every registration deadline change,
              including the organizer, timestamp, and reason.
            </p>
          </div>
        </div>

        {isOrganizer && (
          <button
            type="button"
            onClick={() =>
              setShowChangeForm(
                (value) => !value
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
          >
            <CalendarClock size={13} />

            {showChangeForm
              ? "Close"
              : "Change Deadline"}
          </button>
        )}
      </div>

      {/* Current Deadline */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
              <CalendarClock size={18} />
            </div>

            <div>
              <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
                Current Registration Deadline
              </p>

              <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
                {formatDate(latestDeadline)}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white px-4 py-3 dark:bg-slate-900">
            <p className="text-[6px] uppercase tracking-wide text-slate-400">
              Changes Recorded
            </p>

            <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
              {history.length}
            </p>
          </div>
        </div>
      </div>

      {/* Change Form */}
      {showChangeForm &&
        isOrganizer && (
          <form
            onSubmit={handleSubmit}
            className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2">
              <CalendarClock
                size={15}
                className="text-indigo-500"
              />

              <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Extend Registration Deadline
              </h3>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* Previous */}
              <div>
                <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                  Previous Deadline
                </label>

                <input
                  type="text"
                  value={formatDate(
                    latestDeadline
                  )}
                  readOnly
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-[8px] text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                />
              </div>

              {/* New */}
              <div>
                <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                  New Deadline *
                </label>

                <input
                  type="datetime-local"
                  required
                  value={newDeadline}
                  onChange={(event) =>
                    setNewDeadline(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="mt-4">
              <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                Reason
              </label>

              <textarea
                rows={3}
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value
                  )
                }
                placeholder="Why is the registration deadline being extended?"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setShowChangeForm(false)
                }
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-[7px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Deadline Change"}
              </button>
            </div>
          </form>
        )}

      {/* Timeline */}
      <div className="mt-7">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Deadline History
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Complete audit trail of registration deadline changes.
            </p>
          </div>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute bottom-5 left-[17px] top-5 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="space-y-4">
            {sortedHistory.map(
              (item, index) => {
                const expanded =
                  expandedId === item.id;

                const isLatest =
                  index === 0;

                return (
                  <div
                    key={item.id}
                    className="relative pl-10"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 dark:border-slate-950 ${
                        isLatest
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-indigo-500 dark:bg-slate-900"
                      }`}
                    >
                      <CalendarClock
                        size={13}
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                      {/* Summary */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {index ===
                              sortedHistory.length -
                                1 && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[5px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                Original
                              </span>
                            )}

                            {isLatest && (
                              <span className="rounded-full bg-green-50 px-2 py-1 text-[5px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
                              {item.previousDeadline
                                ? formatDate(
                                    item.previousDeadline
                                  )
                                : "Original"}
                            </span>

                            <span className="text-indigo-500">
                              →
                            </span>

                            <span className="text-[9px] font-black text-slate-800 dark:text-white">
                              {formatDate(
                                item.newDeadline
                              )}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expanded
                                ? null
                                : item.id
                            )
                          }
                          className="inline-flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-[6px] font-bold text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {expanded
                            ? "Hide Details"
                            : "View Details"}

                          {expanded ? (
                            <ChevronUp
                              size={11}
                            />
                          ) : (
                            <ChevronDown
                              size={11}
                            />
                          )}
                        </button>
                      </div>

                      {/* Timestamp */}
                      <div className="mt-3 flex flex-wrap gap-4 text-[6px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock3
                            size={10}
                          />
                          {formatDateTime(
                            item.changedAt
                          )}
                        </span>

                        <span className="flex items-center gap-1">
                          <User
                            size={10}
                          />
                          {item.organizer ||
                            "Unknown organizer"}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {expanded && (
                        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <DetailItem
                              label="Previous Deadline"
                              value={
                                item.previousDeadline
                                  ? formatDateTime(
                                      item.previousDeadline
                                    )
                                  : "Original deadline"
                              }
                            />

                            <DetailItem
                              label="New Deadline"
                              value={formatDateTime(
                                item.newDeadline
                              )}
                            />

                            <DetailItem
                              label="Changed At"
                              value={formatDateTime(
                                item.changedAt
                              )}
                            />

                            <DetailItem
                              label="Organizer"
                              value={
                                item.organizer ||
                                "Unknown"
                              }
                            />
                          </div>

                          {item.reason && (
                            <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                              <p className="flex items-center gap-1.5 text-[6px] font-bold uppercase tracking-wide text-slate-400">
                                <MessageSquare
                                  size={10}
                                />
                                Reason
                              </p>

                              <p className="mt-1 text-[8px] leading-4 text-slate-600 dark:text-slate-300">
                                {item.reason}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------
   Detail Item
--------------------------------- */

const DetailItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[8px] font-semibold text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

export default RegistrationDeadlineHistory;