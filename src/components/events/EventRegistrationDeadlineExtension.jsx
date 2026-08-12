import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  History,
  Info,
  X,
} from "lucide-react";
import { useState } from "react";

const EventRegistrationDeadlineExtension = ({
  eventId,
  eventTitle = "Event",
  currentDeadline = "",
  initialExtensionReason = "",
  onExtendDeadline,
  className = "",
}) => {
  const [newDeadline, setNewDeadline] =
    useState("");

  const [reason, setReason] =
    useState(initialExtensionReason);

  const [notifyUsers, setNotifyUsers] =
    useState(true);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [previousDeadline, setPreviousDeadline] =
    useState(currentDeadline);

  const getDateTime = (value) => {
    if (!value) return null;

    return new Date(value);
  };

  const formatDeadline = (value) => {
    const date = getDateTime(value);

    if (!date || Number.isNaN(date.getTime())) {
      return "Not set";
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const validateDeadline = () => {
    setError("");

    if (!newDeadline) {
      setError(
        "Please select a new registration deadline."
      );
      return false;
    }

    const newDate =
      getDateTime(newDeadline);

    if (!newDate) {
      setError(
        "Please enter a valid deadline."
      );
      return false;
    }

    const currentDate =
      getDateTime(currentDeadline);

    if (
      currentDate &&
      newDate <= currentDate
    ) {
      setError(
        "The new deadline must be later than the current deadline."
      );
      return false;
    }

    if (newDate <= new Date()) {
      setError(
        "The new deadline must be in the future."
      );
      return false;
    }

    return true;
  };

  const handleOpenConfirmation = () => {
    setSuccess("");

    if (validateDeadline()) {
      setShowConfirmation(true);
    }
  };

  const handleExtendDeadline = async () => {
    setIsSubmitting(true);
    setError("");

    const payload = {
      eventId,
      eventTitle,
      previousDeadline:
        currentDeadline,
      newDeadline,
      reason: reason.trim(),
      notifyUsers,
    };

    try {
      if (onExtendDeadline) {
        await onExtendDeadline(payload);
      }

      setPreviousDeadline(newDeadline);

      setShowConfirmation(false);

      setSuccess(
        "Registration deadline has been extended successfully."
      );

      setNewDeadline("");
      setReason("");
    } catch (err) {
      setError(
        err?.message ||
          "Unable to extend the registration deadline."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const minimumDateTime = () => {
    const current =
      getDateTime(currentDeadline);

    const now = new Date();

    const minimum =
      current && current > now
        ? current
        : now;

    const offset =
      minimum.getTimezoneOffset();

    const localDate = new Date(
      minimum.getTime() -
        offset * 60 * 1000
    );

    return localDate
      .toISOString()
      .slice(0, 16);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <CalendarClock
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Control
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Extend Registration Deadline
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Extend the registration period without modifying
              the original event.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
            Event
          </p>

          <p className="mt-1 max-w-[180px] truncate text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
            {eventTitle}
          </p>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
          <CheckCircle2
            size={15}
            className="text-green-600 dark:text-green-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-green-700 dark:text-green-400">
            {success}
          </p>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-green-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/30 dark:bg-red-900/10">
          <AlertCircle
            size={15}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-red-700 dark:text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Current deadline */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <History
              size={15}
              className="text-slate-400"
            />

            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Current Deadline
            </p>
          </div>

          <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
            {formatDeadline(
              previousDeadline
            )}
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            Previous registration closing time
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex items-center gap-2">
            <CalendarClock
              size={15}
              className="text-indigo-500"
            />

            <p className="text-[8px] font-bold uppercase tracking-wide text-indigo-500">
              New Deadline
            </p>
          </div>

          <p className="mt-3 text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {newDeadline
              ? formatDeadline(
                  newDeadline
                )
              : "Not selected"}
          </p>

          <p className="mt-1 text-[7px] text-indigo-500/70">
            Must be later than the current deadline
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-5">
          {/* Deadline */}
          <div>
            <label
              htmlFor="registration-new-deadline"
              className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              New Registration Deadline
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <div className="relative mt-2">
              <CalendarClock
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="registration-new-deadline"
                type="datetime-local"
                min={minimumDateTime()}
                value={newDeadline}
                onChange={(event) => {
                  setNewDeadline(
                    event.target.value
                  );
                  setError("");
                  setSuccess("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pl-9 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <p className="mt-2 text-[7px] text-slate-400">
              The new deadline must be later than the existing
              deadline.
            </p>
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="extension-reason"
              className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Reason
              <span className="ml-1 text-[7px] font-normal normal-case text-slate-400">
                Optional
              </span>
            </label>

            <textarea
              id="extension-reason"
              rows={4}
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              placeholder="Example: Registration extended due to participant requests..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <p className="mt-2 text-right text-[7px] text-slate-400">
              {reason.length}/500
            </p>
          </div>

          {/* Notification */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <input
              type="checkbox"
              checked={notifyUsers}
              onChange={(event) =>
                setNotifyUsers(
                  event.target.checked
                )
              }
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Bell
                  size={14}
                  className="text-indigo-500"
                />

                <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                  Notify interested users
                </p>
              </div>

              <p className="mt-1 text-[7px] leading-4 text-slate-400">
                Send a notification about the updated registration
                deadline.
              </p>
            </div>
          </label>

          {/* Info */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
            <Info
              size={14}
              className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
            />

            <p className="text-[8px] leading-4 text-blue-700 dark:text-blue-300">
              The previous deadline will be retained in the event
              history after the extension is applied.
            </p>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
            Ready to extend?
          </p>

          <p className="mt-1 text-[7px] text-indigo-600/70 dark:text-indigo-400">
            Review the new deadline before applying the change.
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleOpenConfirmation
          }
          disabled={!newDeadline}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarClock size={13} />
          Extend Deadline
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <CalendarClock
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Confirm Deadline Extension
                </h3>

                <p className="mt-1 text-[8px] leading-4 text-slate-400">
                  This will update the registration deadline for{" "}
                  <strong>
                    {eventTitle}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowConfirmation(
                    false
                  )
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <ConfirmationRow
                label="Previous deadline"
                value={formatDeadline(
                  previousDeadline
                )}
              />

              <ConfirmationRow
                label="New deadline"
                value={formatDeadline(
                  newDeadline
                )}
                highlighted
              />

              <ConfirmationRow
                label="Notify users"
                value={
                  notifyUsers
                    ? "Yes"
                    : "No"
                }
              />

              {reason.trim() && (
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                    Reason
                  </p>

                  <p className="mt-1 text-[8px] leading-4 text-slate-600 dark:text-slate-300">
                    {reason}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  setShowConfirmation(
                    false
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={
                  handleExtendDeadline
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Updating..."
                  : "Confirm Extension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const ConfirmationRow = ({
  label,
  value,
  highlighted = false,
}) => (
  <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p
      className={`text-right text-[8px] font-bold ${
        highlighted
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-700 dark:text-slate-300"
      }`}
    >
      {value}
    </p>
  </div>
);

export default EventRegistrationDeadlineExtension;