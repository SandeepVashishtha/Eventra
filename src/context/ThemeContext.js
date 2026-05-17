<<<<<<< HEAD
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
=======
import { createContext, useContext,useEffect,useState} from 'react';
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a

export const ThemeContext = createContext({
  isDarkMode: false,
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
<<<<<<< HEAD
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
=======

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
   const body = document.body; 
    if (isDarkMode) {
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme: isDarkMode ? 'dark' : 'light', toggleTheme, isDarkMode }}>
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
      {children}
    </ThemeContext.Provider>
  );
};
<<<<<<< HEAD

export const useTheme = () => useContext(ThemeContext);
=======
export const useTheme = () => useContext(ThemeContext);
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
