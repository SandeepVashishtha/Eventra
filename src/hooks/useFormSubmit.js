/**
 * @fileoverview useFormSubmit - Generic form submission handler hook
 * @module hooks/useFormSubmit
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { pushToQueue } from "../utils/offlineQueue";
import { getPublicErrorMessage, FORM_ERRORS } from "../utils/errorMessages";

const isOfflineSubmissionError = (error) =>
  error?.isNetworkError ||
  error?.isTimeout ||
  (typeof navigator !== "undefined" && !navigator.onLine);

/**
 * A custom React hook that handles async form submission with loading,
 * error, and success state management.
 *
 * Supports offline queuing — if the submission fails due to a network
 * error and queueOffline is enabled, the form data is pushed to an
 * offline queue and synced when the connection is restored.
 *
 * Prevents duplicate submissions using an in-flight ref guard.
 *
 * @param {Function} submitFn - Async function that performs the submission
 * @param {Object} [offlineOptions={}] - Optional offline queuing configuration
 * @param {boolean} [offlineOptionsRef.current.queueOffline] - Enable offline queuing on network failure
 * @param {string} [offlineOptionsRef.current.actionType] - Action type label for the queue item
 * @param {string} [offlineOptionsRef.current.endpoint] - API endpoint for the queue item
 * @param {string} [offlineOptionsRef.current.userId] - User ID to associate with the queue item
 * @param {Function} [offlineOptionsRef.current.createQueueItem] - Custom queue item factory function
 * @returns {{ handleSubmit: Function, isSubmitting: boolean, error: string|null, success: boolean }}
 *
 * @example
 * const { handleSubmit, isSubmitting, error, success } = useFormSubmit(
 *   async (data) => await api.post('/events', data),
 *   { queueOffline: true, actionType: 'EVENT_REGISTRATION', userId: user.id }
 * );
 */

const defaultOfflineOptions = {};

export function useFormSubmit(submitFn, offlineOptions = defaultOfflineOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isInFlight = useRef(false);
  const submitFnRef = useRef(submitFn);
  const offlineOptionsRef = useRef(offlineOptions);

  useEffect(() => {
    submitFnRef.current = submitFn;
    offlineOptionsRef.current = offlineOptions;
  }, [submitFn, offlineOptions]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = useCallback(async (data) => {
    if (isInFlight.current) return;

    isInFlight.current = true;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await submitFnRef.current(data);
      if (isMounted.current) {
        setSuccess(true);
      }
    } catch (err) {
      if (offlineOptionsRef.current.queueOffline && isOfflineSubmissionError(err)) {
        const queueItem =
          typeof offlineOptionsRef.current.createQueueItem === "function"
            ? offlineOptionsRef.current.createQueueItem(data, err)
            : {
              actionType: offlineOptionsRef.current.actionType || "FORM_SUBMISSION",
              endpoint: offlineOptionsRef.current.endpoint,
              payload: data,
            };

        const queued = await pushToQueue(queueItem, offlineOptionsRef.current.userId || null);
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
  }, [submitFn, offlineOptions]);

  return { handleSubmit, isSubmitting, error, success };
}
