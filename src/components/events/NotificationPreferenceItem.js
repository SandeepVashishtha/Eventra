import { Bell, Check } from "lucide-react";

const NotificationPreferenceItem = ({
  id,
  label,
  description,
  enabled = false,
  onToggle,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 bg-white p-5 transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800">
      {/* Notification information */}
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            enabled
              ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
          }`}
        >
          <Bell size={20} />
        </div>

        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 dark:text-white">
            {label}
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* Toggle */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
        onClick={() => onToggle?.(id)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          enabled
            ? "bg-indigo-600"
            : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        >
          {enabled && (
            <Check
              size={12}
              className="text-indigo-600"
            />
          )}
        </span>
      </button>
    </div>
  );
};

export default NotificationPreferenceItem;