import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

/**
 * ModernSearchInput - A reusable, animated search input component
 * designed to satisfy CodeScene complexity gates and maintain a premium UI.
 */
const ModernSearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  onFocus,
  autoFocus,
  onBlur,
  onKeyDown,
  containerClassName = "",
  inputClassName = "",
  showClearButton = true,
  leftIcon = <Search className="h-5 w-5" />,
  tags = null, // For Hackathons
  children, // For results dropdown (Home Hero)
  searchInputRef,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`w-full relative ${containerClassName}`}>
      <motion.div
        animate={{
          y: isFocused ? -8 : 0,
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative group"
      >
        <div
          className={`absolute inset-y-0 left-0 pl-4 flex items-center z-20 pointer-events-none transition-colors duration-300 ${
            isFocused ? "text-indigo-500" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {leftIcon}
        </div>

        <div
          className={`flex flex-wrap items-center gap-2 w-full pl-12 pr-12 py-3.5 sm:py-4 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 border  rounded-2xl transition-all duration-300 shadow-lg ${inputClassName}`}
          style={{
            borderColor: isFocused ? "#6366f1" : "",
            borderWidth: isFocused ? "2px" : "1px",
            boxShadow: isFocused
              ? "0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.2)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {tags}
          <input
            ref={searchInputRef}
            type="text"
            placeholder={tags && tags.length > 0 ? "" : placeholder}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 min-w-[120px] placeholder-gray-400 dark:placeholder-gray-500"
            style={{ color: "inherit" }}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            autoFocus={autoFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
          />
        </div>

        {showClearButton && value && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange({ target: { value: "" } })}
            className="absolute inset-y-0 right-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-20"
            aria-label="Clear search input"
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </motion.div>
      {children}
    </div>
  );
};

export default ModernSearchInput;