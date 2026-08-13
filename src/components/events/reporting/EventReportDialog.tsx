
import React, { useState } from "react";

interface EventReportDialogProps {
  eventId: string;
  eventName?: string;
  open?: boolean;
  onClose?: () => void;
  onSubmit?: (report: {
    eventId: string;
    reason: string;
    details?: string;
  }) => void | Promise<void>;
}

const REPORT_REASONS = [
  {
    value: "misleading_information",
    label: "Misleading information",
    description:
      "The event contains information that may mislead participants.",
  },
  {
    value: "duplicate_event",
    label: "Duplicate event",
    description:
      "This event appears to duplicate another event.",
  },
  {
    value: "inappropriate_content",
    label: "Inappropriate content",
    description:
      "The event contains inappropriate or offensive content.",
  },
  {
    value: "suspicious_event",
    label: "Suspicious event",
    description:
      "The event appears suspicious, fraudulent, or unsafe.",
  },
  {
    value: "incorrect_information",
    label: "Incorrect information",
    description:
      "Important event information appears to be incorrect.",
  },
  {
    value: "other",
    label: "Other",
    description:
      "Report another issue not covered above.",
  },
];

const MAX_DETAILS_LENGTH = 500;

const EventReportDialog: React.FC<
  EventReportDialogProps
> = ({
  eventId,
  eventName,
  open = false,
  onClose,
  onSubmit,
}) => {
  const [selectedReason, setSelectedReason] =
    useState("");

  const [details, setDetails] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const resetForm = () => {
    setSelectedReason("");
    setDetails("");
    setError("");
    setSubmitting(false);
    setSubmitted(false);
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    resetForm();
    onClose?.();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!selectedReason) {
      setError(
        "Please select a reason for reporting this event."
      );
      return;
    }

    if (details.trim().length > MAX_DETAILS_LENGTH) {
      setError(
        `Additional details must be ${MAX_DETAILS_LENGTH} characters or less.`
      );
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit?.({
        eventId,
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      setSubmitted(true);
    } catch {
      setError(
        "We could not submit your report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-report-title"
        aria-describedby="event-report-description"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-950">
              🚩
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                Event Safety
              </p>

              <h2
                id="event-report-title"
                className="mt-1 text-lg font-bold text-gray-900 dark:text-white"
              >
                Report Event
              </h2>

              {eventName && (
                <p className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                  {eventName}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close report dialog"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Submitted state */}
        {submitted ? (
          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl dark:bg-green-950">
              ✓
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
              Report submitted
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
              Thank you for helping keep Eventra safe.
              Your report has been submitted for review.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6"
          >
            <p
              id="event-report-description"
              className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400"
            >
              Tell us what is wrong with this event.
              Reports are reviewed by authorized
              moderators.
            </p>

            {/* Reason */}
            <fieldset>
              <legend className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Why are you reporting this event?
              </legend>

              <div className="mt-3 space-y-2">
                {REPORT_REASONS.map(
                  (reason) => {
                    const selected =
                      selectedReason ===
                      reason.value;

                    return (
                      <label
                        key={reason.value}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                          selected
                            ? "border-red-500 bg-red-50 dark:border-red-700 dark:bg-red-950/40"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        }`}
                      >
                        <input
                          type="radio"
                          name="event-report-reason"
                          value={reason.value}
                          checked={selected}
                          onChange={(event) => {
                            setSelectedReason(
                              event.target.value
                            );
                            setError("");
                          }}
                          className="mt-1 h-4 w-4 accent-red-600"
                        />

                        <span className="min-w-0">
                          <span
                            className={`block text-sm font-semibold ${
                              selected
                                ? "text-red-800 dark:text-red-300"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {reason.label}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {reason.description}
                          </span>
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            </fieldset>

            {/* Details */}
            <div className="mt-6">
              <label
                htmlFor="event-report-details"
                className="block text-sm font-bold text-gray-800 dark:text-gray-200"
              >
                Additional details
                <span className="ml-1 font-normal text-gray-400">
                  (optional)
                </span>
              </label>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Provide any information that may help
                moderators understand the issue.
              </p>

              <textarea
                id="event-report-details"
                value={details}
                onChange={(event) => {
                  setDetails(
                    event.target.value
                  );
                  setError("");
                }}
                maxLength={MAX_DETAILS_LENGTH}
                rows={5}
                placeholder="Describe the issue..."
                className="mt-3 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-red-950"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {details.length}/
                {MAX_DETAILS_LENGTH}
              </p>
            </div>

            {/* Privacy notice */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
              <span className="text-lg">
                🔒
              </span>

              <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  Moderation information is private
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400">
                  Your report is sent for moderation
                  review. Private moderation notes and
                  other users' reports are not exposed.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                role="alert"
              >
                ⚠️ {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !selectedReason
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EventReportDialog;