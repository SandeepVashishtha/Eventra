/**
 * RetryableLoader.jsx
 * A wrapper component that handles loading, error, and retry states gracefully.
 * Prevents users from getting stuck in infinite loading states.
 */

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

const RetryableLoader = ({
  isLoading,
  error,
  onRetry,
  timeout = 15000,
  children,
  loadingText = "Loading...",
  errorText = "Something went wrong.",
}) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout]);

  const handleRetry = useCallback(() => {
    setTimedOut(false);
    onRetry?.();
  }, [onRetry]);

  if (isLoading && !timedOut) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{loadingText}</p>
      </div>
    );
  }

  if (timedOut || error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle size={28} className="text-red-500 dark:text-red-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            {timedOut ? "Request timed out" : errorText}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {timedOut
              ? "The request is taking too long. Please try again."
              : error?.message || "An unexpected error occurred."}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all duration-200 hover:scale-105"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    );
  }

  return children;
};

export default RetryableLoader;
