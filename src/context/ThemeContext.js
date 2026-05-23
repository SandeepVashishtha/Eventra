import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const ThemeContext =
  createContext(null);

export const ThemeProvider = ({
  children,
}) => {
  // Get System Theme
  const getSystemTheme = () =>
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";

  // Get Initial Theme
  const getInitialTheme = () => {
    const savedTheme =
      localStorage.getItem("theme");

    return savedTheme || "system";
  };

  const [theme, setTheme] =
    useState(getInitialTheme);

  // Resolve Actual Theme
  const resolvedTheme =
    theme === "system"
      ? getSystemTheme()
      : theme;

  // Apply Theme
  useEffect(() => {
    const root =
      document.documentElement;

    root.classList.remove(
      "light",
      "dark"
    );

    root.classList.add(
      resolvedTheme
    );

    // Save Theme
    if (theme === "system") {
      localStorage.removeItem(
        "theme"
      );
    } else {
      localStorage.setItem(
        "theme",
        theme
      );
    }

    // Update Browser Theme Color
    const metaTheme =
      document.querySelector(
        'meta[name="theme-color"]'
      );

    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        resolvedTheme === "dark"
          ? "#0f172a"
          : "#ffffff"
      );
    }
  }, [theme, resolvedTheme]);

  // Detect System Theme Changes
  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleChange = () => {
      if (
        !localStorage.getItem(
          "theme"
        )
      ) {
        setTheme("system");
      }
    };

    mediaQuery.addEventListener(
      "change",
      handleChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  // Toggle Theme
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
      isDarkMode:
        resolvedTheme ===
        "dark",
      setTheme,
      toggleTheme,
    }),
    [
      theme,
      resolvedTheme,
      toggleTheme,
    ]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook
export const useTheme = () => {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider"
    );
  }

  return context;
};