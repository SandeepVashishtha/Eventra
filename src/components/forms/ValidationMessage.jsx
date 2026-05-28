import React from "react";

const stateClasses = {
  error: "text-red-600 dark:text-red-400",
  invalid: "text-red-600 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
  valid: "text-green-600 dark:text-green-400",
  warning: "text-yellow-700 dark:text-yellow-400",
  info: "text-gray-600 dark:text-gray-300",
  loading: "text-blue-600 dark:text-blue-400",
  validating: "text-blue-600 dark:text-blue-400",
};

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const getRole = (state) =>
  state === "error" || state === "invalid" ? "alert" : "status";

/**
 * Displays accessible validation feedback below a form field.
 *
 * Empty, `null`, or `undefined` messages render nothing. Error states use
 * assertive live-region semantics so assistive technology announces failures;
 * all other states use polite status semantics.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.message - Message to render. Empty values render nothing.
 * @param {"error"|"invalid"|"success"|"valid"|"warning"|"info"|"loading"|"validating"} [props.state="info"] - Message tone and accessibility role.
 * @param {string} [props.id] - ID used by aria-describedby on the input.
 * @param {string} [props.className] - Extra classes for custom spacing or typography.
 * @returns {JSX.Element|null} Validation message paragraph, or null when no message is provided.
 *
 * @example
 * <ValidationMessage id="email-message" state="error" message="Email is required" />
 */
const ValidationMessage = ({
  message,
  state = "info",
  id,
  className = "",
  ...props
}) => {
  if (message === null || message === undefined || message === "") {
    return null;
  }

  const role = getRole(state);

  return (
    <p
      id={id}
      className={joinClasses(
        "mt-1 text-sm leading-5",
        stateClasses[state] || stateClasses.info,
        className,
      )}
      data-state={state}
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      {...props}
    >
      {message}
    </p>
  );
};

export default ValidationMessage;
