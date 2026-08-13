import React, { useEffect, useMemo, useState } from "react";

interface PostEventFeedbackReminderProps {
  eventId: string | number;
  eventName: string;
  eventDate: string;
  feedbackUrl?: string;
  feedbackSubmitted?: boolean;
  initialDismissed?: boolean;
  onOpenFeedback?: () => void;
  onDismiss?: () => void;
}

const PostEventFeedbackReminder: React.FC<
  PostEventFeedbackReminderProps
> = ({
  eventId,
  eventName,
  eventDate,
  feedbackUrl = "#",
  feedbackSubmitted = false,
  initialDismissed = false,
  onOpenFeedback,
  onDismiss,
}) => {
  const storageKey = `eventra-feedback-reminder-${eventId}`;

  const [dismissed, setDismissed] = useState(
    initialDismissed
  );

  const [submitted, setSubmitted] = useState(
    feedbackSubmitted
  );

  const [showDetails, setShowDetails] =
    useState(false);

  useEffect(() => {
    if (feedbackSubmitted) {
      setSubmitted(true);

      localStorage.setItem(
        storageKey,
        "submitted"
      );
    }
  }, [feedbackSubmitted, storageKey]);

  useEffect(() => {
    const storedState =
      localStorage.getItem(storageKey);

    if (storedState === "dismissed") {
      setDismissed(true);
    }

    if (storedState === "submitted") {
      setSubmitted(true);
    }
  }, [storageKey]);

  const eventHasEnded = useMemo(() => {
    const date = new Date(eventDate);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() < Date.now();
  }, [eventDate]);

  const formattedDate = useMemo(() => {
    const date = new Date(eventDate);

    if (Number.isNaN(date.getTime())) {
      return eventDate;
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [eventDate]);

  const dismissReminder = () => {
    setDismissed(true);

    localStorage.setItem(
      storageKey,
      "dismissed"
    );

    onDismiss?.();
  };

  const openFeedback = () => {
    onOpenFeedback?.();

    /*
     * If the parent does not provide an
     * onOpenFeedback callback, use the supplied URL.
     */
    if (!onOpenFeedback && feedbackUrl !== "#") {
      window.location.href = feedbackUrl;
    }
  };

  /*
   * Do not show the reminder if:
   * - the event has not ended
   * - feedback has already been submitted
   * - the user dismissed the reminder
   */
  if (
    !eventHasEnded ||
    submitted ||
    dismissed
  ) {
    return null;
  }

  return (
    <section
      className="w-full rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-900 dark:bg-gray-900"
      aria-label="Post-event feedback reminder"
    >
      {/* Header */}
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/70 dark:bg-blue-900/20" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            💬
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Feedback Reminder
                </span>

                <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                  How was your event?
                </h2>
              </div>

              <button
                type="button"
                onClick={dismissReminder}
                className="self-start rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                aria-label="Dismiss feedback reminder"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Your feedback helps organizers improve
              future events. It only takes a few minutes
              to share your experience.
            </p>
          </div>
        </div>
      </div>

      {/* Event information */}
      <div className="p-5 sm:p-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-lg dark:bg-purple-950">
              🎟️
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Completed Event
              </p>

              <h3 className="mt-1 truncate text-base font-bold text-gray-900 dark:text-white">
                {eventName}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>📅</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reminder explanation */}
        <div className="mt-5">
          <button
            type="button"
            onClick={() =>
              setShowDetails(
                (previous) => !previous
              )
            }
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Why should I leave feedback?
            </span>

            <span className="text-gray-400">
              {showDetails ? "⌃" : "⌄"}
            </span>
          </button>

          {showDetails && (
            <div className="mt-2 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex gap-2">
                  <span className="text-green-500">
                    ✓
                  </span>
                  <span>
                    Help organizers understand what
                    worked well.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span className="text-green-500">
                    ✓
                  </span>
                  <span>
                    Share suggestions for improving
                    future events.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span className="text-green-500">
                    ✓
                  </span>
                  <span>
                    Help future participants have a
                    better experience.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openFeedback}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <span>✍️</span>
            <span>Leave Feedback</span>
          </button>

          <button
            type="button"
            onClick={dismissReminder}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Remind Me Later
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-gray-400">
          <span>🔒</span>

          <p>
            Your feedback is associated with this event
            and is handled according to Eventra's existing
            feedback workflow.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PostEventFeedbackReminder;