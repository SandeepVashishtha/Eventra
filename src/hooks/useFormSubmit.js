import { useState, useRef } from "react";

/**
 * Prevents double-submission by tracking in-flight state.
 * Returns isSubmitting flag + a wrapped submit handler.
 */
export function useFormSubmit(submitFn) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isInFlight = useRef(false); // extra guard against React batching

  const handleSubmit = async (data) => {
    // ✅ Double-submit guard — blocks if request already in-flight
    if (isInFlight.current) return;

    isInFlight.current = true;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await submitFn(data);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
      isInFlight.current = false;
    }
  };

  return { handleSubmit, isSubmitting, error, success };
}
