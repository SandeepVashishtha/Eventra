import {
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_FEEDBACK = {
  rating: 0,
  title: "",
  feedback: "",
  suggestions: "",
  wouldRecommend: null,
};

const STORAGE_PREFIX = "eventra-feedback-draft";

const EventParticipantFeedbackDrafts = ({
  eventId = "event-001",
  eventTitle = "Event Feedback",
  initialFeedback = DEFAULT_FEEDBACK,
  onSubmit,
  onDraftChange,
  className = "",
}) => {
  const storageKey = `${STORAGE_PREFIX}-${eventId}`;

  const [feedback, setFeedback] =
    useState(initialFeedback);

  const [draftExists, setDraftExists] =
    useState(false);

  const [lastSaved, setLastSaved] =
    useState(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isSubmitted, setIsSubmitted] =
    useState(false);

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  /*
   * Restore previously saved draft.
   */
  useEffect(() => {
    try {
      const savedDraft =
        localStorage.getItem(storageKey);

      if (!savedDraft) return;

      const parsedDraft =
        JSON.parse(savedDraft);

      if (
        parsedDraft &&
        parsedDraft.feedback
      ) {
        setFeedback(
          parsedDraft.feedback
        );

        setDraftExists(true);

        setLastSaved(
          parsedDraft.savedAt
            ? new Date(
                parsedDraft.savedAt
              )
            : new Date()
        );
      }
    } catch (error) {
      console.error(
        "Unable to restore feedback draft:",
        error
      );
    }
  }, [storageKey]);

  /*
   * Automatically save changes.
   */
  useEffect(() => {
    if (isSubmitted) return;

    const hasContent =
      feedback.rating > 0 ||
      feedback.title.trim() ||
      feedback.feedback.trim() ||
      feedback.suggestions.trim() ||
      feedback.wouldRecommend !== null;

    if (!hasContent) return;

    const timer = setTimeout(() => {
      saveDraft(feedback);
    }, 800);

    return () =>
      clearTimeout(timer);
  }, [feedback, isSubmitted]);

  const saveDraft = (
    draftFeedback = feedback
  ) => {
    setIsSaving(true);

    try {
      const draft = {
        eventId,
        eventTitle,
        feedback: draftFeedback,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        storageKey,
        JSON.stringify(draft)
      );

      setDraftExists(true);
      setLastSaved(
        new Date(draft.savedAt)
      );

      onDraftChange?.(draft);

      window.setTimeout(() => {
        setIsSaving(false);
      }, 350);
    } catch (error) {
      console.error(
        "Unable to save feedback draft:",
        error
      );

      setIsSaving(false);
    }
  };

  const updateFeedback = (
    field,
    value
  ) => {
    setFeedback((current) => ({
      ...current,
      [field]: value,
    }));

    setSubmitError("");
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(
        storageKey
      );
    } catch (error) {
      console.error(
        "Unable to delete feedback draft:",
        error
      );
    }

    setFeedback({
      ...DEFAULT_FEEDBACK,
    });

    setDraftExists(false);
    setLastSaved(null);
    setShowDeleteDialog(false);
    setSubmitError("");
  };

  const submitFeedback = async (
    event
  ) => {
    event.preventDefault();

    setSubmitError("");

    if (!feedback.rating) {
      setSubmitError(
        "Please select a rating before submitting your feedback."
      );
      return;
    }

    if (!feedback.feedback.trim()) {
      setSubmitError(
        "Please write some feedback before submitting."
      );
      return;
    }

    try {
      const result =
        await onSubmit?.({
          eventId,
          eventTitle,
          ...feedback,
        });

      /*
       * Clear the draft only after successful
       * submission.
       */
      localStorage.removeItem(
        storageKey
      );

      setDraftExists(false);
      setLastSaved(null);
      setIsSubmitted(true);

      return result;
    } catch (error) {
      console.error(
        "Feedback submission failed:",
        error
      );

      setSubmitError(
        "Your feedback could not be submitted. Your draft is still saved."
      );
    }
  };

  if (isSubmitted) {
    return (
      <SuccessState
        eventTitle={eventTitle}
        feedback={feedback}
        onReset={() => {
          setFeedback({
            ...DEFAULT_FEEDBACK,
          });
          setIsSubmitted(false);
        }}
        className={className}
      />
    );
  }

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <FileText
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Feedback
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {eventTitle}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Share your experience. Your feedback helps improve future events.
            </p>
          </div>
        </div>

        <DraftStatus
          draftExists={draftExists}
          isSaving={isSaving}
          lastSaved={lastSaved}
        />
      </div>

      {/* Draft restored notice */}
      {draftExists && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <Save
            size={15}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div className="flex-1">
            <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
              Draft Saved
            </p>

            <p className="mt-1 text-[8px] leading-4 text-indigo-600 dark:text-indigo-400">
              Your unfinished feedback is automatically saved. You can safely
              leave this page and continue later.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={submitFeedback}
        className="mt-6 space-y-6"
      >
        {/* Rating */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Overall Rating
          </label>

          <div className="mt-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(
              (rating) => (
                <RatingButton
                  key={rating}
                  rating={rating}
                  selected={
                    feedback.rating >=
                    rating
                  }
                  onClick={() =>
                    updateFeedback(
                      "rating",
                      rating
                    )
                  }
                />
              )
            )}

            <span className="ml-2 text-[9px] font-semibold text-slate-400">
              {feedback.rating
                ? `${feedback.rating}/5`
                : "Not rated"}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="feedback-title"
            className="text-[9px] font-bold uppercase tracking-wide text-slate-400"
          >
            Feedback Title
          </label>

          <input
            id="feedback-title"
            type="text"
            value={feedback.title}
            onChange={(event) =>
              updateFeedback(
                "title",
                event.target.value
              )
            }
            placeholder="Summarize your experience..."
            maxLength={100}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />

          <p className="mt-1 text-right text-[8px] text-slate-400">
            {feedback.title.length}/100
          </p>
        </div>

        {/* Main feedback */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="feedback-content"
              className="text-[9px] font-bold uppercase tracking-wide text-slate-400"
            >
              Your Feedback
            </label>

            <span className="text-[8px] text-slate-400">
              Required
            </span>
          </div>

          <textarea
            id="feedback-content"
            value={feedback.feedback}
            onChange={(event) =>
              updateFeedback(
                "feedback",
                event.target.value
              )
            }
            placeholder="Tell us about your experience..."
            rows={6}
            maxLength={2000}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />

          <div className="mt-1 flex justify-between">
            <span className="text-[8px] text-slate-400">
              Your draft is saved automatically.
            </span>

            <span className="text-[8px] text-slate-400">
              {feedback.feedback.length}/2000
            </span>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <label
            htmlFor="feedback-suggestions"
            className="text-[9px] font-bold uppercase tracking-wide text-slate-400"
          >
            Suggestions for Improvement
          </label>

          <textarea
            id="feedback-suggestions"
            value={
              feedback.suggestions
            }
            onChange={(event) =>
              updateFeedback(
                "suggestions",
                event.target.value
              )
            }
            placeholder="What could make future events better?"
            rows={4}
            maxLength={1000}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />

          <p className="mt-1 text-right text-[8px] text-slate-400">
            {feedback.suggestions.length}/1000
          </p>
        </div>

        {/* Recommendation */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Would you recommend this event?
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <RecommendationButton
              label="Yes, definitely"
              selected={
                feedback.wouldRecommend ===
                true
              }
              onClick={() =>
                updateFeedback(
                  "wouldRecommend",
                  true
                )
              }
            />

            <RecommendationButton
              label="Not sure / No"
              selected={
                feedback.wouldRecommend ===
                false
              }
              onClick={() =>
                updateFeedback(
                  "wouldRecommend",
                  false
                )
              }
            />
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[9px] font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {submitError}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              setShowDeleteDialog(true)
            }
            disabled={!draftExists}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-[9px] font-bold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900/40 dark:hover:bg-red-900/10"
          >
            <Trash2 size={12} />
            Delete Draft
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                saveDraft(feedback)
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[9px] font-bold text-slate-600 hover:bg-slate-50 sm:flex-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Save size={12} />
              Save Draft
            </button>

            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[9px] font-bold text-white hover:bg-indigo-700 sm:flex-none"
            >
              <Send size={12} />
              Submit Feedback
            </button>
          </div>
        </div>
      </form>

      {/* Delete confirmation */}
      {showDeleteDialog && (
        <DeleteDraftDialog
          onCancel={() =>
            setShowDeleteDialog(false)
          }
          onConfirm={clearDraft}
        />
      )}
    </section>
  );
};

/* ----------------------------------
   Draft status
----------------------------------- */

const DraftStatus = ({
  draftExists,
  isSaving,
  lastSaved,
}) => {
  if (isSaving) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[8px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
        <Clock3 size={11} />
        Saving...
      </span>
    );
  }

  if (draftExists) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[8px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
        <Check size={11} />
        Draft Saved
        {lastSaved &&
          ` · ${formatTime(lastSaved)}`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[8px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Save size={11} />
      No Draft
    </span>
  );
};

/* ----------------------------------
   Rating button
----------------------------------- */

const RatingButton = ({
  rating,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Rate ${rating} out of 5`}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition ${
        selected
          ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-400 hover:border-indigo-300 hover:text-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
      }`}
    >
      {rating}
    </button>
  );
};

/* ----------------------------------
   Recommendation button
----------------------------------- */

const RecommendationButton = ({
  label,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-[9px] font-bold transition ${
        selected
          ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
          : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
      }`}
    >
      {selected && (
        <Check
          size={11}
          className="mr-1 inline"
        />
      )}

      {label}
    </button>
  );
};

/* ----------------------------------
   Delete confirmation
----------------------------------- */

const DeleteDraftDialog = ({
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20">
            <Trash2 size={16} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Delete feedback draft?
            </h3>

            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              This action permanently removes your saved draft. You won't be
              able to restore it.
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[9px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Keep Draft
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-[9px] font-bold text-white hover:bg-red-700"
          >
            Delete Draft
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="absolute"
        >
          <X size={0} />
        </button>
      </div>
    </div>
  );
};

/* ----------------------------------
   Success state
----------------------------------- */

const SuccessState = ({
  eventTitle,
  feedback,
  onReset,
  className = "",
}) => {
  return (
    <section
      className={`rounded-3xl border border-emerald-200 bg-white p-6 text-center shadow-sm dark:border-emerald-900/40 dark:bg-slate-900 ${className}`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
        <CheckCircle2 size={26} />
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        Feedback Submitted
      </p>

      <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        Thank you for your feedback!
      </h2>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">
        Your feedback for{" "}
        <strong>{eventTitle}</strong> has been successfully submitted.
      </p>

      <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-slate-50 p-4 text-left dark:bg-slate-950">
        <div className="flex justify-between">
          <span className="text-[9px] text-slate-400">
            Rating
          </span>

          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
            {feedback.rating}/5
          </span>
        </div>

        {feedback.title && (
          <div className="mt-2 flex justify-between gap-3">
            <span className="text-[9px] text-slate-400">
              Title
            </span>

            <span className="text-right text-[9px] font-bold text-slate-700 dark:text-slate-200">
              {feedback.title}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-xl border border-slate-200 px-5 py-3 text-[9px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Write Another Feedback
      </button>
    </section>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const formatTime = (date) => {
  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(date);
  } catch {
    return "";
  }
};

export default EventParticipantFeedbackDrafts;