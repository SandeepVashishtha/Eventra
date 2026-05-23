import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext(null);

// FIX: Moved pure helper functions outside the component so they are not
// re-created on every render — these don't depend on any component state
const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getInitialTheme = () => localStorage.getItem("theme") || "system";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;

  // Apply theme class to <html> and sync localStorage + meta tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        resolvedTheme === "dark" ? "#0f172a" : "#ffffff"
      );
    }
  }, [theme, resolvedTheme]);

  // Detect system theme changes and re-resolve when no saved preference
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
      // FIX: toggleTheme is now inside useMemo so it's stable across renders
      // and won't cause unnecessary re-renders in consumers that depend on it
      toggleTheme: () =>
        setTheme((current) =>
          current === "dark" || (current === "system" && getSystemTheme() === "dark")
            ? "light"
            : "dark"
        ),
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook with guard
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};