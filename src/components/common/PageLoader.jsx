
const PageLoader = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div
        className="flex flex-col items-center gap-4"
        role="status"
        aria-live="polite"
      >
        {/* Screen reader loading text */}
        <span className="sr-only">Loading content...</span>

        {/* Spinner */}
        <div
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        ></div>

        {/* Loading Text */}
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      </div>
    </div>
  );
};

export default PageLoader;
