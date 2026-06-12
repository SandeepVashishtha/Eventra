import { useNavigate } from "react-router-dom";

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950/30"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
        <svg
          className="h-6 w-6 text-red-600 dark:text-red-400"
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

      <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">Something went wrong</h2>

      {error?.message && <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>}

      <div className="flex flex-wrap justify-center gap-3">
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>
        )}

        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Reload Page
        </button>

        <button
          onClick={() => navigate("/")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorFallback;
