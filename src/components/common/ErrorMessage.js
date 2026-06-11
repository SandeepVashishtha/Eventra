import Alert from "./Alert";

/**
 * A theme-aware component to display error messages.
 * Now uses the shared Alert component for consistency.
 * @param {{ title?: string, message: string }} props
 */
const ErrorMessage = ({ title = "Error", message }) => {
  if (!message) return null;

  const displayMessage =
    typeof message === "string" && message.includes("Google")
      ? "Google Sign-In failed. Please try again."
      : message;

  return <Alert variant="error" title={title} message={displayMessage} />;
};

export default ErrorMessage;