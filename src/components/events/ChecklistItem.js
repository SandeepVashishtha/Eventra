import { Check, Circle } from "lucide-react";

const ChecklistItem = ({
  item = {},
  onToggle,
  disabled = false,
}) => {
  const {
    id,
    title = "Preparation item",
    description = "",
    required = false,
    completed = false,
  } = item;

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    onToggle?.(id);
  };

  return (
    <div
      className={`group flex items-start gap-3 rounded-xl border p-4 transition ${
        completed
          ? "border-green-200 bg-green-50/70 dark:border-green-900 dark:bg-green-900/10"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-slate-800/60"
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={completed}
        aria-label={
          completed
            ? `Mark ${title} as incomplete`
            : `Mark ${title} as completed`
        }
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          completed
            ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500"
            : "border-slate-300 bg-white text-transparent hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
        } ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }`}
      >
        {completed ? (
          <Check
            size={14}
            strokeWidth={3}
            aria-hidden="true"
          />
        ) : (
          <Circle
            size={10}
            className="opacity-0 group-hover:opacity-100"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`text-sm font-semibold ${
              completed
                ? "text-green-800 line-through dark:text-green-300"
                : "text-slate-800 dark:text-white"
            }`}
          >
            {title}
          </h3>

          {required && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                completed
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              Required
            </span>
          )}

          {completed && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Completed
            </span>
          )}
        </div>

        {description && (
          <p
            className={`mt-1 text-xs leading-5 ${
              completed
                ? "text-green-700/80 dark:text-green-400/80"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChecklistItem;