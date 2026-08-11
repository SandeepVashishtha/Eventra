import { Check } from "lucide-react";

const CategoryFilterChip = ({
  category,
  selected = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={() => onClick?.(category)}
      aria-pressed={selected}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
        selected
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
      }`}
    >
      {selected && <Check size={15} />}

      <span>{category}</span>
    </button>
  );
};

export default CategoryFilterChip;