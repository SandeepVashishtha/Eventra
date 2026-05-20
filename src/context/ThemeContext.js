import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export const ThemeContext =
  createContext();

export const ThemeProvider = ({
  children,
}) => {
  // Get Initial Theme
  const getInitialTheme = () => {
    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme;
    }

    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] =
    useState(getInitialTheme);

  // Apply Theme
  useEffect(() => {
    const root =
      document.documentElement;

    root.classList.remove(
      "light",
      "dark"
    );

    root.classList.add(theme);

    localStorage.setItem(
      "theme",
      theme
    );
  }, [theme]);

  // Detect System Theme Changes
  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleChange = (e) => {
      const savedTheme =
        localStorage.getItem("theme");

      if (!savedTheme) {
        setTheme(
          e.matches
            ? "dark"
            : "light"
        );
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
  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === "dark"
        ? "light"
        : "dark"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode:
          theme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Hook
export const useTheme = () =>
  useContext(ThemeContext);