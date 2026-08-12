import {
  CheckCircle2,
  Clock3,
  MessageSquare,
  Send,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
  },
  reviewed: {
    label: "Reviewed",
    icon: MessageSquare,
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
  },
};

const FeedbackResponse = ({
  feedback,
  onReply,
  onStatusChange,
  onResolve,
  className = "",
}) => {
  const [reply, setReply] = useState("");
  const [resolutionNote, setResolutionNote] =
    useState("");

  const [showResolution, setShowResolution] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const status =
    feedback?.status || "pending";

  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.pending;

  const StatusIcon = config.icon;

  const handleReply = async () => {
    if (!reply.trim()) {
      setError(
        "Please enter a response before sending."
      );
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onReply?.({
        feedbackId: feedback?.id,
        message: reply.trim(),
        notifyParticipant: true,
        createdAt:
          new Date().toISOString(),
      });

      setReply("");

      if (status === "pending") {
        await onStatusChange?.(
          feedback?.id,
          "reviewed"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNote.trim()) {
      setError(
        "Please enter a resolution note."
      );
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onResolve?.({
        feedbackId: feedback?.id,
        status: "resolved",
        resolutionNote:
          resolutionNote.trim(),
        resolvedAt:
          new Date().toISOString(),
        notifyParticipant: true,
      });

      setResolutionNote("");
      setShowResolution(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <MessageSquare size={20} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Feedback
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
              {feedback?.subject ||
                "Participant Feedback"}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[7px] text-slate-400">
                <User size={10} />
                {feedback?.participantName ||
                  "Participant"}
              </span>

              <StatusBadge
                status={status}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
        <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
          Feedback
        </p>

        <p className="mt-2 text-[8px] leading-5 text-slate-600 dark:text-slate-300">
          {feedback?.message ||
            "No feedback message available."}
        </p>

        {feedback?.rating && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-[7px] font-bold text-slate-400">
              Rating:
            </span>

            <span className="text-[8px] font-bold text-amber-500">
              {"★".repeat(
                Math.min(
                  feedback.rating,
                  5
                )
              )}
            </span>

            <span className="text-[7px] text-slate-400">
              {feedback.rating}/5
            </span>
          </div>
        )}
      </div>

      {/* Existing Response */}
      {feedback?.response && (
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Organizer Response
          </p>

          <p className="mt-2 text-[8px] leading-5 text-indigo-900/80 dark:text-indigo-200">
            {feedback.response}
          </p>

          {feedback.responseDate && (
            <p className="mt-2 text-[6px] text-indigo-500 dark:text-indigo-400">
              Responded{" "}
              {formatDate(
                feedback.responseDate
              )}
            </p>
          )}
        </div>
      )}

      {/* Resolution */}
      {feedback?.resolutionNote && (
        <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-2">
            <CheckCircle2
              size={15}
              className="mt-0.5 text-green-600 dark:text-green-400"
            />

            <div>
              <p className="text-[7px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
                Resolution Note
              </p>

              <p className="mt-2 text-[8px] leading-5 text-green-800/80 dark:text-green-300/80">
                {feedback.resolutionNote}
              </p>

              {feedback.resolvedAt && (
                <p className="mt-2 text-[6px] text-green-600/70 dark:text-green-400/70">
                  Resolved{" "}
                  {formatDate(
                    feedback.resolvedAt
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reply Box */}
      {status !== "resolved" && (
        <div className="mt-5">
          <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
            Organizer Response
          </label>

          <textarea
            value={reply}
            onChange={(event) => {
              setReply(
                event.target.value
              );
              setError("");
            }}
            rows={4}
            maxLength={1000}
            placeholder="Write a response to the participant..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <div className="mt-1 flex justify-end">
            <span className="text-[6px] text-slate-400">
              {reply.length}/1000
            </span>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleReply}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={13} />

            {submitting
              ? "Sending..."
              : "Send Response"}
          </button>
        </div>
      )}

      {/* Status Actions */}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
        {status === "pending" && (
          <button
            type="button"
            onClick={() =>
              onStatusChange?.(
                feedback?.id,
                "reviewed"
              )
            }
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-[7px] font-bold text-blue-600 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400"
          >
            Mark as Reviewed
          </button>
        )}

        {status !== "resolved" && (
          <button
            type="button"
            onClick={() =>
              setShowResolution(
                (current) =>
                  !current
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-green-700"
          >
            <CheckCircle2 size={12} />
            Mark as Resolved
          </button>
        )}
      </div>

      {/* Resolution Form */}
      {showResolution &&
        status !== "resolved" && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[8px] font-bold text-green-700 dark:text-green-400">
                  Resolution Note
                </p>

                <p className="mt-1 text-[7px] text-green-700/70 dark:text-green-400/70">
                  Explain how the participant's concern was
                  resolved.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowResolution(
                    false
                  )
                }
                className="rounded-lg p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
              >
                <X size={14} />
              </button>
            </div>

            <textarea
              value={
                resolutionNote
              }
              onChange={(event) => {
                setResolutionNote(
                  event.target.value
                );
                setError("");
              }}
              rows={3}
              maxLength={500}
              placeholder="Describe the resolution..."
              className="mt-3 w-full resize-none rounded-xl border border-green-200 bg-white px-4 py-3 text-xs outline-none focus:border-green-400 dark:border-green-900/40 dark:bg-slate-900 dark:text-white"
            />

            <button
              type="button"
              disabled={submitting}
              onClick={
                handleResolve
              }
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle2 size={13} />
              Confirm Resolution
            </button>
          </div>
        )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}
    </article>
  );
};

/* --------------------------------
   Status Badge
--------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.pending;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[6px] font-bold ${config.className}`}
    >
      <Icon size={9} />
      {config.label}
    </span>
  );
};

/* --------------------------------
   Feedback List
--------------------------------- */

export const FeedbackResponseList = ({
  feedbackList = [],
  onReply,
  onStatusChange,
  onResolve,
}) => {
  return (
    <div className="space-y-4">
      {feedbackList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <MessageSquare
            size={28}
            className="mx-auto text-slate-400"
          />

          <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
            No feedback found
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            Participant feedback will appear here.
          </p>
        </div>
      ) : (
        feedbackList.map(
          (feedback) => (
            <FeedbackResponse
              key={feedback.id}
              feedback={feedback}
              onReply={onReply}
              onStatusChange={
                onStatusChange
              }
              onResolve={onResolve}
            />
          )
        )
      )}
    </div>
  );
};

/* --------------------------------
   Date Helper
--------------------------------- */

const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export default FeedbackResponse;