import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Info,
  Send,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventPostponementManagement = ({
  event = {},
  onPostpone,
  onCancel,
  className = "",
}) => {
  const normalizedEvent = useMemo(
    () => normalizeEvent(event),
    [event]
  );

  const [newDate, setNewDate] = useState(
    normalizedEvent.newDate || ""
  );

  const [newTime, setNewTime] = useState(
    normalizedEvent.newTime || ""
  );

  const [reason, setReason] = useState("");

  const [notifyParticipants, setNotifyParticipants] =
    useState(true);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [isPostponed, setIsPostponed] =
    useState(
      normalizedEvent.status === "postponed"
    );

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const hasNewSchedule =
    Boolean(newDate) ||
    Boolean(newTime);

  const canPostpone =
    Boolean(newDate) &&
    Boolean(reason.trim());

  const originalSchedule =
    formatSchedule(
      normalizedEvent.date,
      normalizedEvent.time
    );

  const updatedSchedule =
    formatSchedule(
      newDate,
      newTime
    );

  const handlePostpone = () => {
    setError("");
    setSuccess(false);

    if (!newDate) {
      setError(
        "Please select a new event date."
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        "Please provide a reason for postponing the event."
      );
      return;
    }

    setShowConfirmation(true);
  };

  const confirmPostponement = () => {
    const postponement = {
      eventId:
        normalizedEvent.id,
      status: "postponed",
      originalDate:
        normalizedEvent.date,
      originalTime:
        normalizedEvent.time,
      newDate,
      newTime,
      reason:
        reason.trim(),
      notifyParticipants,
      postponedAt:
        new Date().toISOString(),
    };

    setIsPostponed(true);
    setSuccess(true);
    setShowConfirmation(false);

    onPostpone?.(postponement);
  };

  const handleCancel = () => {
    setNewDate("");
    setNewTime("");
    setReason("");
    setError("");
    setSuccess(false);
    setShowConfirmation(false);

    onCancel?.();
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <CalendarDays
              size={20}
              className="text-amber-600 dark:text-amber-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Organizer Controls
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Postponement
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Change the event schedule while preserving
              the original event information.
            </p>
          </div>
        </div>

        <StatusBadge
          postponed={isPostponed}
        />
      </div>

      {/* Event information */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {normalizedEvent.title}
            </h3>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Original Schedule
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {originalSchedule}
            </p>
          </div>
        </div>
      </div>

      {/* Already postponed */}
      {isPostponed && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />

            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Event marked as postponed
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-300">
                The event status has been updated. Participants
                can be informed about the new schedule.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule comparison */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ScheduleCard
          label="Original Schedule"
          date={normalizedEvent.date}
          time={normalizedEvent.time}
          muted
        />

        <ScheduleCard
          label="New Schedule"
          date={newDate}
          time={newTime}
          highlighted
        />
      </div>

      {/* Form */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Clock3
            size={15}
            className="text-indigo-500"
          />

          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            New Event Schedule
          </h3>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField
            label="New Date"
            required
          >
            <input
              type="date"
              value={newDate}
              min={getTodayDate()}
              onChange={(event) =>
                setNewDate(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </FormField>

          <FormField label="New Time">
            <input
              type="time"
              value={newTime}
              onChange={(event) =>
                setNewTime(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </FormField>
        </div>

        <FormField
          label="Postponement Reason"
          required
        >
          <textarea
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value
              )
            }
            rows={4}
            maxLength={500}
            placeholder="Explain why the event is being postponed..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />

          <div className="mt-1 flex justify-end">
            <span className="text-[9px] text-slate-400">
              {reason.length}/500
            </span>
          </div>
        </FormField>

        {/* Notification option */}
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
          <input
            type="checkbox"
            checked={notifyParticipants}
            onChange={(event) =>
              setNotifyParticipants(
                event.target.checked
              )
            }
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />

          <span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Bell size={12} />
              Notify registered participants
            </span>

            <span className="mt-1 block text-[9px] leading-4 text-slate-400">
              Send the postponement reason and updated schedule
              to participants registered for this event.
            </span>
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/10">
            <AlertTriangle
              size={15}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-900/10">
            <CheckCircle2
              size={15}
              className="mt-0.5 shrink-0 text-green-500"
            />

            <p className="text-xs font-medium text-green-600 dark:text-green-400">
              Event postponement has been recorded successfully.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <X size={14} />
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePostpone}
            disabled={!canPostpone}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CalendarDays size={14} />
            Postpone Event
          </button>
        </div>
      </div>

      {/* Preserved history */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <History
            size={15}
            className="text-slate-500"
          />

          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Original Event Information
          </h3>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-3 sm:grid-cols-2">
            <HistoryItem
              label="Original Date"
              value={
                formatDate(
                  normalizedEvent.date
                ) || "Not provided"
              }
            />

            <HistoryItem
              label="Original Time"
              value={
                normalizedEvent.time ||
                "Not provided"
              }
            />

            <HistoryItem
              label="Venue"
              value={
                normalizedEvent.venue ||
                "Not provided"
              }
            />

            <HistoryItem
              label="Original Status"
              value={
                normalizedEvent.status ||
                "Scheduled"
              }
            />
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirmation && (
        <ConfirmationDialog
          eventTitle={
            normalizedEvent.title
          }
          originalSchedule={
            originalSchedule
          }
          newSchedule={
            updatedSchedule
          }
          reason={reason}
          notifyParticipants={
            notifyParticipants
          }
          onConfirm={
            confirmPostponement
          }
          onCancel={() =>
            setShowConfirmation(false)
          }
        />
      )}
    </section>
  );
};

/* ----------------------------------
   Schedule card
----------------------------------- */

const ScheduleCard = ({
  label,
  date,
  time,
  muted = false,
  highlighted = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlighted
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-900/10"
          : muted
          ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-wide ${
          highlighted
            ? "text-indigo-500"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <div className="mt-3 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            highlighted
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          <CalendarDays size={16} />
        </div>

        <div>
          <p
            className={`text-sm font-bold ${
              highlighted
                ? "text-indigo-900 dark:text-indigo-200"
                : "text-slate-700 dark:text-slate-200"
            }`}
          >
            {formatDate(date) ||
              "Not selected"}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {time ||
              "Time not selected"}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Form field
----------------------------------- */

const FormField = ({
  label,
  required = false,
  children,
}) => {
  return (
    <div className="mt-4">
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
};

/* ----------------------------------
   History item
----------------------------------- */

const HistoryItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({
  postponed,
}) => {
  return postponed ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <AlertTriangle size={11} />
      Postponed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-green-600 dark:bg-green-900/20 dark:text-green-400">
      <CheckCircle2 size={11} />
      Scheduled
    </span>
  );
};

/* ----------------------------------
   Confirmation dialog
----------------------------------- */

const ConfirmationDialog = ({
  eventTitle,
  originalSchedule,
  newSchedule,
  reason,
  notifyParticipants,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="postponement-confirmation-title"
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertTriangle size={19} />
            </div>

            <div>
              <h3
                id="postponement-confirmation-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                Confirm Event Postponement
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                This will update the event status and schedule.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close confirmation"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
          <p className="text-xs font-bold text-slate-800 dark:text-white">
            {eventTitle}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ConfirmationItem
              label="Original"
              value={
                originalSchedule
              }
            />

            <ConfirmationItem
              label="New"
              value={
                newSchedule
              }
            />
          </div>

          <div className="mt-3">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Reason
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {reason}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <Info
            size={14}
            className="mt-0.5 shrink-0 text-indigo-500"
          />

          <p className="text-[10px] leading-4 text-slate-500 dark:text-slate-400">
            {notifyParticipants
              ? "Registered participants will be notified about the postponement."
              : "Participants will not receive an automatic postponement notification."}
          </p>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-xs font-bold text-white hover:bg-amber-600"
          >
            {notifyParticipants ? (
              <Send size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}

            Confirm Postponement
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Confirmation item
----------------------------------- */

const ConfirmationItem = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
        {value || "Not provided"}
      </p>
    </div>
  );
};

/* ----------------------------------
   Normalize event
----------------------------------- */

const normalizeEvent = (
  event = {}
) => {
  return {
    id:
      event.id ||
      event.eventId ||
      event._id ||
      null,

    title:
      event.title ||
      event.name ||
      "Event",

    date:
      event.date ||
      event.eventDate ||
      event.startDate ||
      "",

    time:
      event.time ||
      event.eventTime ||
      event.startTime ||
      "",

    venue:
      event.venue ||
      event.location ||
      event.address ||
      "",

    status:
      String(
        event.status ||
          "scheduled"
      ).toLowerCase(),

    newDate:
      event.newDate ||
      event.postponedTo ||
      "",

    newTime:
      event.newTime ||
      "",
  };
};

/* ----------------------------------
   Date helpers
----------------------------------- */

const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
};

const formatSchedule = (
  date,
  time
) => {
  const formattedDate =
    formatDate(date);

  if (
    formattedDate &&
    time
  ) {
    return `${formattedDate} at ${time}`;
  }

  return (
    formattedDate ||
    time ||
    "Not provided"
  );
};

const getTodayDate = () => {
  const today =
    new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default EventPostponementManagement;