import { AlertCircle } from 'lucide-react';

/**
 * A theme-aware component to display error messages.
 * @param {{
 * title?: string,
 * message: string
 * }} props - Component props.
 * @param {string} [props.title="Error"] - An optional title for the error box.
 * @param {string} props.message - The error message to display.
 */
const ErrorMessage = ({ title = "Error", message }) => {
  if (!message) {
    return null;
  }

  // 🔹 Custom handling for Google Sign-In errors
  const displayMessage = message.includes("Google") 
    ? "Google Sign-In failed. Please try again." 
    : message;

  return (
    <div
      className="flex items-start gap-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/40"
      role="alert"
    >
      <div className="flex-shrink-0">
        <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
      </div>

      <div className="flex-1">
        <strong className="block font-medium text-red-800 dark:text-red-200">
          {title}
        </strong>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
          {displayMessage} /* 🔹 Updated to use custom Google message */
        </p>
      </div>
    </div>
  );
};

export default ErrorMessage;
