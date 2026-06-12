import { useId } from "react";

const FormInput = ({ label, error, className = "", ...props }) => {
  const generatedId = useId();
  const inputId = props.id || props.name || generatedId;
  const errorId = `${inputId}-error`;

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
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : props["aria-describedby"]}
        className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
          error ? "border-red-500 focus:ring-red-500" : ""
        } ${className} `}
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
