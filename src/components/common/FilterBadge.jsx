import React from "react";
import { X } from "lucide-react";

/**
 * FilterBadge Component
 * Displays a filter badge with remove functionality
 */
const FilterBadge = ({ label, onRemove, variant = "default" }) => {
  // Color variants for different filter types
  const variants = {
    default: {
      bg: "bg-white dark:bg-gray-800",
      border: "border-gray-200 dark:border-gray-700",
      text: "text-gray-800 dark:text-gray-100",
      button: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
    },
    primary: {
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
      border: "border-indigo-200 dark:border-indigo-700",
      text: "text-indigo-700 dark:text-indigo-300",
      button:
        "text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300",
    },
    success: {
      bg: "bg-green-50 dark:bg-green-900/30",
      border: "border-green-200 dark:border-green-700",
      text: "text-green-700 dark:text-green-300",
      button: "text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-200 dark:border-amber-700",
      text: "text-amber-700 dark:text-amber-300",
      button: "text-amber-500 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-200 dark:border-red-700",
      text: "text-red-700 dark:text-red-300",
      button: "text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300",
    },
  };

  const colorVariant = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm transition-all ${colorVariant.bg} ${colorVariant.border} ${colorVariant.text}`}
    >
      <span className="max-w-xs truncate">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className={`flex-shrink-0 rounded-full p-0.5 transition-colors ${colorVariant.button}`}
          aria-label={`Remove ${label} filter`}
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
};

export default React.memo(FilterBadge);
