import React from "react";

import {
  Moon,
  Sun,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const {
    isDarkMode,
    toggleTheme,
  } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle Theme"
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
  );
};

export default ThemeToggle;