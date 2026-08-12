import {
  BarChart3,
  CheckCircle2,
  MessageSquare,
  Star,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

const FEEDBACK_FIELDS = [
  {
    key: "content",
    label: "Session Content",
    description:
      "How useful and well-structured was the session content?",
  },
  {
    key: "speaker",
    label: "Speaker",
    description:
      "How effectively did the speaker explain the topic?",
  },
  {
    key: "usefulness",
    label: "Usefulness",
    description:
      "How useful was this session for you?",
  },
  {
    key: "organization",
    label: "Session Organization",
    description:
      "How well was the session organized?",
  },
  {
    key: "experience",
    label: "Overall Session Experience",
    description:
      "How would you rate your overall experience?",
  },
];

const SessionFeedback = ({
  session,
  existingFeedback = null,
  onSubmit,
  isOrganizer = false,
  feedbackList = [],
  className = "",
}) => {
  const [ratings, setRatings] =
    useState(
      existingFeedback?.ratings || {}
    );

  const [comment, setComment] =
    useState(
      existingFeedback?.comment || ""
    );

  const [submitted, setSubmitted] =
    useState(
      Boolean(existingFeedback)
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const allRated =
    FEEDBACK_FIELDS.every(
      (field) =>
        Number(ratings[field.key]) >= 1
    );

  const averageRating = useMemo(() => {
    if (!feedbackList.length) {
      return 0;
    }

    const totals =
      feedbackList.reduce(
        (sum, feedback) => {
          const values =
            Object.values(
              feedback.ratings || {}
            );

          const average =
            values.length
              ? values.reduce(
                  (a, b) =>
                    a + Number(b),
                  0
                ) / values.length
              : 0;

          return sum + average;
        },
        0
      );

    return (
      totals / feedbackList.length
    );
  }, [feedbackList]);

  const handleRating = (
    key,
    value
  ) => {
    setRatings((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
  };

  const handleSubmit = async () => {
    if (!allRated) {
      setError(
        "Please rate every category before submitting."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    const feedback = {
      sessionId: session?.id,
      sessionTitle:
        session?.title || "",
      ratings,
      comment: comment.trim(),
      submittedAt:
        new Date().toISOString(),
    };

    try {
      await onSubmit?.(feedback);
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Unable to submit feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isOrganizer) {
    return (
      <OrganizerFeedbackSummary
        session={session}
        feedbackList={feedbackList}
        averageRating={averageRating}
      />
    );
  }

  if (submitted) {
    return (
      <FeedbackSubmitted
        session={session}
        ratings={ratings}
        comment={comment}
        onEdit={() =>
          setSubmitted(false)
        }
      />
    );
  }

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <MessageSquare size={20} />
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Session Feedback
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {session?.title ||
              "Rate this session"}
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Share your experience to help organizers
            improve future sessions.
          </p>
        </div>
      </div>

      {/* Speaker */}
      {session?.speaker && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <User size={16} />
          </div>

          <div>
            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              Speaker
            </p>

            <p className="mt-1 text-[9px] font-bold text-slate-800 dark:text-white">
              {session.speaker}
            </p>
          </div>
        </div>
      )}

      {/* Rating Fields */}
      <div className="mt-6 space-y-4">
        {FEEDBACK_FIELDS.map(
          (field) => (
            <RatingField
              key={field.key}
              field={field}
              value={
                ratings[field.key] || 0
              }
              onChange={(value) =>
                handleRating(
                  field.key,
                  value
                )
              }
            />
          )
        )}
      </div>

      {/* Comment */}
      <div className="mt-6">
        <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
          Additional Comments
          <span className="ml-1 font-normal text-slate-400">
            (Optional)
          </span>
        </label>

        <textarea
          value={comment}
          onChange={(event) =>
            setComment(
              event.target.value
            )
          }
          rows={4}
          maxLength={1000}
          placeholder="Tell us what you liked or what could be improved..."
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <p className="mt-1 text-right text-[7px] text-slate-400">
          {comment.length}/1000
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle2 size={14} />

        {submitting
          ? "Submitting..."
          : "Submit Session Feedback"}
      </button>
    </section>
  );
};

/* --------------------------------
   Rating Field
--------------------------------- */

const RatingField = ({
  field,
  value,
  onChange,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            {field.label}
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            {field.description}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <button
                key={star}
                type="button"
                onClick={() =>
                  onChange(star)
                }
                aria-label={`Rate ${star} out of 5`}
                className="rounded-md p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Star
                  size={19}
                  fill={
                    star <= value
                      ? "currentColor"
                      : "none"
                  }
                  className={
                    star <= value
                      ? "text-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }
                />
              </button>
            )
          )}

          <span className="ml-2 min-w-[25px] text-center text-[8px] font-bold text-slate-500">
            {value}/5
          </span>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Submitted State
--------------------------------- */

const FeedbackSubmitted = ({
  session,
  ratings,
  comment,
  onEdit,
}) => {
  const values =
    Object.values(ratings);

  const average =
    values.length
      ? (
          values.reduce(
            (a, b) => a + Number(b),
            0
          ) / values.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="rounded-3xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900/30 dark:bg-green-900/10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 size={28} />
      </div>

      <h2 className="mt-4 text-xl font-bold text-green-800 dark:text-green-400">
        Feedback Submitted
      </h2>

      <p className="mt-2 text-xs text-green-700/70 dark:text-green-400/70">
        Thank you for sharing your feedback about{" "}
        {session?.title || "this session"}.
      </p>

      <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 dark:bg-slate-900">
        <Star
          size={17}
          fill="currentColor"
          className="text-amber-400"
        />

        <span className="text-sm font-black text-slate-800 dark:text-white">
          {average}/5
        </span>
      </div>

      {comment && (
        <div className="mx-auto mt-4 max-w-lg rounded-xl bg-white p-4 text-left dark:bg-slate-900">
          <p className="text-[7px] font-bold uppercase text-slate-400">
            Your comment
          </p>

          <p className="mt-2 text-[8px] leading-4 text-slate-600 dark:text-slate-300">
            {comment}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="mt-5 rounded-xl border border-green-200 bg-white px-5 py-3 text-[8px] font-bold text-green-700 hover:bg-green-50 dark:border-green-900/30 dark:bg-slate-900 dark:text-green-400"
      >
        Edit Feedback
      </button>
    </section>
  );
};

/* --------------------------------
   Organizer Summary
--------------------------------- */

const OrganizerFeedbackSummary = ({
  session,
  feedbackList,
  averageRating,
}) => {
  const categoryAverages =
    useMemo(() => {
      return FEEDBACK_FIELDS.map(
        (field) => {
          const values =
            feedbackList
              .map(
                (feedback) =>
                  Number(
                    feedback.ratings?.[
                      field.key
                    ]
                  )
              )
              .filter(
                (value) =>
                  Number.isFinite(value) &&
                  value > 0
              );

          const average =
            values.length
              ? values.reduce(
                  (a, b) => a + b,
                  0
                ) / values.length
              : 0;

          return {
            ...field,
            average,
          };
        }
      );
    }, [feedbackList]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <BarChart3 size={20} />
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Organizer Analytics
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Session Feedback Summary
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {session?.title ||
              "Session"}{" "}
            feedback overview
          </p>
        </div>
      </div>

      {/* Overall Rating */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 dark:bg-slate-900">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Responses
          </p>

          <p className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
            {feedbackList.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 dark:bg-slate-900">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Average Rating
          </p>

          <div className="mt-2 flex items-center gap-2">
            <Star
              size={20}
              fill="currentColor"
              className="text-amber-400"
            />

            <p className="text-2xl font-black text-slate-800 dark:text-white">
              {averageRating.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 dark:bg-slate-900">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Max Rating
          </p>

          <p className="mt-2 text-2xl font-black text-slate-800 dark:text-white">
            5.0
          </p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[9px] font-bold text-slate-800 dark:text-white">
          Category Performance
        </p>

        <div className="mt-5 space-y-5">
          {categoryAverages.map(
            (category) => (
              <div
                key={category.key}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-semibold text-slate-600 dark:text-slate-300">
                    {category.label}
                  </p>

                  <div className="flex items-center gap-1">
                    <Star
                      size={11}
                      fill="currentColor"
                      className="text-amber-400"
                    />

                    <span className="text-[8px] font-bold text-slate-700 dark:text-white">
                      {category.average.toFixed(
                        1
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{
                      width: `${
                        (category.average /
                          5) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[9px] font-bold text-slate-800 dark:text-white">
          Participant Comments
        </p>

        {feedbackList.filter(
          (feedback) =>
            feedback.comment?.trim()
        ).length === 0 ? (
          <p className="mt-4 text-[8px] text-slate-400">
            No written comments yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {feedbackList
              .filter(
                (feedback) =>
                  feedback.comment?.trim()
              )
              .map(
                (feedback, index) => (
                  <div
                    key={
                      feedback.id ||
                      index
                    }
                    className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[7px] font-bold text-slate-500">
                        Participant
                      </p>

                      <div className="flex items-center gap-1">
                        <Star
                          size={10}
                          fill="currentColor"
                          className="text-amber-400"
                        />

                        <span className="text-[7px] font-bold text-slate-500">
                          {getFeedbackAverage(
                            feedback
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-[8px] leading-4 text-slate-600 dark:text-slate-300">
                      {feedback.comment}
                    </p>
                  </div>
                )
              )}
          </div>
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Helpers
--------------------------------- */

const getFeedbackAverage = (
  feedback
) => {
  const values =
    Object.values(
      feedback.ratings || {}
    ).map(Number);

  if (!values.length) {
    return 0;
  }

  return (
    values.reduce(
      (a, b) => a + b,
      0
    ) / values.length
  );
};

export default SessionFeedback;