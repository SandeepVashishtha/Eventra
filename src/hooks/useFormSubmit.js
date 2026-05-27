import { useState, useRef, useEffect } from "react";

/**
 * Prevents double-submission by tracking in-flight state.
 * Returns isSubmitting flag + a wrapped submit handler.
 */
export function useFormSubmit(submitFn) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isInFlight = useRef(false); // extra guard against React batching
  const isMounted = useRef(true); // guard against unmounted state updates

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (data) => {
    // ✅ Double-submit guard — blocks if request already in-flight
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
