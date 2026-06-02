import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, FolderOpen, Bookmark, Calendar } from "lucide-react";

/**
 * EmptyState Component
 * 
 * Displayed when a listing or results page has no data.
 */
const EmptyState = ({ 
  icon: Icon = Search, 
  title = "No results found", 
  description = "Try adjusting your filters or search terms to find what you're looking for.",
  actionText = "Explore Events",
  actionLink = "/explore",
  variant = "search"
}) => {
  const navigate = useNavigate();

  const variants = {
    search: { icon: Search, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    bookmarks: { icon: Bookmark, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    events: { icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    generic: { icon: FolderOpen, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-800" }
  };

  const config = variants[variant] || variants.generic;
  const ActiveIcon = Icon || config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-12 max-w-lg mx-auto space-y-6"
    >
      <div className={`p-6 rounded-full ${config.bg} ${config.color}`}>
        <ActiveIcon size={48} strokeWidth={1.5} />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>

      {actionText && (
        <button
          onClick={() => navigate(actionLink)}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
