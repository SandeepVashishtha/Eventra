import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";

const REJECTION_REASONS = [
  {
    value: "not_eligible",
    label: "Not eligible",
  },
  {
    value: "capacity_reached",
    label: "Event capacity reached",
  },
  {
    value: "missing_information",
    label: "Missing required information",
  },
  {
    value: "invalid_documents",
    label: "Invalid documents",
  },
  {
    value: "other",
    label: "Other",
  },
];

const RegistrationRejectionFeedback = ({
  registration,
  onReject,
  onCancel,
  isSubmitting = false,
  className = "",
}) => {
  const [reason, setReason] =
    useState("");

  const [customReason, setCustomReason] =
    useState("");

  const [notifyParticipant, setNotifyParticipant] =
    useState(true);

  const [error, setError] =
    useState("");

  const selectedReason =
    REJECTION_REASONS.find(
      (item) =>
        item.value === reason
    );

  const finalReason =
    reason === "other"
      ? customReason.trim()
      : selectedReason?.label || "";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reason) {
      setError(
        "Please select a rejection reason."
      );
      return;
    }

    if (
      reason === "other" &&
      !customReason.trim()
    ) {
      setError(
        "Please enter a rejection reason."
      );
      return;
    }

    setError("");

    await onReject?.({
      registrationId:
        registration?.id,
      participantId:
        registration?.participantId,
      participantName:
        registration?.participantName,
      eventId:
        registration?.eventId,
      reason: finalReason,
      reasonCode: reason,
      notifyParticipant,
      rejectedAt:
        new Date().toISOString(),
    });
  };

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Registration Review
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              Reject Registration
            </h2>

            <p className="mt-1 text-[8px] text-slate-500 dark:text-slate-400">
              Provide a clear reason so the participant
              understands the decision.
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Participant */}
      <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Participant
        </p>

        <p className="mt-1 text-[9px] font-bold text-slate-800 dark:text-white">
          {registration?.participantName ||
            "Participant"}
        </p>

        {registration?.email && (
          <p className="mt-1 text-[7px] text-slate-400">
            {registration.email}
          </p>
        )}

        {registration?.eventName && (
          <p className="mt-2 text-[7px] text-slate-500 dark:text-slate-400">
            Event:{" "}
            <span className="font-semibold">
              {registration.eventName}
            </span>
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >
        {/* Reason */}
        <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
          Rejection Reason
          <span className="ml-1 text-red-500">
            *
          </span>
        </label>

        <div className="relative mt-2">
          <select
            value={reason}
            onChange={(event) => {
              setReason(
                event.target.value
              );
              setError("");
            }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-xs outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">
              Select a reason
            </option>

            {REJECTION_REASONS.map(
              (item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              )
            )}
          </select>

          <ChevronDown
            size={15}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>

        {/* Other reason */}
        {reason === "other" && (
          <div className="mt-4">
            <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
              Custom Reason
              <span className="ml-1 text-red-500">
                *
              </span>
            </label>

            <textarea
              value={customReason}
              onChange={(event) => {
                setCustomReason(
                  event.target.value
                );
                setError("");
              }}
              rows={4}
              maxLength={500}
              placeholder="Enter a clear reason for rejecting this registration..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-red-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <p className="mt-1 text-right text-[6px] text-slate-400">
              {customReason.length}/500
            </p>
          </div>
        )}

        {/* Preview */}
        {finalReason && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <MessageSquare
                size={16}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />

              <div>
                <p className="text-[7px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Participant Notification Preview
                </p>

                <p className="mt-2 text-[8px] leading-4 text-amber-800/80 dark:text-amber-300/80">
                  Your registration for{" "}
                  <strong>
                    {registration?.eventName ||
                      "this event"}
                  </strong>{" "}
                  has been rejected.
                </p>

                <p className="mt-2 text-[8px] leading-4 text-amber-800/80 dark:text-amber-300/80">
                  Reason:{" "}
                  <strong>
                    {finalReason}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification toggle */}
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <Bell size={15} />
            </div>

            <div>
              <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                Notify participant
              </p>

              <p className="mt-1 text-[6px] leading-3 text-slate-400">
                Send the rejection reason through the
                notification system.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={
              notifyParticipant
            }
            onClick={() =>
              setNotifyParticipant(
                (current) =>
                  !current
              )
            }
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              notifyParticipant
                ? "bg-indigo-600"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                notifyParticipant
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <AlertCircle size={13} />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-[8px] font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Rejecting...
              </>
            ) : (
              <>
                <Send size={13} />
                Reject Registration
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* --------------------------------
   Registration List
--------------------------------- */

export const RegistrationRejectionList = ({
  registrations = [],
  onReject,
}) => {
  const [selectedRegistration, setSelectedRegistration] =
    useState(null);

  const [success, setSuccess] =
    useState(false);

  const handleReject = async (
    rejection
  ) => {
    await onReject?.(rejection);

    setSelectedRegistration(null);
    setSuccess(true);

    setTimeout(
      () => setSuccess(false),
      3000
    );
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />
          Registration rejected and participant notification
          sent successfully.
        </div>
      )}

      {registrations.map(
        (registration) => (
          <div
            key={registration.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[9px] font-bold text-slate-800 dark:text-white">
                {registration.participantName}
              </p>

              <p className="mt-1 text-[7px] text-slate-400">
                {registration.email}
              </p>

              <span className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-[6px] font-bold text-amber-600 dark:bg-amber-900/10 dark:text-amber-400">
                {registration.status ||
                  "Pending"}
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedRegistration(
                  registration
                )
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )
      )}

      {selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
          <div className="w-full max-w-xl">
            <RegistrationRejectionFeedback
              registration={
                selectedRegistration
              }
              onReject={
                handleReject
              }
              onCancel={() =>
                setSelectedRegistration(
                  null
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationRejectionFeedback;