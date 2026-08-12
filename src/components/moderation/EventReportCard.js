import {
  AlertTriangle,
  Check,
  Clock3,
  Flag,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  EVENT_REPORT_STATUS,
  getEventReportReasonLabel,
  getEventReportStatusLabel,
} from "../../utils/eventReportModerationUtils";

const EventReportCard = ({
  report = {},
  isModerator = false,
  onResolve,
  onReject,
  onComment,
  className = "",
}) => {
  const [comment, setComment] = useState("");
  const [isCommentOpen, setIsCommentOpen] =
    useState(false);
  const [isProcessing, setIsProcessing] =
    useState(false);

  const status =
    report.status ||
    EVENT_REPORT_STATUS.PENDING;

  const statusLabel =
    getEventReportStatusLabel(status);

  const reasonLabel =
    getEventReportReasonLabel(
      report.reason
    );

  const eventTitle =
    report.eventTitle ||
    report.eventName ||
    report.event?.title ||
    report.event?.name ||
    "Unknown Event";

  const handleResolve = async () => {
    if (!onResolve || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await onResolve(report);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await onReject(report);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommentSubmit = async (
    event
  ) => {
    event.preventDefault();

    const value = comment.trim();

    if (!value || !onComment) {
      return;
    }

    setIsProcessing(true);

    try {
      await onComment(
        report,
        value
      );

      setComment("");
      setIsCommentOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPending =
    status ===
    EVENT_REPORT_STATUS.PENDING;

  return (
    <article
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <Flag
                size={20}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Event Report
                </h3>

                <StatusBadge
                  status={status}
                  label={statusLabel}
                />
              </div>

              <p className="mt-1 truncate text-sm font-semibold text-slate-600 dark:text-slate-300">
                {eventTitle}
              </p>

              {report.createdAt && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock3 size={12} />
                  Reported{" "}
                  {formatDateTime(
                    report.createdAt
                  )}
                </p>
              )}
            </div>
          </div>

          {report.id && (
            <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {report.id}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Reason */}
        <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={15}
              className="text-red-500"
            />

            <h4 className="text-xs font-semibold text-red-700 dark:text-red-300">
              Report Reason
            </h4>
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {reasonLabel}
          </p>
        </div>

        {/* Reporter */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoItem
            label="Reporter"
            value={
              report.reporterName ||
              report.reporter?.name ||
              report.reporterEmail ||
              report.reporter?.email ||
              "Anonymous"
            }
          />

          <InfoItem
            label="Event ID"
            value={
              report.eventId ||
              report.event?.id ||
              "Not available"
            }
          />
        </div>

        {/* Details */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare
              size={15}
              className="text-slate-500"
            />

            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Additional Details
            </h4>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
            {report.details ||
              "No additional details provided."}
          </p>
        </div>

        {/* Resolution */}
        {report.resolutionComment && (
          <div
            className={`mt-4 rounded-xl border p-4 ${
              status ===
              EVENT_REPORT_STATUS.RESOLVED
                ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
                : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check
                size={15}
                className={
                  status ===
                  EVENT_REPORT_STATUS.RESOLVED
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-500"
                }
              />

              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Moderator Resolution
              </h4>
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
              {report.resolutionComment}
            </p>

            {report.resolvedAt && (
              <p className="mt-2 text-[11px] text-slate-400">
                Updated{" "}
                {formatDateTime(
                  report.resolvedAt
                )}
              </p>
            )}
          </div>
        )}

        {/* Moderator actions */}
        {isModerator && isPending && (
          <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row">
              {onResolve && (
                <button
                  type="button"
                  disabled={
                    isProcessing
                  }
                  onClick={
                    handleResolve
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={16} />
                  Resolve Report
                </button>
              )}

              {onReject && (
                <button
                  type="button"
                  disabled={
                    isProcessing
                  }
                  onClick={
                    handleReject
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                  Dismiss Report
                </button>
              )}

              {onComment && (
                <button
                  type="button"
                  disabled={
                    isProcessing
                  }
                  onClick={() =>
                    setIsCommentOpen(
                      (current) =>
                        !current
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                >
                  <MessageSquare
                    size={16}
                  />
                  Comment
                </button>
              )}
            </div>

            {/* Comment form */}
            {isCommentOpen &&
              onComment && (
                <form
                  onSubmit={
                    handleCommentSubmit
                  }
                  className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <label
                    htmlFor={`event-report-comment-${report.id}`}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Moderator comment
                  </label>

                  <textarea
                    id={`event-report-comment-${report.id}`}
                    value={comment}
                    onChange={(
                      eventObject
                    ) =>
                      setComment(
                        eventObject
                          .target
                          .value
                      )
                    }
                    rows={3}
                    maxLength={1000}
                    placeholder="Add a note about this report..."
                    className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />

                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        isProcessing ||
                        !comment.trim()
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      <Send size={14} />
                      Add Comment
                    </button>
                  </div>
                </form>
              )}
          </div>
        )}

        {/* Resolved state */}
        {!isPending &&
          status ===
            EVENT_REPORT_STATUS.RESOLVED && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-900/10">
              <Check
                size={17}
                className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
              />

              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                  Report resolved
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  A moderator has reviewed this report
                  and recorded a resolution.
                </p>
              </div>
            </div>
          )}

        {/* Dismissed state */}
        {!isPending &&
          status ===
            EVENT_REPORT_STATUS.DISMISSED && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
              <X
                size={17}
                className="mt-0.5 shrink-0 text-slate-500"
              />

              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Report dismissed
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  The moderator reviewed the report and
                  determined that no moderation action was
                  required.
                </p>
              </div>
            </div>
          )}
      </div>
    </article>
  );
};

/**
 * Small information field.
 */
const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
};

/**
 * Report status badge.
 */
const StatusBadge = ({
  status,
  label,
}) => {
  const config = {
    [EVENT_REPORT_STATUS.PENDING]: {
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      icon: Clock3,
    },

    [EVENT_REPORT_STATUS.RESOLVED]: {
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      icon: Check,
    },

    [EVENT_REPORT_STATUS.DISMISSED]: {
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
      icon: X,
    },
  };

  const current =
    config[status] ||
    {
      className:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      icon: AlertTriangle,
    };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
    >
      <Icon size={10} />
      {label}
    </span>
  );
};

/**
 * Format timestamp safely.
 */
const formatDateTime = (
  value
) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

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
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default EventReportCard;