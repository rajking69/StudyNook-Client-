"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "studynook-theme";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const ThemeContext = createContext(null);

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
}

function setThemeCookie(theme) {
  document.cookie = `${STORAGE_KEY}=${theme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved === "dark" ? "dark" : "light";
    applyTheme(initial);
    setTheme(initial);
    setThemeCookie(initial);
    setReady(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      setThemeCookie(next);
      applyTheme(next);
      return next;
    });
  }, []);

  const setThemeMode = useCallback((mode) => {
    const next = mode === "dark" ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, next);
    setThemeCookie(next);
    applyTheme(next);
    setTheme(next);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme: setThemeMode, ready }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
