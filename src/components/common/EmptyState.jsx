import React from "react";
import { Search, FilterX, Inbox } from "lucide-react";
import { motion } from "framer-motion";

const EmptyState = ({
  type = "search",
  title,
  message,
  onClearFilters,
  onBrowseAll,
  icon,
}) => {
  const getDefaultConfig = () => {
    switch (type) {
      case "search":
        return {
          icon: <Search size={48} className="text-gray-400" />,
          title: "No results found",
          message: "Try adjusting your search terms or filters to find what you're looking for.",
        };
      case "filters":
        return {
          icon: <FilterX size={48} className="text-gray-400" />,
          title: "No events match your filters",
          message: "Try adjusting your filters or clearing them to see all available events.",
        };
      case "bookmarks":
        return {
          icon: <Inbox size={48} className="text-gray-400" />,
          title: "No bookmarked events",
          message: "Start exploring and bookmark events you're interested in!",
        };
      default:
        return {
          icon: <Inbox size={48} className="text-gray-400" />,
          title: "Nothing here yet",
          message: "Check back later for new content.",
        };
    }
  };

  const config = {
    icon: icon || getDefaultConfig().icon,
    title: title || getDefaultConfig().title,
    message: message || getDefaultConfig().message,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl p-10 text-center border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Icon/Illustration */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
            {config.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {config.title}
        </h3>

        {/* Message */}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {config.message}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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