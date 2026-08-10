import {
  AlertTriangle,
  CheckCircle2,
  Flag,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  EVENT_REPORT_REASONS,
  createEventReport,
  validateEventReport,
} from "../../utils/eventReportModerationUtils";

const EventReportForm = ({
  event = {},
  user = {},
  existingReport = null,
  onSubmit,
  onCancel,
  className = "",
}) => {
  const [reason, setReason] = useState(
    existingReport?.reason || ""
  );

  const [details, setDetails] = useState(
    existingReport?.details || ""
  );

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [submitted, setSubmitted] = useState(
    Boolean(existingReport)
  );

  const eventId =
    event.id ??
    event.eventId ??
    event.event_id ??
    "";

  const reporterId =
    user.id ??
    user.userId ??
    user.user_id ??
    "";

  const eventTitle =
    event.title ||
    event.name ||
    "this event";

  const handleSubmit = async (
    eventObject
  ) => {
    eventObject.preventDefault();

    if (isSubmitting || submitted) {
      return;
    }

    setError("");

    const validation =
      validateEventReport({
        eventId,
        reporterId,
        reason,
        details,
      });

    if (!validation.valid) {
      setError(
        validation.errors.join(" ")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const report = createEventReport({
        eventId,
        reporterId,
        reason,
        details,
      });

      await onSubmit?.(report);

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Unable to submit the event report."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section
        className={`w-full rounded-2xl border border-green-200 bg-white p-6 shadow-sm dark:border-green-900/50 dark:bg-slate-900 ${className}`}
      >
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2
              size={28}
              className="text-green-600 dark:text-green-400"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">
            Report Submitted
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Thank you for helping keep Eventra safe.
            Your report for{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {eventTitle}
            </span>{" "}
            has been submitted for moderator review.
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Report status
            </p>

            <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
              Pending Review
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
            <Flag
              size={21}
              className="text-red-600 dark:text-red-400"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Report Event
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Help us identify spam, misleading,
              duplicate, or inappropriate event content.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Event being reported
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
            {eventTitle}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5"
      >
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400"
          >
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label
            htmlFor="event-report-reason"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Why are you reporting this event? *
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Select the reason that best describes the
            problem.
          </p>

          <div className="mt-3 space-y-2">
            {EVENT_REPORT_REASONS.map(
              (reportReason) => {
                const selected =
                  reason ===
                  reportReason.id;

                return (
                  <button
                    key={reportReason.id}
                    type="button"
                    onClick={() =>
                      setReason(
                        reportReason.id
                      )
                    }
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                        : "border-slate-200 bg-white hover:border-red-200 dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-red-600 bg-red-600"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-slate-800 dark:text-white">
                        {reportReason.label}
                      </span>

                      {reportReason.description && (
                        <span className="mt-1 block text-[11px] leading-5 text-slate-400">
                          {
                            reportReason.description
                          }
                        </span>
                      )}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mt-5">
          <label
            htmlFor="event-report-details"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Additional details
          </label>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Provide any information that can help
            moderators review the report.
          </p>

          <textarea
            id="event-report-details"
            value={details}
            onChange={(eventObject) =>
              setDetails(
                eventObject.target.value
              )
            }
            rows={5}
            maxLength={2000}
            placeholder="Describe the issue with this event..."
            className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-red-400"
          />

          <p className="mt-1 text-right text-[11px] text-slate-400">
            {details.length}/2000
          </p>
        </div>

        {/* Privacy notice */}
        <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={17}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />

            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Moderator review
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Reports are reviewed by authorized
                moderators. Please only report content that
                violates Eventra's rules or appears incorrect
                or suspicious.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X size={16} />
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !reason
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Send size={16} />

            {isSubmitting
              ? "Submitting..."
              : "Submit Report"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EventReportForm;