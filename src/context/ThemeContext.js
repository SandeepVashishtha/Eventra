import { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'theme';

const readStoredDarkPreference = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark') {
    return true;
  }
  if (stored === 'light') {
    return false;
  }

  return (
    document.documentElement.classList.contains('dark')
    || document.body.classList.contains('dark')
  );
};

const applyThemeToDocument = (isDarkMode) => {
  const root = document.documentElement;

  if (isDarkMode) {
    root.classList.add('dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  } else {
    root.classList.remove('dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  }

  document.body.classList.remove('dark');
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(readStoredDarkPreference);

  useEffect(() => {
    applyThemeToDocument(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: isDarkMode ? 'dark' : 'light',
        toggleTheme,
        isDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
