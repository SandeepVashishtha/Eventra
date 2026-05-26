import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { THEMES } from "../components/styles/theme";

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Get System Theme
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  // Get Initial Baseline Theme
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "system";
  };

  // Get Initial Premium Theme ID
  const getInitialThemeId = () => {
    const savedThemeId = localStorage.getItem("activeThemeId");
    return savedThemeId && THEMES[savedThemeId] ? savedThemeId : "default";
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [activeThemeId, setActiveThemeId] = useState(getInitialThemeId);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Resolve Actual Baseline (Light/Dark)
  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  // Apply Theme & Inject Dynamic CSS Variables
  useEffect(() => {
    const root = document.documentElement;

    // Apply baseline dark/light classes for utility class triggers
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    // Apply premium active theme styling variables
    const themeConfig = THEMES[activeThemeId] || THEMES.default;
    const activeColors = themeConfig.colors[resolvedTheme] || themeConfig.colors.dark;

    // Clean up any previous 'theme-' modifier classes
    Array.from(root.classList).forEach((cls) => {
      if (cls.startsWith("theme-")) {
        root.classList.remove(cls);
      }
    });

    // Apply new theme class and variables
    if (activeThemeId !== "default") {
      root.classList.add(`theme-${activeThemeId}`);
    }

    Object.entries(activeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Save state to localStorage
    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
    localStorage.setItem("activeThemeId", activeThemeId);

    // Update Browser Theme Color Meta tag
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        activeColors["--bg-color"] || (resolvedTheme === "dark" ? "#0f172a" : "#ffffff")
      );
    }
  }, [theme, resolvedTheme, activeThemeId]);

  // Detect System Theme Changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        setTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Toggle Baseline Theme (for backward compatibility)
  const toggleTheme = useCallback(() => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDarkMode: resolvedTheme === "dark",
      setTheme,
      toggleTheme,
      activeThemeId,
      setActiveThemeId,
      isCustomizerOpen,
      setIsCustomizerOpen,
      THEMES,
    }),
    [theme, resolvedTheme, toggleTheme, activeThemeId, isCustomizerOpen]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};