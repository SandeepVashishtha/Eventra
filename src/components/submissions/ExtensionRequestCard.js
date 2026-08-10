import {
  CalendarClock,
  Check,
  Clock3,
  MessageSquare,
  Send,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  EXTENSION_REQUEST_STATUS,
  getExtensionRequestStatusLabel,
} from "../../utils/submissionExtensionUtils";

const ExtensionRequestCard = ({
  request = {},
  isOrganizer = false,
  onApprove,
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
    request.status ||
    EXTENSION_REQUEST_STATUS.PENDING;

  const statusLabel =
    getExtensionRequestStatusLabel(status);

  const handleApprove = async () => {
    if (!onApprove || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      await onApprove(request);
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
      await onReject(request);
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
      await onComment(request, value);
      setComment("");
      setIsCommentOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPending =
    status ===
    EXTENSION_REQUEST_STATUS.PENDING;

  return (
    <article
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-700">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              Submission Deadline Extension
            </h3>

            <StatusBadge status={status} />
          </div>

          {request.requestedAt && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Clock3 size={12} />
              Requested{" "}
              {formatDateTime(
                request.requestedAt
              )}
            </p>
          )}
        </div>

        {request.id && (
          <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {request.id}
          </span>
        )}
      </div>

      {/* Request details */}
      <div className="p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard
            icon={CalendarClock}
            label="Current Deadline"
            value={formatDateTime(
              request.originalDeadline
            )}
          />

          <InfoCard
            icon={CalendarClock}
            label="Requested Deadline"
            value={formatDateTime(
              request.requestedDeadline
            )}
            highlighted
          />
        </div>

        {/* Team */}
        {request.teamInformation && (
          <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Users
                size={15}
                className="text-indigo-500"
              />

              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Team Information
              </h4>
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
              {request.teamInformation}
            </p>
          </div>
        )}

        {/* Reason */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare
              size={15}
              className="text-slate-500"
            />

            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Reason
            </h4>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
            {request.reason ||
              "No reason provided."}
          </p>
        </div>

        {/* Organizer decision */}
        {request.decisionComment && (
          <div
            className={`mt-4 rounded-xl border p-4 ${
              status ===
              EXTENSION_REQUEST_STATUS.APPROVED
                ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
                : "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare
                size={15}
                className={
                  status ===
                  EXTENSION_REQUEST_STATUS.APPROVED
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              />

              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Organizer Comment
              </h4>
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
              {request.decisionComment}
            </p>

            {request.decidedAt && (
              <p className="mt-2 text-[11px] text-slate-400">
                Decision made{" "}
                {formatDateTime(
                  request.decidedAt
                )}
              </p>
            )}
          </div>
        )}

        {/* Organizer actions */}
        {isOrganizer && isPending && (
          <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
            <div className="flex flex-col gap-3 sm:flex-row">
              {onApprove && (
                <button
                  type="button"
                  disabled={
                    isProcessing
                  }
                  onClick={
                    handleApprove
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check size={16} />
                  Approve Request
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
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <X size={16} />
                  Reject Request
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
                    htmlFor={`extension-comment-${request.id}`}
                    className="text-xs font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Organizer comment
                  </label>

                  <textarea
                    id={`extension-comment-${request.id}`}
                    value={comment}
                    onChange={(
                      event
                    ) =>
                      setComment(
                        event.target
                          .value
                      )
                    }
                    rows={3}
                    maxLength={1000}
                    placeholder="Add a note for the participant..."
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
      </div>
    </article>
  );
};

/**
 * Information card used for deadline values.
 */
const InfoCard = ({
  icon: Icon,
  label,
  value,
  highlighted = false,
}) => {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlighted
          ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-900/10"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className={
            highlighted
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-400"
          }
        />

        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 text-sm font-semibold ${
          highlighted
            ? "text-indigo-700 dark:text-indigo-300"
            : "text-slate-700 dark:text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

/**
 * Request status badge.
 */
const StatusBadge = ({
  status,
}) => {
  const config = {
    [EXTENSION_REQUEST_STATUS.PENDING]: {
      label: "Pending",
      icon: Clock3,
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },

    [EXTENSION_REQUEST_STATUS.APPROVED]: {
      label: "Approved",
      icon: Check,
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },

    [EXTENSION_REQUEST_STATUS.REJECTED]: {
      label: "Rejected",
      icon: X,
      className:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  };

  const current =
    config[status] || {
      label: "Unknown",
      icon: Clock3,
      className:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${current.className}`}
    >
      <Icon size={10} />
      {current.label}
    </span>
  );
};

/**
 * Format date/time safely.
 */
const formatDateTime = (
  value
) => {
  if (!value) {
    return "Not specified";
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

export default ExtensionRequestCard;