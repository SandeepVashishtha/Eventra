import React from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
    >
      {isDarkMode ? <Sun /> : <Moon />}
    </button>
  );
};

export default ThemeToggle;