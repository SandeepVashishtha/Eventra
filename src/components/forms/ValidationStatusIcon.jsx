import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Info,
  LoaderCircle,
  XCircle,
} from "lucide-react";

const stateConfig = {
  idle: {
    Icon: Circle,
    label: "Not validated yet",
    className: "text-gray-400 dark:text-gray-500",
    role: "status",
  },
  validating: {
    Icon: LoaderCircle,
    label: "Validation in progress",
    className: "text-blue-600 dark:text-blue-400 animate-spin",
    role: "status",
  },
  loading: {
    Icon: LoaderCircle,
    label: "Validation in progress",
    className: "text-blue-600 dark:text-blue-400 animate-spin",
    role: "status",
  },
  success: {
    Icon: CheckCircle2,
    label: "Validation passed",
    className: "text-green-600 dark:text-green-400",
    role: "status",
  },
  valid: {
    Icon: CheckCircle2,
    label: "Validation passed",
    className: "text-green-600 dark:text-green-400",
    role: "status",
  },
  error: {
    Icon: XCircle,
    label: "Validation failed",
    className: "text-red-600 dark:text-red-400",
    role: "alert",
  },
  invalid: {
    Icon: XCircle,
    label: "Validation failed",
    className: "text-red-600 dark:text-red-400",
    role: "alert",
  },
  warning: {
    Icon: AlertCircle,
    label: "Validation warning",
    className: "text-yellow-600 dark:text-yellow-400",
    role: "status",
  },
  info: {
    Icon: Info,
    label: "Validation information",
    className: "text-blue-600 dark:text-blue-400",
    role: "status",
  },
};

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

/**
 * Renders a small accessible icon for the current validation state.
 *
 * @param {Object} props
 * @param {"idle"|"validating"|"loading"|"success"|"valid"|"error"|"invalid"|"warning"|"info"} [props.state="idle"]
 * @param {string} [props.className] - Extra classes for sizing or spacing.
 * @param {string} [props.label] - Custom screen-reader label.
 * @param {boolean} [props.ariaHidden=false] - Hide icon from assistive tech when decorative.
 */
const ValidationStatusIcon = ({
  state = "idle",
  className = "",
  label,
  ariaHidden = false,
  ...props
}) => {
  const config = stateConfig[state] || stateConfig.idle;
  const Icon = config.Icon;
  const accessibleLabel = label || config.label;

  return (
    <span
      className={joinClasses(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center",
        config.className,
        className,
      )}
      data-state={state}
      role={ariaHidden ? undefined : config.role}
      aria-hidden={ariaHidden ? "true" : undefined}
      aria-label={ariaHidden ? undefined : accessibleLabel}
      aria-live={ariaHidden || config.role === "alert" ? undefined : "polite"}
      {...props}
    >
      <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.25} />
    </span>
  );
};

export default ValidationStatusIcon;
