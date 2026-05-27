import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MotionConfig } from "framer-motion";
import { THEMES } from "../components/styles/theme";
import { useReducedMotion } from "../hooks/useReducedMotion";

export const ThemeContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const getInitialTheme = () =>
  localStorage.getItem("theme") || "system";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // States to preserve existing codebase drawer flow without breaking
  const [activeThemeId, setActiveThemeId] = useState(() => {
    return localStorage.getItem("activeThemeId") || "default";
  });
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Custom HSL state
  const [customHsl, setCustomHsl] = useState(() => {
    const saved = localStorage.getItem("customHsl");
    return saved ? JSON.parse(saved) : { h: 220, s: 90, l: 56, active: false };
  });

  // Reduced motion state
  const prefersReduced = useReducedMotion();
  const [reducedMotion, setReducedMotion] = useState(() => {
    const saved = localStorage.getItem("reducedMotion");
    return saved !== null ? saved === "true" : prefersReduced;
  });

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  // Apply themes, custom HSL variable overrides, and sync storage
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }

    // Apply active skin theme colors
    const activeTheme = THEMES[activeThemeId] || THEMES.default;
    const themeColors = activeTheme.colors[resolvedTheme] || activeTheme.colors.dark;
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

    localStorage.setItem("activeThemeId", activeThemeId);
    localStorage.setItem("customHsl", JSON.stringify(customHsl));

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        customHsl && customHsl.active
          ? `hsl(${customHsl.h}, ${customHsl.s}%, ${customHsl.l}%)`
          : resolvedTheme === "dark" ? "#0f172a" : "#ffffff"
      );
    }
  }, [theme, resolvedTheme, activeThemeId, customHsl]);

  // Sync OS-level reduced motion preference changes
  useEffect(() => {
    const saved = localStorage.getItem("reducedMotion");
    if (saved === null) {
      setReducedMotion(prefersReduced);
    }
  }, [prefersReduced]);

  // Handle global CSS override for transitions and animations
  useEffect(() => {
    localStorage.setItem("reducedMotion", reducedMotion);

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
      if (!localStorage.getItem("theme")) {
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
      isDarkMode: resolvedTheme === "dark",
      setTheme,
      toggleTheme: () =>
        setTheme((current) =>
          current === "dark" || (current === "system" && getSystemTheme() === "dark") ? "light" : "dark"
        ),
      activeThemeId,
      setActiveThemeId,
      THEMES,
      isCustomizerOpen,
      setIsCustomizerOpen,
      customHsl,
      setCustomHsl,
      reducedMotion,
      setReducedMotion,
    }),
    [theme, resolvedTheme, activeThemeId, isCustomizerOpen, customHsl, reducedMotion]
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