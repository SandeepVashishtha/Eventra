import { memo } from "react";

 /**
 * A theme-aware loading spinner component.
 * @param {{
 * text?: string,
 * size?: string,
 * className?: string
 * }} props - Component props.
 * @param {string} [props.text] - Optional text to display below the spinner.
 * @param {string} [props.size] - Custom spinner size classes.
 * @param {string} [props.className] - Additional wrapper classes.
 */
const Loading = memo(function Loading({
  text,
  size = "h-8 w-8",
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={text || "Loading..."}
    >
      <div
        className={`${size} animate-spin rounded-full border-4 border-indigo-500 border-t-transparent dark:border-indigo-400 dark:border-t-transparent`}
        aria-hidden="true"
      ></div>

      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}

      <span className="sr-only">Loading...</span>
    </div>
  );
});

export default Loading;
