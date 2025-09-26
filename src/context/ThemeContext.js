// src/context/ThemeContext.js

import React, { createContext, useState, useEffect } from 'react';

// Create the context with a default value
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('eventra-theme');
      return savedTheme || 'light';
    }
    return 'light';
  });

  // Effect to apply the theme class to the body element and save to localStorage
  useEffect(() => {
    const root = document.documentElement; // Get the <html> element
    if (theme === 'dark') {
      root.classList.add('dark'); // Add 'dark' class for Tailwind dark mode
    } else {
      root.classList.remove('dark'); // Remove 'dark' class for light mode
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('eventra-theme', theme);
  }, [theme]);

  // Function to toggle between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    // Provide the theme and toggle function to all child components
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};