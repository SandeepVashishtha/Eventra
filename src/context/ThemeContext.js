import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const ThemeContext =
  createContext(null);

// Helper functions
const getSystemTheme = () =>
  window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";

const getInitialTheme = () =>
  localStorage.getItem("theme") ||
  "system";

export const ThemeProvider = ({
  children,
}) => {
  const [theme, setTheme] =
    useState(getInitialTheme);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  const resolvedTheme =
    theme === "system"
      ? getSystemTheme()
      : theme;

  // Apply theme + sync localStorage
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

  // Detect system theme changes
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

    return () =>
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDarkMode:
        resolvedTheme === "dark",
      setTheme,
      isCustomizerOpen,
      setIsCustomizerOpen,

      toggleTheme: () =>
        setTheme((current) =>
          current === "dark" ||
          (current === "system" &&
            getSystemTheme() ===
              "dark")
            ? "light"
            : "dark"
        ),
    }),
    [theme, resolvedTheme, isCustomizerOpen]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook
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