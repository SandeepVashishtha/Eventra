/**
 * @fileoverview LoadingWithError
 *
 * Fix for Issue #8507: Broken Error Handling Causes Infinite Loading States.
 *
 * A single component that handles all three async-fetch states cleanly:
 *   • loading  → spinner
 *   • error    → user-friendly message + Retry button  (no stuck spinner)
 *   • success  → renders children
 *
 * Usage:
 *   <LoadingWithError loading={loading} error={error} onRetry={retry}>
 *     <MyContent data={data} />
 *   </LoadingWithError>
 */
import React from "react";
import Loading from "./Loading";

/**
 * @param {{
 *   loading: boolean,
 *   error: string | null,
 *   onRetry?: () => void,
 *   loadingText?: string,
 *   errorTitle?: string,
 *   className?: string,
 *   children: React.ReactNode,
 * }} props
 */
const LoadingWithError = ({
  loading,
  error,
  onRetry,
  loadingText = "Loading…",
  errorTitle = "Failed to load",
  className = "",
  children,
}) => {
  if (loading) {
    return <Loading text={loadingText} className={className} />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl
          bg-red-50 dark:bg-red-950/30
          border border-red-200 dark:border-red-800
          text-center max-w-md mx-auto ${className}`}
      >
        {/* Icon */}
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-red-700 dark:text-red-300">
          {errorTitle}
        </h3>

        <p className="text-sm text-red-600 dark:text-red-400 max-w-xs">
          {error}
        </p>

        {/* Retry button — the critical recovery action */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-red-600 hover:bg-red-700 active:scale-95
              text-white text-sm font-semibold
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {/* Retry icon */}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWithError;
