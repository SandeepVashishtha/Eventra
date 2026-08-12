import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import { useState } from "react";

const CANCELLATION_REASONS = [
  {
    id: "schedule-conflict",
    label: "Schedule conflict",
  },
  {
    id: "personal-reasons",
    label: "Personal reasons",
  },
  {
    id: "event-location",
    label: "Event location",
  },
  {
    id: "event-timing",
    label: "Event timing",
  },
  {
    id: "another-event",
    label: "Found another event",
  },
  {
    id: "other",
    label: "Other",
  },
];

const EventCancellationReasonModal = ({
  isOpen,
  event,
  registrationId,
  onClose,
  onConfirmCancellation,
  className = "",
}) => {
  const [selectedReason, setSelectedReason] =
    useState("");

  const [explanation, setExplanation] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setSelectedReason("");
    setExplanation("");
    setError("");
    onClose?.();
  };

  const handleSubmit = async () => {
    setError("");

    if (!selectedReason) {
      setError(
        "Please select a cancellation reason."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirmCancellation?.({
        registrationId,
        eventId: event?.id,
        reason: selectedReason,
        reasonLabel:
          CANCELLATION_REASONS.find(
            (reason) =>
              reason.id ===
              selectedReason
          )?.label,
        explanation:
          explanation.trim(),
      });

      setSelectedReason("");
      setExplanation("");
      onClose?.();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to cancel your registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancellation-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
              <AlertTriangle
                size={21}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Registration Cancellation
              </p>

              <h2
                id="cancellation-title"
                className="mt-1 text-xl font-bold text-slate-900 dark:text-white"
              >
                Cancel Registration
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Tell us why you are cancelling.
                Your feedback helps organizers improve
                future events.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close cancellation dialog"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Event summary */}
        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
              {event?.title ||
                event?.name ||
                "Event"}
            </h3>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {event?.date && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={12} />

                  <span className="text-[8px]">
                    {formatDate(
                      event.date
                    )}
                  </span>
                </div>
              )}

              {event?.time && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={12} />

                  <span className="text-[8px]">
                    {event.time}
                  </span>
                </div>
              )}

              {event?.venue && (
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={12} />

                  <span className="truncate text-[8px]">
                    {event.venue}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[8px] font-semibold text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Reasons */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Why are you cancelling?
              </label>

              <span className="text-[7px] text-slate-400">
                Required
              </span>
            </div>

            <div className="mt-3 grid gap-2">
              {CANCELLATION_REASONS.map(
                (reason) => {
                  const selected =
                    selectedReason ===
                    reason.id;

                  return (
                    <button
                      key={reason.id}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        setSelectedReason(
                          reason.id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/10"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {selected && (
                          <CheckCircle2
                            size={13}
                          />
                        )}
                      </span>

                      <span
                        className={`flex-1 text-[9px] font-semibold ${
                          selected
                            ? "text-red-700 dark:text-red-400"
                            : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {reason.label}
                      </span>

                      <ChevronRight
                        size={14}
                        className="text-slate-300"
                      />
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label
                htmlFor="cancellation-explanation"
                className="text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                Additional explanation
              </label>

              <span className="text-[7px] text-slate-400">
                Optional
              </span>
            </div>

            <textarea
              id="cancellation-explanation"
              value={explanation}
              onChange={(event) =>
                setExplanation(
                  event.target.value
                )
              }
              maxLength={500}
              rows={4}
              disabled={isSubmitting}
              placeholder="Tell the organizer anything else that may be helpful..."
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-900/30"
            />

            <div className="mt-1 text-right text-[7px] text-slate-400">
              {explanation.length}/500
            </div>
          </div>

          {/* Privacy note */}
          <div className="mt-5 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
            <p className="text-[7px] leading-4 text-slate-400">
              Your selected reason and optional explanation
              may be used by the organizer for event
              improvement and cancellation analytics.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Keep Registration
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-red-600 px-5 py-3 text-[8px] font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Cancelling..."
              : "Cancel Registration"}
          </button>
        </div>
      </div>
    </div>
  );
};

const formatDate = (value) => {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export default EventCancellationReasonModal;