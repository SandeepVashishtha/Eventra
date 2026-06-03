import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, FolderOpen, Bookmark, Calendar, FilterX } from "lucide-react";

/**
 * EmptyState Component
 * 
 * Displayed when a listing or results page has no data.
 * Unified version resolving merge conflicts between interactive features and responsive design.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  message,
  actionText,
  actionLink = "/explore",
  variant = "search",
  type,
  onClearFilters,
  onBrowseAll,
  compact = false,
}) => {
  const navigate = useNavigate();
  
  const activeType = type || variant;
  const activeTitle = title || (activeType === "search" ? "No results found" : "Empty");
  const activeDescription = message || description || (activeType === "search" ? "Try adjusting your filters or search terms to find what you're looking for." : "");

  const variants = {
    search: { icon: Search, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    bookmarks: { icon: Bookmark, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    events: { icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    generic: { icon: FolderOpen, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-800" }
  };

  const config = variants[activeType] || variants.generic;
  const ActiveIcon = Icon || config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-3xl text-center border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] ${
        compact ? "p-6" : "p-12 max-w-lg mx-auto"
      }`}
    >
      {/* Background decoration */}
      {!compact && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        {/* Icon/Illustration */}
        <div className="flex justify-center">
          <div className={`rounded-full ${compact ? "p-4" : "p-6"} ${config.bg} ${config.color}`}>
             {typeof ActiveIcon === 'function' ? (
               <ActiveIcon size={compact ? 32 : 48} strokeWidth={1.5} />
             ) : (
               React.cloneElement(ActiveIcon, { size: compact ? 32 : 48 })
             )}
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <h3 className={`${compact ? "text-lg" : "text-2xl"} font-bold text-gray-900 dark:text-white`}>
            {activeTitle}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
            {activeDescription}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {actionText && (
            <button
              onClick={() => navigate(actionLink)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
            >
              {actionText}
            </button>
          )}

          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="Clear all filters"
            >
              <FilterX size={16} />
              Clear Filters
            </button>
          )}

          {onBrowseAll && (
            <button
              type="button"
              onClick={onBrowseAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="Browse all events"
            >
              <Search size={16} />
              Browse All Events
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmptyState;
