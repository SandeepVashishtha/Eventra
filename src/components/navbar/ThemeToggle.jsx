import React from "react";

import {
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const {
    theme,
    isDarkMode,
    toggleTheme,
    setTheme,
  } = useTheme();

  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      {/* Toggle Button */}
      <button
        onClick={
          toggleTheme
        }
        aria-label={`Switch to ${
          isDarkMode
            ? "light"
            : "dark"
        } mode`}
        aria-pressed={
          isDarkMode
        }
        className="
          relative
          flex
          items-center
          justify-center

          w-11
          h-11

          rounded-full

          bg-gray-200
          dark:bg-gray-800

          text-black
          dark:text-white

          shadow-md

          hover:scale-110
          hover:shadow-lg

          transition-all
          duration-300

          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      >
        <div
          className="
            transition-transform
            duration-500
          "
        >
          {isDarkMode ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </div>
      </button>

      {/* System Mode Button */}
      <button
        onClick={() =>
          setTheme(
            "system"
          )
        }
        className={`
          flex
          items-center
          justify-center

          w-11
          h-11

          rounded-full

          transition-all
          duration-300

          ${
            theme ===
            "system"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 dark:bg-gray-800 dark:text-white"
          }
        `}
        aria-label="Use system theme"
      >
        <Monitor
          size={18}
        />
      </button>
    </div>
  );
};

export default ThemeToggle;