import { useState, useRef, useEffect } from "react";
import { pushToQueue } from "../utils/offlineQueue";

const isOfflineSubmissionError = (error) =>
  error?.isNetworkError ||
  error?.isTimeout ||
  (typeof navigator !== "undefined" && !navigator.onLine);

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
        setError(err?.response?.data?.message || err.message || "Something went wrong.");
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
