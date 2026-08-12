import { Check, X } from "lucide-react";

const SkillTag = ({
  skill,
  selected = false,
  onClick,
  onRemove,
  removable = false,
  disabled = false,
}) => {
  if (!skill) {
    return null;
  }

  const handleClick = () => {
    if (!disabled) {
      onClick?.(skill);
    }
  };

  const handleRemove = (event) => {
    event.stopPropagation();

    if (!disabled) {
      onRemove?.(skill);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${selected ? "Remove" : "Filter by"} ${skill}`}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
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
          size={14}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      )}

      <span>{skill}</span>

      {removable && (
        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={handleRemove}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              handleRemove(event);
            }
          }}
          aria-label={`Remove ${skill}`}
          className="rounded-full p-0.5 transition hover:bg-white/20"
        >
          <X
            size={13}
            aria-hidden="true"
          />
        </span>
      )}
    </button>
  );
};

export default SkillTag;