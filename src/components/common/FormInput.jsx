
const FormInput = ({
  label,
  error,
  className = "",
  ...props
}) => {
  const fieldId = props.id || props.name;
  const errorId = fieldId ? `${fieldId}-error` : undefined;

  return (
    <div className="w-full space-y-2">
      
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={fieldId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error && errorId ? errorId : props["aria-describedby"]}
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
        <p id={errorId} className="text-sm text-red-500" role="alert" aria-live="polite">
          {error}
        </p>
      )}

    </div>
  );
};

export default FormInput;   
