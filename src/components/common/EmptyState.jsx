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
  actionPath,      // Support routing link for primary action
  secondaryLabel,  // Optional second action label
  onSecondary,     // Optional second action handler
  secondaryPath,   // Optional second action route
  onClearFilters,  // Legacy support
  onBrowseAll,     // Legacy support
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
          actionLabel: "Clear search",
        };
      case "filters":
        return {
          icon: FilterX,
          title: "No events match your filters",
          message: "Try adjusting your filters or clearing them to see all available events.",
          actionLabel: "Clear all filters",
        };
      case "bookmarks":
        return {
          icon: Inbox,
          title: "No bookmarked events yet",
          message: "Save events you're interested in and they'll appear here for quick access.",
          actionLabel: "Browse Events",
          defaultActionPath: "/events",
        };
      case "events-empty":
        return {
          icon: Inbox,
          title: "No events available right now",
          message: "New events are added regularly. Come back soon, or browse hackathons in the meantime!",
          actionLabel: "Browse Hackathons",
          defaultActionPath: "/hackathons",
        };
      case "dashboard":
        return {
          icon: Inbox,
          title: "Your dashboard is empty",
          message: "Register for events or bookmark ones you like and they'll show up here.",
          actionLabel: "Discover Events",
          defaultActionPath: "/events",
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

  const defaultConfig = getDefaultConfig();
  const displayTitle = title || defaultConfig.title;
  const displayDescription = description || message || defaultConfig.message;
  const rawIcon = icon || defaultConfig.icon;

  // Resolve primary action
  const handleAction = onAction || onClearFilters || onBrowseAll;
  const resolvedActionPath = actionPath || defaultConfig.defaultActionPath;
  const displayActionLabel =
    actionLabel ||
    defaultConfig.actionLabel ||
    (onBrowseAll ? "Browse All Events" : onClearFilters ? "Clear Filters" : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-3xl text-center border border-gray-100 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] ${
        compact ? "p-6" : "p-10"
      }`}
    >
      {/* Background decoration */}
      {!compact && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10">
        {/* Icon/Illustration */}
        <div className={`flex justify-center ${compact ? "mb-4" : "mb-6"}`}>
          <div className={`${compact ? "p-3 rounded-xl" : "p-4 rounded-2xl"} bg-slate-50 dark:bg-slate-800`}>
            {renderIcon()}
          </div>
        </div>

        {/* Title */}
        <h3 className={`${compact ? "text-lg" : "text-xl"} font-bold text-slate-900 dark:text-white`}>
          {displayTitle}
        </h3>

        {/* Message */}
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {displayDescription}
        </p>

        {children}

        {/* Action Button(s) */}
        {displayActionLabel && (resolvedActionPath || handleAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* Primary action */}
            {resolvedActionPath && !handleAction ? (
              <Link
                to={resolvedActionPath}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                aria-label={displayActionLabel}
              >
                {displayActionLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleAction}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                aria-label={displayActionLabel}
              >
                {displayActionLabel}
              </button>
            )}

            {/* Secondary action (optional) */}
            {secondaryLabel && (secondaryPath || onSecondary) && (
              secondaryPath ? (
                <Link
                  to={secondaryPath}
                  onClick={onSecondary}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400/30"
                  aria-label={secondaryLabel}
                >
                  {secondaryLabel}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onSecondary}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400/30"
                  aria-label={secondaryLabel}
                >
                  {secondaryLabel}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;