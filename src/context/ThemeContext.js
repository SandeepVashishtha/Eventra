import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const ThemeContext = createContext({
  isDarkMode: false,
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  const theme = isDarkMode ? "dark" : "light";

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.toggle("dark", isDarkMode);
    body.classList.toggle("dark", isDarkMode);
    root.style.colorScheme = theme;
    localStorage.setItem("theme", theme);
  }, [isDarkMode, theme]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const setTheme = useCallback((nextTheme) => {
    setIsDarkMode(nextTheme === "dark");
  }, []);

  const value = useMemo(
    () => ({ isDarkMode, theme, toggleTheme, setTheme }),
    [isDarkMode, theme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
