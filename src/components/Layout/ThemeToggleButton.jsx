import { motion } from "framer-motion";
import { Sun, Moon, Palette } from "lucide-react";

const ThemeToggleButton = ({ isDarkMode, toggleTheme, isMobile, setIsCustomizerOpen }) => {
  if (isMobile) {
    return (
      <div className="flex flex-col gap-2.5 w-full">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-all cursor-pointer"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500" />
          )}
          <span>{isDarkMode ? "Switch to Light" : "Switch to Dark"}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCustomizerOpen && setIsCustomizerOpen(true)}
          className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold border-none shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Palette className="w-5 h-5" />
          <span>THEME Customizer</span>
        </motion.button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <motion.span
          key={isDarkMode ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-zinc-600 group-hover:text-indigo-500 dark:text-zinc-400 dark:group-hover:text-indigo-400"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsCustomizerOpen && setIsCustomizerOpen(true)}
        title="Open Theme Customizer"
        className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 focus:outline-none bg-gradient-to-r from-indigo-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:to-pink-500/20 border border-indigo-200/50 dark:border-indigo-800/40 hover:shadow-[0_0_12px_rgba(236,72,153,0.3)] text-indigo-550 dark:text-indigo-400 cursor-pointer"
      >
        <Palette className="w-4 h-4 animate-pulse text-indigo-500 dark:text-indigo-400" />
      </motion.button>
    </div>
  );
};

export default ThemeToggleButton;
