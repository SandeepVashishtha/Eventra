import { FiSun, FiMoon } from "react-icons/fi";

import { useTheme } from "../../context/ThemeContext";

const ThemeToggleButton = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="flex items-center cursor-pointer select-none"
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="w-12 h-6 rounded-full p-1 bg-gray-300 dark:bg-gray-700 relative">
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center
            transform transition-all duration-300 ease-in-out absolute top-0.5
            ${isDarkMode ? "translate-x-6" : "translate-x-0"}`}
        >
          {isDarkMode ? (
            <FiSun className="text-yellow-500 text-sm" />
          ) : (
            <FiMoon className="text-gray-700 text-sm" />
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggleButton;
