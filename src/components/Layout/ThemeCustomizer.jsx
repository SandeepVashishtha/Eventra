import { useEffect } from "react";
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
    { id: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { id: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
    { id: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCustomizerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          className="relative w-full max-w-lg bg-card-bg rounded-2xl shadow-premium-lg border border-border overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-slate-50/20 dark:bg-slate-950/10">
            <h2 className="text-lg font-bold text-text">Theme Customizer</h2>
            <button
              onClick={() => setIsCustomizerOpen(false)}
              className="p-2 rounded-lg text-text-light hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              aria-label="Close customizer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Base Theme Section */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-light/50">
                Base Mode
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {baseThemeOptions.map((option) => {
                  const isActive = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-premium-sm"
                          : "border-border bg-transparent text-text-light hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      {option.icon}
                      <span className="text-xs font-semibold">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skins / Color Themes Section */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-light/50">
                Color Themes
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(THEMES).map((themeOption) => {
                  const isActive = activeThemeId === themeOption.id;
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => setActiveThemeId(themeOption.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                        isActive
                          ? "border-primary bg-primary/10"
                          : "border-border bg-transparent hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${themeOption.accent} flex items-center justify-center shadow-sm shrink-0`}
                      >
                        {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span
                        className={`text-xs font-semibold flex-1 truncate ${
                          isActive ? "text-primary font-bold" : "text-text"
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
