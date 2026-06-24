"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextValue = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  isDarkMode: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to dark (matches the app's original palette). Synced from storage on mount.
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") setIsDarkMode(false);
    else if (stored === "dark") setIsDarkMode(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
