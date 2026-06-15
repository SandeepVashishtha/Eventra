import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

/**
 * ModernSearchInput - Reusable animated search input
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
  tags = null,
  children,
  searchInputRef,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={`w-full relative ${containerClassName}`}>
      <motion.div
        animate={{
          y: isFocused ? -6 : 0,
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative group"
      >
        {/* Left Icon */}
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none ${
            isFocused
              ? "text-indigo-500"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {leftIcon}
        </div>

        {/* Input Container */}
        <div
          className={`flex items-center w-full h-14 sm:h-16 px-4 pl-12 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-lg ${inputClassName}`}
          style={{
            borderColor: isFocused ? "#6366f1" : "#e5e7eb",
            borderWidth: isFocused ? "2px" : "1px",
            boxShadow: isFocused
              ? "0 20px 25px -5px rgba(99, 102, 241, 0.25)"
              : "0 10px 15px -3px rgba(0,0,0,0.1)",
          }}
        >
          {tags}

          <input
            ref={searchInputRef}
            type="text"
            placeholder={tags ? "" : placeholder}
            className="flex-1 bg-transparent border-none outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            spellCheck={false}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
          />
        </div>

        {/* Clear Button */}
        {showClearButton && value && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange({ target: { value: "" } })}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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