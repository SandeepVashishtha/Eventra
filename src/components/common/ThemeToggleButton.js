import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggleButton = ({ className = "", showLabel = false }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const Icon = isDarkMode ? Sun : Moon;
  const label = isDarkMode ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isDarkMode}
      title={label}
      className={`inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white/90 p-1 text-gray-900 shadow-sm backdrop-blur transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus:ring-white/25 ${className}`}
      onClick={toggleTheme}
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-full ${
          isDarkMode
            ? "bg-amber-300 text-zinc-950"
            : "bg-zinc-900 text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      {showLabel && (
        <span className="pr-3 text-sm font-medium">
          {isDarkMode ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggleButton;
