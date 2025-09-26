import { useContext } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { ThemeContext } from "../../context/ThemeContext";

// Enhanced ThemeToggleButton Component
// ------------------------------------
// A modern toggle switch that lets the user switch
// between light mode ☀️ and dark mode 🌙.
// Features: smooth animations, accessibility, hover effects,
// and persistent state in localStorage.

const ThemeToggleButton = ({ size = "default", showLabel = false }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Determine if dark mode is active
  const darkMode = theme === "dark";

  // Size variants
  const sizeClasses = {
    small: "w-12 h-6",
    default: "w-16 h-8",
    large: "w-20 h-10"
  };

  const iconSizes = {
    small: "w-4 h-4",
    default: "w-5 h-5",
    large: "w-6 h-6"
  };

  const circleSizes = {
    small: "w-4 h-4",
    default: "w-6 h-6",
    large: "w-8 h-8"
  };

  const translateClasses = {
    small: "translate-x-6",
    default: "translate-x-8",
    large: "translate-x-10"
  };

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center cursor-pointer select-none
          rounded-full p-1 transition-all duration-300 ease-in-out
          bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700
          hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-700 dark:hover:to-purple-700
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          shadow-lg hover:shadow-xl transform hover:scale-105
        `}
        style={{ width: sizeClasses[size].split(' ')[0], height: sizeClasses[size].split(' ')[1] }}
        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      >
        {/* Track background with gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 dark:opacity-20 transition-opacity duration-300" />

        {/* Sliding Circle */}
        <div
          className={`
            ${circleSizes[size]} bg-white dark:bg-gray-200 rounded-full shadow-lg
            flex items-center justify-center transform transition-all duration-300 ease-in-out
            ${darkMode ? translateClasses[size] : "translate-x-0"}
            ring-2 ring-transparent hover:ring-indigo-300 dark:hover:ring-purple-400
          `}
        >
          {/* Icon with smooth transition */}
          <div className="transition-all duration-300 ease-in-out">
            {darkMode ? (
              <FiSun className={`${iconSizes[size]} text-yellow-500 drop-shadow-sm`} />
            ) : (
              <FiMoon className={`${iconSizes[size]} text-indigo-600 dark:text-indigo-400 drop-shadow-sm`} />
            )}
          </div>
        </div>
      </button>

      {/* Optional Label */}
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
          {darkMode ? 'Dark' : 'Light'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggleButton;
