import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Monitor, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeCustomizer = () => {
  const {
    isCustomizerOpen,
    setIsCustomizerOpen,
    theme,
    setTheme,
    activeThemeId,
    setActiveThemeId,
    THEMES,
  } = useTheme();

  useEffect(() => {
    if (isCustomizerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isCustomizerOpen]);

  if (!isCustomizerOpen) return null;

  const baseThemeOptions = [
    { id: "light", label: "Light", icon: <Sun className="h-5 w-5" /> },
    { id: "dark", label: "Dark", icon: <Moon className="h-5 w-5" /> },
    { id: "system", label: "System", icon: <Monitor className="h-5 w-5" /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCustomizerOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-slate-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Theme Customizer</h2>
            <button
              onClick={() => setIsCustomizerOpen(false)}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
              aria-label="Close customizer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8 overflow-y-auto p-6">
            {/* Base Theme Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Base Mode
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {baseThemeOptions.map((option) => {
                  const isActive = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          : "border-gray-200 dark:border-slate-700 bg-transparent text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {option.icon}
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skins / Color Themes Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Color Themes
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.values(THEMES).map((themeOption) => {
                  const isActive = activeThemeId === themeOption.id;
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => setActiveThemeId(themeOption.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        isActive
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                          : "border-gray-200 dark:border-slate-700 bg-transparent hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${themeOption.accent} flex items-center justify-center shadow-sm shrink-0`}
                      >
                        {isActive && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <span
                        className={`text-sm font-medium flex-1 truncate ${
                          isActive
                            ? "text-indigo-700 dark:text-indigo-300"
                            : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {themeOption.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ThemeCustomizer;
