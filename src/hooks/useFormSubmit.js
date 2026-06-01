import { useState, useRef, useEffect } from "react";
import { pushToQueue } from "../utils/offlineQueue";
import { getPublicErrorMessage, FORM_ERRORS } from "../utils/errorMessages";

const isOfflineSubmissionError = (error) =>
  error?.isNetworkError ||
  error?.isTimeout ||
  (typeof navigator !== "undefined" && !navigator.onLine);
/**
 * @fileoverview useFormSubmit - Form submission hook with offline queuing support
 * @module hooks/useFormSubmit
 *
 * Provides a reusable hook for handling form submissions with built-in
 * offline queuing. If the user is offline or a network error occurs,
 * submissions can be queued and retried later to prevent data loss.
 *
 * @param {Function} submitFn - Async function that performs the actual submission.
 * @param {Object} [offlineOptions={}] - Optional configuration for offline queuing.
 * @param {boolean} [offlineOptions.queueOffline] - Whether to queue submissions when offline.
 * @param {Function} [offlineOptions.createQueueItem] - Custom function to build a queue item.
 * @param {string} [offlineOptions.actionType] - Action type label for queued submissions.
 * @param {string} [offlineOptions.endpoint] - API endpoint for queued submissions.
 * @param {string} [offlineOptions.userId] - User identifier for queued submissions.
 *
 * @returns {Object} Hook state and actions:
 *   - handleSubmit {Function} Submit handler that queues or executes immediately.
 *   - isSubmitting {boolean} Indicates if a submission is in progress.
 *   - error {string|null} Public error message if submission fails.
 *   - success {boolean} True if submission succeeds or is queued successfully.
 *
 * @example
 * const { handleSubmit, isSubmitting, error, success } = useFormSubmit(apiSubmitFn, {
 *   queueOffline: true,
 *   endpoint: "/api/forms",
 *   userId: "123"
 * });
 *
 * // Usage in a form
 * await handleSubmit({ name: "Pooja", email: "pooja@example.com" });
 *
 * @notes
 * - Submissions are retried automatically when connectivity is restored.
 * - Errors are converted to public messages via getPublicErrorMessage.
 * - Prevents duplicate in-flight submissions using internal refs.
 */

export function useFormSubmit(submitFn, offlineOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isInFlight = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (data) => {
    if (isInFlight.current) return;

    isInFlight.current = true;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await submitFn(data);
      if (isMounted.current) {
        setSuccess(true);
      }
    } catch (err) {
      if (offlineOptions.queueOffline && isOfflineSubmissionError(err)) {
        const queueItem =
          typeof offlineOptions.createQueueItem === "function"
            ? offlineOptions.createQueueItem(data, err)
            : {
                actionType: offlineOptions.actionType || "FORM_SUBMISSION",
                endpoint: offlineOptions.endpoint,
                payload: data,
              };

        const queued = await pushToQueue(queueItem, offlineOptions.userId || null);
        if (queued) {
          if (isMounted.current) {
            setSuccess(true);
          }
          return;
        }
      }

      if (isMounted.current) {
        setError(getPublicErrorMessage(err, FORM_ERRORS.submitFailed));
      }
    } finally {
      isInFlight.current = false;
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };

  return { handleSubmit, isSubmitting, error, success };
}
