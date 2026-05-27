import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiSun, FiMoon, FiAward, FiPocket } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeCustomizerDrawer() {
  const {
    theme,
    resolvedTheme,
    setTheme,
    activeThemeId,
    setActiveThemeId,
    isCustomizerOpen,
    setIsCustomizerOpen,
    THEMES,
  } = useTheme();

  const drawerRef = useRef(null);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsCustomizerOpen(false);
      }
    };
    if (isCustomizerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isCustomizerOpen, setIsCustomizerOpen]);

  // Click-away listener
  const handleBackdropClick = (e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      setIsCustomizerOpen(false);
    }
  };

  // Prevent scroll event propagation to backdrop
  const handleScrollPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isCustomizerOpen && (
        <div
          onClick={handleBackdropClick}
          onWheel={handleScrollPropagation}
          onTouchMove={handleScrollPropagation}
          className="fixed inset-0 z-50 flex justify-end bg-black/40 dark:bg-black/60 backdrop-blur-xs transition-opacity duration-300 overscroll-contain"
          style={{ overscrollBehavior: "contain" }}
          data-lenis-prevent
        >
          {/* Drawer Container */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            onWheel={handleScrollPropagation}
            onTouchMove={handleScrollPropagation}
            className="w-full sm:w-[420px] h-full bg-white/70 dark:bg-slate-950/75 backdrop-blur-xl border-l border-slate-200/50 dark:border-slate-800/40 p-6 flex flex-col shadow-2xl relative overflow-hidden overscroll-contain"
            style={{ overscrollBehavior: "contain" }}
            data-lenis-prevent
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/40">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    🎨 Theme Customizer
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Tailor your platform visual identity
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCustomizerOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                  aria-label="Close customizer"
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Theme Settings Sections */}
              <div
                className="flex-1 min-h-0 py-6 space-y-8 overflow-y-auto pr-1 overscroll-contain"
                style={{ overscrollBehavior: "contain" }}
                onWheel={handleScrollPropagation}
                onTouchMove={handleScrollPropagation}
                data-lenis-prevent
              >
                {/* Mode Selector (Light vs Dark) */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
                    Baseline Mode
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light", icon: FiSun, color: "text-amber-500 bg-amber-500/10" },
                      { id: "dark", label: "Dark", icon: FiMoon, color: "text-indigo-500 bg-indigo-500/10" },
                      { id: "system", label: "System", icon: FiAward, color: "text-slate-500 bg-slate-500/10" }
                    ].map((mode) => (
                      <motion.button
                        key={mode.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setTheme(mode.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer font-bold text-xs transition-all ${
                          theme === mode.id
                            ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                            : "bg-white/40 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/40 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <mode.icon className={`w-4 h-4 ${mode.color} p-0.5 rounded-sm`} />
                        <span>{mode.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Premium Profiles Grid */}
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
                    Premium Skin Profiles
                  </span>
                  <div className="space-y-3.5">
                    {Object.values(THEMES).map((themeOpt) => {
                      const colors = themeOpt.colors[resolvedTheme] || themeOpt.colors.dark;
                      const isActive = activeThemeId === themeOpt.id;

                      return (
                        <motion.button
                          key={themeOpt.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveThemeId(themeOpt.id)}
                          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                            isActive
                              ? "bg-indigo-50/40 dark:bg-indigo-950/15 border-indigo-500 shadow-md shadow-indigo-500/5"
                              : "bg-white/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Accent Dot Frame */}
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${themeOpt.accent} flex items-center justify-center text-white shadow-sm font-black text-sm uppercase`}>
                              {themeOpt.name.charAt(0)}
                            </div>
                            <div>
                              <span className="block text-sm font-extrabold text-slate-850 dark:text-white">
                                {themeOpt.name}
                              </span>
                              {/* Preview Palette Dots */}
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white/20"
                                  style={{ backgroundColor: colors["--bg-color"] }}
                                  title="Background"
                                />
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white/20"
                                  style={{ backgroundColor: colors["--card-bg-color"] }}
                                  title="Surface"
                                />
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-white/20"
                                  style={{ backgroundColor: colors["--primary-color"] }}
                                  title="Accent"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Active Indicator */}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-indigo-500 border-indigo-500 text-white"
                              : "border-slate-300 dark:border-slate-700 bg-transparent"
                          }`}>
                            {isActive && <FiCheck className="w-3.5 h-3.5 font-bold" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Premium Banner */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 flex flex-col gap-3 shrink-0">
              <div className="p-3 bg-gradient-to-br from-indigo-500/10 to-pink-500/5 rounded-2xl border border-indigo-100/20 dark:border-indigo-900/20 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500 dark:text-indigo-400">
                  <FiPocket className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-normal">
                  Visual selections are saved locally and synced automatically across your workspace browser sessions.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
