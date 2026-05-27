import { useState, useRef, useEffect } from "react";

/**
 * Prevents double-submission by tracking in-flight state.
 * Returns isSubmitting flag + a wrapped submit handler.
 */
export function useFormSubmit(submitFn) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isInFlight = useRef(false); 
  
  // FIX: Track component mount status to prevent memory leaks
  const isMounted = useRef(true);

  useEffect(() => {
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
      // FIX: Only update state if the component is still mounted
      if (isMounted.current) {
        setSuccess(true);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err?.response?.data?.message || err.message || "Something went wrong.");
      }
    } finally {
      // FIX: Only update state if the component is still mounted
      if (isMounted.current) {
        setIsSubmitting(false);
        isInFlight.current = false;
      }
    }
  };

  return { handleSubmit, isSubmitting, error, success };
}