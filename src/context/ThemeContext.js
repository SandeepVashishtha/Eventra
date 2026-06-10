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
const THEME_STORAGE_KEY = "eventra_theme";

export const ThemeContext = createContext(null);

const safeStorage = {
  getItem(key, fallback = null) {
    try {
      if (typeof window === "undefined" || !window.localStorage) return fallback;
      return window.localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  setItem(key, value) {
    try {
      window.localStorage?.setItem(key, value);
    } catch {
      // Storage can be blocked in private browsing or embedded contexts.
    }
  },
  removeItem(key) {
    try {
      window.localStorage?.removeItem(key);
    } catch {
      // Non-fatal: theme state still updates in memory.
    }
  },
};

const getSystemTheme = () =>
  typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const getInitialTheme = () => {
  const stored = safeStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
};

// ✅ FIXED: Yahan se duplicate line hata di gayi hai
export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getInitialTheme());

  // States to preserve existing codebase drawer flow without breaking
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return safeStorage.getItem("activeThemeId", "default");
  });
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Custom HSL state
  const [customHsl, setCustomHsl] = useState(() => {
    const saved = safeStorage.getItem("customHsl");

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
    const saved = safeStorage.getItem("reducedMotion");
    return saved !== null ? saved === "true" : prefersReduced;
  });

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  const isDarkMode = resolvedTheme === "dark";
  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
  }, []);
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const resolved = prev === "system" ? getSystemTheme() : prev;
      return resolved === "dark" ? "light" : "dark";
    });
  }, []);

  // Apply themes, custom HSL variable overrides, and sync storage
  useEffect(() => {
    if (!activeThemeId) return;

    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    if (theme === "system") {
      safeStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      safeStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    // Apply active skin theme colors — pick the variant that matches the resolved mode
    const activeTheme = THEMES[activeThemeId] || THEMES.default;
    const themeColors =
      resolvedTheme === "dark"
        ? (activeTheme.colors.dark || activeTheme.colors.light)
        : (activeTheme.colors.light || activeTheme.colors.dark);
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

    safeStorage.setItem("activeThemeId", activeThemeId);
    safeStorage.setItem("customHsl", JSON.stringify(customHsl));

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      let themeColor = "#ffffff";
      if (customHsl && customHsl.active) {
        themeColor = `hsl(${customHsl.h}, ${customHsl.s}%, ${customHsl.l}%)`;
      } else {
        const isDark = document.documentElement.classList.contains("dark") || 
                       window.matchMedia("(prefers-color-scheme: dark)").matches;
        themeColor = isDark ? "#090e1a" : "#ffffff";
      }
      metaTheme.setAttribute("content", themeColor);
    }
  }, [activeThemeId, customHsl, theme, resolvedTheme]);

  // Sync OS-level reduced motion preference changes
  useEffect(() => {
    const saved = safeStorage.getItem("reducedMotion");
    if (saved === null) {
      setReducedMotion(prefersReduced);
    }
  }, [prefersReduced]);

  // Handle global CSS override for transitions and animations
  useEffect(() => {
    safeStorage.setItem("reducedMotion", reducedMotion);

    const styleId = "reduced-motion-override";
    const css = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;

    // Clean up any previously injected styles (from either method)
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();
    if (typeof CSSStyleSheet !== "undefined") {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (s) => !s._rm
      );
    }

    if (reducedMotion) {
      if (typeof CSSStyleSheet !== "undefined") {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        sheet._rm = true;
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
      } else {
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.innerHTML = css;
        document.head.appendChild(styleEl);
      }
    }
  }, [reducedMotion]);

  // Detect system dark theme preference changes
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (!safeStorage.getItem(THEME_STORAGE_KEY)) {
        setTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDarkMode,
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
    [
      theme,
      resolvedTheme,
      isDarkMode,
      setTheme,
      toggleTheme,
      activeThemeId,
      isCustomizerOpen,
      customHsl,
      reducedMotion,
    ]
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