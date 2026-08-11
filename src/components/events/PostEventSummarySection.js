import { ChevronDown } from "lucide-react";
import { useState } from "react";

const PostEventSummarySection = ({
  title,
  icon: Icon,
  children,
  description,
  defaultOpen = true,
  collapsible = false,
  badge,
  className = "",
}) => {
  const [open, setOpen] =
    useState(defaultOpen);

  const handleToggle = () => {
    if (collapsible) {
      setOpen((current) => !current);
    }
  };

  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={!collapsible}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 p-4 text-left ${
          collapsible
            ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
            : "cursor-default"
        }`}
      >
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Icon
              size={17}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {title}
            </h3>

            {badge !== undefined &&
              badge !== null && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {badge}
                </span>
              )}
          </div>

          {description && (
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>

        {collapsible && (
          <ChevronDown
            size={17}
            className={`shrink-0 text-slate-400 transition-transform duration-200 ${
              open
                ? "rotate-180"
                : ""
            }`}
          />
        )}
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          {children}
        </div>
      )}
    </section>
  );
};

export default PostEventSummarySection;
