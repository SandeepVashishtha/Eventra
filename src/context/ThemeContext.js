import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MotionConfig } from "framer-motion";
import { THEMES } from "../components/styles/theme";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { safeJsonParse } from "../utils/safeJsonParse";
import { safeGetItem, safeSetItem, safeRemoveItem } from "../utils/safeStorage.js";


export const ThemeContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const getInitialTheme = () =>
  safeGetItem("theme") || "system";

export const ThemeProvider = ({ children }) => {
  const [theme] = useState("light");

  // States to preserve existing codebase drawer flow without breaking
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return safeGetItem("activeThemeId") || "default";
  });
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Custom HSL state
  const [customHsl, setCustomHsl] = useState(() => {
    const saved = safeGetItem("customHsl");

    return safeJsonParse(
      saved,
      {
        h: 220,
        s: 90,
        l: 56,
        active: false,
      },
    );
  });

  // Reduced motion state
  const prefersReduced = useReducedMotion();
  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = safeGetItem("reducedMotion");
    return saved !== null ? saved === "true" : prefersReduced;
  });

  const resolvedTheme = "light";
  const setTheme = useCallback(() => {}, []);
  const toggleTheme = useCallback(() => {}, []);

  // Apply themes, custom HSL variable overrides, and sync storage
  useEffect(() => {
    if (!activeThemeId) return;

    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    if (theme === "system") {
      safeRemoveItem("theme");
    } else {
      safeSetItem("theme", theme);
    }
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
    localStorage.removeItem("theme");

    // Apply active skin theme colors
    const activeTheme = THEMES[activeThemeId] || THEMES.default;
    const themeColors = activeTheme.colors.light || activeTheme.colors.dark;
    if (themeColors) {
      Object.entries(themeColors).forEach(([variable, val]) => {
        root.style.setProperty(variable, val);
      });
    }

    // Apply HSL customization overrides if active
    if (customHsl && customHsl.active) {
      const pColor = `hsl(${customHsl.h}, ${customHsl.s}%, ${customHsl.l}%)`;
      root.style.setProperty("--primary-color", pColor);
      root.style.setProperty("--primary-hover", `hsl(${customHsl.h}, ${customHsl.s}%, ${customHsl.l - 8}%)`);
    } else {
      root.style.removeProperty("--primary-color");
      root.style.removeProperty("--primary-hover");
    }

    safeSetItem("activeThemeId", activeThemeId);
    safeSetItem("customHsl", JSON.stringify(customHsl));

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        customHsl && customHsl.active
          ? `hsl(${customHsl.h}, ${customHsl.s}%, ${customHsl.l}%)`
          : "#ffffff"
      );
    }
  }, [activeThemeId, customHsl]);

  // Sync OS-level reduced motion preference changes
  useEffect(() => {
    const saved = safeGetItem("reducedMotion");
    if (saved === null) {
      setReducedMotion(prefersReduced);
    }
  }, [prefersReduced]);

  // Handle global CSS override for transitions and animations
  useEffect(() => {
    safeSetItem("reducedMotion", reducedMotion);

    const styleId = "reduced-motion-override";
    let styleEl = document.getElementById(styleId);

    if (reducedMotion) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = `
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        `;
        document.head.appendChild(styleEl);
      }
    } else {
      if (styleEl) styleEl.remove();
    }
  }, [reducedMotion]);

  // Detect system dark theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (!safeGetItem("theme")) {
        setTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDarkMode: false,
      setTheme,
      isCustomizerOpen,
      setIsCustomizerOpen,

      toggleTheme,
      activeThemeId,
      setActiveThemeId,
      THEMES,
      customHsl,
      setCustomHsl,
      reducedMotion,
      setReducedMotion,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, activeThemeId, isCustomizerOpen, customHsl, reducedMotion]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};