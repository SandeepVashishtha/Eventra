import React from "react";
import { Search, FilterX, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const EmptyState = ({
  type = "search",
  title,
  description,
  message, // Legacy support
  icon,
  actionLabel,
  onAction,
  onClearFilters, // Legacy support
  onBrowseAll, // Legacy support
  actionPath, // Support routing link
  compact = false,
  children,
}) => {
  const getDefaultConfig = () => {
    switch (type) {
      case "search":
        return {
          icon: Search,
          title: "No results found",
          message: "Try adjusting your search terms or filters to find what you're looking for.",
        };
      case "filters":
        return {
          icon: FilterX,
          title: "No events match your filters",
          message: "Try adjusting your filters or clearing them to see all available events.",
        };
      case "bookmarks":
        return {
          icon: Inbox,
          title: "No bookmarked events",
          message: "Start exploring and bookmark events you're interested in!",
        };
      default:
        return {
          icon: Inbox,
          title: "Nothing here yet",
          message: "Check back later for new content.",
        };
    }
  };

  const defaultConfig = getDefaultConfig();
  const displayTitle = title || defaultConfig.title;
  const displayDescription = description || message || defaultConfig.message;
  const rawIcon = icon || defaultConfig.icon;

  const renderIcon = () => {
    if (!rawIcon) return null;
    if (React.isValidElement(rawIcon)) {
      return rawIcon;
    }
    const IconComponent = rawIcon;
    return <IconComponent size={compact ? 32 : 48} className="text-gray-400 dark:text-gray-500" />;
  };

  // Determine main action handler
  const handleAction = onAction || onClearFilters || onBrowseAll;

  // Determine main action label
  const displayActionLabel =
    actionLabel || (onBrowseAll ? "Browse All Events" : onClearFilters ? "Clear Filters" : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-3xl border border-gray-100 bg-white text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:border-gray-700 dark:bg-slate-900 dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] ${
        compact ? "p-6" : "p-10"
      }`}
    >
      {/* Background decoration */}
      {!compact && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 blur-3xl dark:from-blue-900/10 dark:to-indigo-900/10" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-purple-50 to-pink-50 blur-3xl dark:from-purple-900/10 dark:to-pink-900/10" />
        </div>
      )}

      <div className="relative z-10">
        {/* Icon/Illustration */}
        <div className={`flex justify-center ${compact ? "mb-4" : "mb-6"}`}>
          <div
            className={`${compact ? "rounded-xl p-3" : "rounded-2xl p-4"} bg-slate-50 dark:bg-slate-800`}
          >
            {renderIcon()}
          </div>
        </div>

        {/* Title */}
        <h3
          className={`${compact ? "text-lg" : "text-xl"} font-bold text-slate-900 dark:text-white`}
        >
          {displayTitle}
        </h3>

        {/* Message */}
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {displayDescription}
        </p>

        {children}

        {/* Action Button/Link */}
        {displayActionLabel && (actionPath || handleAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {actionPath ? (
              <Link
                to={actionPath}
                onClick={handleAction}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                aria-label={displayActionLabel}
              >
                {displayActionLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAction}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                aria-label={displayActionLabel}
              >
                {displayActionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
