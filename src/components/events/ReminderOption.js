import { Check, Clock } from "lucide-react";

const ReminderOption = ({
  option,
  selected = false,
  onClick,
  disabled = false,
}) => {
  if (!option) {
    return null;
  }

  const label =
    option.label ||
    option.name ||
    "Reminder";

  const description =
    option.description || "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Set reminder: ${label}`}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        selected
          ? "border-indigo-500 bg-indigo-50 shadow-sm dark:border-indigo-500 dark:bg-indigo-900/20"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-700 dark:hover:bg-slate-800"
      } ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
        }`}
      >
        {selected ? (
          <Check
            size={18}
            strokeWidth={2.5}
          />
        ) : (
          <Clock size={18} />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold ${
            selected
              ? "text-indigo-700 dark:text-indigo-300"
              : "text-slate-800 dark:text-white"
          }`}
        >
          {label}
        </p>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {/* Selection indicator */}
      <span
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
          selected
            ? "border-indigo-600 bg-indigo-600"
            : "border-slate-300 dark:border-slate-600"
        }`}
      >
        {selected && (
          <span className="block h-full w-full scale-50 rounded-full bg-white" />
        )}
      </span>
    </button>
  );
};

export default ReminderOption;