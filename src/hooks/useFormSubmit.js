import { useState, useRef, useEffect } from "react";

export function useFormSubmit(submitFn) {
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
      if (isMounted.current) {
        setError(err?.response?.data?.message || err.message || "Something went wrong.");
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
        isInFlight.current = false;
      }
    }
  };

  return { handleSubmit, isSubmitting, error, success };
}