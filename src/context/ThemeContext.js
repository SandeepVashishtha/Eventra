import { createContext, useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return savedTheme || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const syncTheme = () => {
      const currentTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (currentTheme && currentTheme !== theme) {
        setTheme(currentTheme);
      }
    };

    const intervalId = setInterval(syncTheme, 500);
    return () => clearInterval(intervalId);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};