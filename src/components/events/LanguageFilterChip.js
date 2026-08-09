import { Check } from "lucide-react";

const LanguageFilterChip = ({
  language,
  selected = false,
  onClick,
  disabled = false,
}) => {
  if (!language) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Filter events by ${language}`}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        selected
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
      } ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer"
      }`}
    >
      {selected && (
        <Check
          size={15}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      )}

      <span>{language}</span>
    </button>
  );
};

export default LanguageFilterChip;