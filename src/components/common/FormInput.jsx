import { useId } from "react";

const joinIds = (...ids) => ids.filter(Boolean).join(" ") || undefined;

const FormInput = ({
  label,
  error,
  className = "",
  id,
  required,
  "aria-describedby": ariaDescribedBy,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || props.name || `form-input-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = joinIds(ariaDescribedBy, errorId);

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        required={required}
        aria-required={required ? "true" : undefined}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={`
          w-full
          px-4
          py-3
          rounded-xl
          border
          bg-white
          dark:bg-slate-900
          text-slate-900
          dark:text-white
          border-slate-300
          dark:border-slate-700
          transition-all
          duration-200
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
          focus:border-transparent
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : ""
          }
          ${className}
        `}
      />

      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
