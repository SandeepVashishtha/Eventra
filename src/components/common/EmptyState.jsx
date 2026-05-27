import React from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";

/**
 * A reusable empty state component for lists, tables, or sections that have no data.
 * @param {object} props
 * @param {React.ReactNode} [props.icon] - Lucide icon component (default: Inbox)
 * @param {string} props.title - The main heading text
 * @param {string} props.description - Supporting description text
 * @param {string} [props.ctaText] - Text for the primary action button
 * @param {string} [props.ctaLink] - URL to navigate to (if it's a link)
 * @param {Function} [props.onCtaClick] - Click handler (if it's a button)
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  ctaText,
  ctaLink,
  onCtaClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] w-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-4 shadow-sm">
        <Icon size={32} />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>

      {ctaText && (
        <>
          {ctaLink ? (
            <Link
              to={ctaLink}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 shadow-sm hover:shadow"
            >
              {ctaText}
            </Link>
          ) : onCtaClick ? (
            <button
              onClick={onCtaClick}
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 shadow-sm hover:shadow"
            >
              {ctaText}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
};

export default EmptyState;