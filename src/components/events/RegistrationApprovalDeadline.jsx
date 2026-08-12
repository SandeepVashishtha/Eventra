import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const RegistrationApprovalDeadline = ({
  registrations = [],
  approvalDeadline,
  onApprove,
  onReject,
  onRemind,
  onDeadlineChange,
  className = "",
}) => {
  const [deadline, setDeadline] = useState(
    approvalDeadline || ""
  );

  const [processingId, setProcessingId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const now = new Date();

  const pendingRegistrations = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.status === "pending"
      ),
    [registrations]
  );

  const overdueRegistrations = useMemo(
    () =>
      pendingRegistrations.filter((registration) => {
        if (registration.reviewDeadline) {
          return (
            new Date(
              registration.reviewDeadline
            ) < now
          );
        }

        return (
          deadline &&
          new Date(deadline) < now
        );
      }),
    [pendingRegistrations, deadline]
  );

  const handleDeadlineChange = async (
    value
  ) => {
    setDeadline(value);
    setError("");
    setSuccess("");

    try {
      await onDeadlineChange?.(value);

      setSuccess(
        "Approval deadline updated successfully."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update approval deadline."
      );
    }
  };

  const handleApprove = async (
    registration
  ) => {
    setProcessingId(registration.id);
    setError("");
    setSuccess("");

    try {
      await onApprove?.(registration);

      setSuccess(
        `${registration.name || "Participant"} has been approved.`
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to approve registration."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (
    registration
  ) => {
    setProcessingId(registration.id);
    setError("");
    setSuccess("");

    try {
      await onReject?.(registration);

      setSuccess(
        `${registration.name || "Participant"} has been rejected.`
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to reject registration."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReminder = async (
    registration
  ) => {
    setProcessingId(
      `reminder-${registration.id}`
    );
    setError("");
    setSuccess("");

    try {
      await onRemind?.(registration);

      setSuccess(
        `Reminder sent for ${
          registration.name ||
          "pending registration"
        }.`
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to send reminder."
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Clock3 size={20} />
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Organizer Approval
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Registration Approval Deadline
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Set a deadline for reviewing pending registrations.
          </p>
        </div>
      </div>

      {/* Deadline Settings */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Clock3
            size={15}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            Approval Deadline
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="datetime-local"
            value={deadline}
            min={getDateTimeLocalValue()}
            onChange={(event) =>
              handleDeadlineChange(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <button
            type="button"
            onClick={() =>
              handleDeadlineChange("")
            }
            className="rounded-xl border border-slate-200 px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>

        {deadline && (
          <p className="mt-3 text-[7px] text-slate-400">
            Participants with unresolved registrations
            after this deadline will appear as overdue.
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Pending"
          value={pendingRegistrations.length}
          icon={
            <Clock3 size={15} />
          }
          type="pending"
        />

        <SummaryCard
          label="Overdue"
          value={overdueRegistrations.length}
          icon={
            <AlertCircle size={15} />
          }
          type="overdue"
        />

        <SummaryCard
          label="Approved"
          value={
            registrations.filter(
              (item) =>
                item.status ===
                "approved"
            ).length
          }
          icon={
            <CheckCircle2 size={15} />
          }
          type="approved"
        />

        <SummaryCard
          label="Rejected"
          value={
            registrations.filter(
              (item) =>
                item.status ===
                "rejected"
            ).length
          }
          icon={
            <XCircle size={15} />
          }
          type="rejected"
        />
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          <AlertCircle
            size={14}
            className="mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2
            size={14}
            className="mt-0.5 shrink-0"
          />
          <span>{success}</span>
        </div>
      )}

      {/* Overdue Applications */}
      {overdueRegistrations.length > 0 && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />

            <div>
              <p className="text-[9px] font-bold text-red-700 dark:text-red-400">
                Overdue Applications
              </p>

              <p className="mt-1 text-[7px] text-red-700/70 dark:text-red-400/70">
                {overdueRegistrations.length} pending
                registration
                {overdueRegistrations.length !==
                1
                  ? "s"
                  : ""}{" "}
                require immediate review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Registration List */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Pending Registrations
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Review applications before the deadline.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {pendingRegistrations.length}
          </span>
        </div>

        {pendingRegistrations.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900/30 dark:bg-green-900/10">
            <CheckCircle2
              size={24}
              className="mx-auto text-green-600 dark:text-green-400"
            />

            <p className="mt-3 text-[9px] font-bold text-green-700 dark:text-green-400">
              No pending registrations
            </p>

            <p className="mt-1 text-[7px] text-green-700/70 dark:text-green-400/70">
              All registration applications have been
              reviewed.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingRegistrations.map(
              (registration) => {
                const isOverdue =
                  overdueRegistrations.some(
                    (item) =>
                      item.id ===
                      registration.id
                  );

                const busy =
                  processingId ===
                  registration.id;

                const reminderBusy =
                  processingId ===
                  `reminder-${registration.id}`;

                return (
                  <RegistrationRow
                    key={
                      registration.id
                    }
                    registration={
                      registration
                    }
                    isOverdue={
                      isOverdue
                    }
                    busy={busy}
                    reminderBusy={
                      reminderBusy
                    }
                    onApprove={() =>
                      handleApprove(
                        registration
                      )
                    }
                    onReject={() =>
                      handleReject(
                        registration
                      )
                    }
                    onRemind={() =>
                      handleReminder(
                        registration
                      )
                    }
                  />
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Registration Row
--------------------------------- */

const RegistrationRow = ({
  registration,
  isOverdue,
  busy,
  reminderBusy,
  onApprove,
  onReject,
  onRemind,
}) => {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 dark:bg-slate-900 ${
        isOverdue
          ? "border-red-200 dark:border-red-900/30"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Participant */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {getInitials(
              registration.name
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9px] font-bold text-slate-800 dark:text-white">
                {registration.name ||
                  "Unknown Participant"}
              </p>

              {isOverdue && (
                <span className="rounded-full bg-red-50 px-2 py-1 text-[6px] font-bold text-red-600 dark:bg-red-900/10 dark:text-red-400">
                  Overdue
                </span>
              )}
            </div>

            <p className="mt-1 text-[7px] text-slate-400">
              {registration.email ||
                "No email provided"}
            </p>

            {registration.submittedAt && (
              <p className="mt-1 text-[7px] text-slate-400">
                Submitted:{" "}
                {formatDate(
                  registration.submittedAt
                )}
              </p>
            )}

            {(registration.reviewDeadline ||
              isOverdue) && (
              <p
                className={`mt-1 text-[7px] font-semibold ${
                  isOverdue
                    ? "text-red-500"
                    : "text-slate-400"
                }`}
              >
                Deadline:{" "}
                {registration.reviewDeadline
                  ? formatDate(
                      registration.reviewDeadline
                    )
                  : "Approval deadline reached"}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRemind}
            disabled={
              reminderBusy || busy
            }
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[7px] font-bold text-amber-600 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400"
          >
            <Bell size={12} />

            {reminderBusy
              ? "Sending..."
              : "Remind"}
          </button>

          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[7px] font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
          >
            <XCircle size={12} />

            Reject
          </button>

          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-[7px] font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle2 size={12} />

            {busy
              ? "Processing..."
              : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  label,
  value,
  icon,
  type,
}) => {
  const styles = {
    pending:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",

    overdue:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",

    approved:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",

    rejected:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles[type]}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Helpers
--------------------------------- */

const getInitials = (
  name = ""
) => {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word[0]?.toUpperCase()
      )
      .join("") || "P"
  );
};

const formatDate = (
  value
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const getDateTimeLocalValue =
  () => {
    const date = new Date();

    const offset =
      date.getTimezoneOffset();

    const localDate =
      new Date(
        date.getTime() -
          offset * 60 * 1000
      );

    return localDate
      .toISOString()
      .slice(0, 16);
  };

export default RegistrationApprovalDeadline;