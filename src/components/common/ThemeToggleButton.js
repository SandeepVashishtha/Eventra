import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggleButton = () => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div
      className="flex items-center cursor-pointer select-none"
      onClick={() => setDarkMode((prev) => !prev)}
    >
      <div
        className={`w-12 h-6 rounded-full p-1 bg-gray-300 dark:bg-gray-700 relative`} // reduced size
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center
            transform transition-all duration-300 ease-in-out absolute top-0.5
            ${darkMode ? "translate-x-6" : "translate-x-0"}`} // adjusted translation
        >
          {darkMode ? (
            <FiSun className="text-yellow-500 text-sm" /> // smaller icon
          ) : (
            <FiMoon className="text-gray-700 text-sm" /> // smaller icon
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggleButton;
