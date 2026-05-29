import React from "react";
import ValidationMessage from "./ValidationMessage";
import ValidationStatusIcon from "./ValidationStatusIcon";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const hasMessage = (message) =>
  message !== null && message !== undefined && message !== "";

const isErrorState = (state) => state === "error" || state === "invalid";
const isLoadingState = (state) => state === "loading" || state === "validating";

const mergeDescribedBy = (...ids) => ids.filter(Boolean).join(" ") || undefined;

/**
 * Wraps a label, input, status icon, helper text, and validation message.
 *
 * The child input receives aria-describedby, aria-invalid, and aria-busy.
 * Required fields also receive aria-required and a visual asterisk with hidden
 * text for screen readers. Supported validation states are `idle`,
 * `validating`/`loading`, `success`/`valid`, `error`/`invalid`, `warning`, and
 * `info`.
 *
 * @param {Object} props
 * @param {string} [props.id] - Input ID. Falls back to child id or name.
 * @param {string} [props.name] - Field name used for generated IDs.
 * @param {React.ReactNode} props.label - Visible field label.
 * @param {React.ReactElement} props.children - A single input/select/textarea child.
 * @param {boolean} [props.required=false] - Shows a required indicator and sets aria-required.
 * @param {React.ReactNode} [props.helperText] - Optional helper text below the input.
 * @param {React.ReactNode} [props.message] - Validation message below the input.
 * @param {React.ReactNode} [props.prefix] - Optional content inside the left side of the input.
 * @param {React.ReactNode} [props.suffix] - Optional content inside the right side of the input.
 * @param {"idle"|"validating"|"loading"|"success"|"valid"|"error"|"invalid"|"warning"|"info"} [props.validationState="idle"]
 * @param {string} [props.className] - Extra classes for the outer wrapper.
 * @param {string} [props.labelClassName] - Extra classes for the label.
 * @param {string} [props.inputWrapperClassName] - Extra classes for the relative input wrapper.
 * @param {string} [props.helperClassName] - Extra classes for helper text.
 * @param {string} [props.messageClassName] - Extra classes for validation message text.
 * @param {boolean} [props.showStatusIcon=true] - Whether to show the right-side validation icon.
 * @returns {JSX.Element} Complete accessible field wrapper.
 *
 * @example
 * <FormFieldWrapper
 * id="email"
 * label="Email"
 * required
 * validationState="error"
 * message="Email is already registered"
 * >
 * <input type="email" />
 * </FormFieldWrapper>
 */
const FormFieldWrapper = ({
  id,
  name,
  label,
  children,
  required = false,
  helperText,
  message,
  prefix,
  suffix,
  validationState = "idle",
  className = "",
  labelClassName = "",
  inputWrapperClassName = "",
  helperClassName = "",
  messageClassName = "",
  showStatusIcon = true,
}) => {
  const child = React.isValidElement(children) ? React.Children.only(children) : null;
  const fieldName = name || child?.props?.name || child?.props?.id || "field";
  const fieldId = id || child?.props?.id || fieldName;
  const helperId = hasMessage(helperText) ? `${fieldId}-helper` : undefined;
  const messageId = hasMessage(message) ? `${fieldId}-message` : undefined;
  const describedBy = mergeDescribedBy(
    child?.props?.["aria-describedby"],
    helperId,
    messageId,
  );
  const invalid = isErrorState(validationState) && hasMessage(message);
  const loading = isLoadingState(validationState);

  const enhancedChild = child
    ? React.cloneElement(child, {
        id: fieldId,
        name: child.props.name || fieldName,
        "aria-describedby": describedBy,
        "aria-invalid": invalid ? "true" : "false",
        "aria-busy": loading ? "true" : undefined,
        "aria-required": required ? "true" : child.props["aria-required"],
        className: joinClasses(
          "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500",
          invalid && "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400",
          // 🔥 FIX 1: Support both success AND valid states for the styling
          (validationState === "success" || validationState === "valid") && "border-green-500 focus:border-green-500 focus:ring-green-500/20 dark:border-green-400",
          loading && "border-blue-500 dark:border-blue-400",
          prefix && "pl-10",
          (showStatusIcon || suffix) && "pr-10",
          showStatusIcon && suffix && "pr-16",
          child.props.className,
        ),
      })
    : children;

  return (
    <div className={joinClasses("w-full", className)} data-state={validationState}>
      {label && (
        <label
          className={joinClasses(
            "mb-1.5 block text-sm font-medium text-gray-800 dark:text-gray-100",
            labelClassName,
          )}
          htmlFor={fieldId}
        >
          {label}
          {required && (
            <span
              className="ml-1 text-red-600 dark:text-red-400"
              aria-hidden="true"
            >
              *
            </span>
          )}
          {/* 🔥 FIX 2: Removed redundant sr-only required span to prevent screen reader stutter. aria-required handles this. */}
        </label>
      )}

      <div className={joinClasses("relative", inputWrapperClassName)}>
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            {prefix}
          </span>
        )}
        {enhancedChild}
        {suffix && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {suffix}
          </span>
        )}
        {showStatusIcon && (
          <span
            className={joinClasses(
              "pointer-events-none absolute inset-y-0 flex items-center",
              suffix ? "right-10" : "right-3",
            )}
          >
            <ValidationStatusIcon state={validationState} />
          </span>
        )}
      </div>

      {hasMessage(helperText) && (
        <p
          id={helperId}
          className={joinClasses(
            "mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400",
            helperClassName,
          )}
        >
          {helperText}
        </p>
      )}

      <ValidationMessage
        id={messageId}
        message={message}
        state={validationState}
        className={messageClassName}
      />
    </div>
  );
};

export default FormFieldWrapper;