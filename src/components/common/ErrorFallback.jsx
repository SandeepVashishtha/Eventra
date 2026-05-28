import React from "react";

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-center max-w-md mx-auto"
    >
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

      <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
        Something went wrong
      </h2>

      {error?.message && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      )}

      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorFallback;
