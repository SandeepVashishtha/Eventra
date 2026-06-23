
const PageLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div
        className="flex flex-col items-center gap-4"
        role="status"
        aria-live="polite"
      >
        {/* Screen reader loading text */}
        <span className="sr-only">Loading content...</span>

        {/* Spinner */}
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
          aria-hidden="true"
        ></div>

        {/* Loading Text */}
        <p className="font-medium text-gray-600 dark:text-gray-400">
          {text}
        </p>
      </div>
    </div>
  );
};

export default PageLoader;