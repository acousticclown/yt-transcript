"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { themes, getTheme, applyTheme, type ThemeId, type ThemeMode } from "../../lib/themes";

type ThemeContextType = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  resolvedMode: ThemeMode;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("morning-mist");
  const [resolvedMode, setResolvedMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("notely-theme") as ThemeId | null;
    if (saved && (saved === "auto" || themes[saved])) {
      setThemeIdState(saved);
    }
    setMounted(true);
  }, []);

  // Get system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setResolvedMode(mediaQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setResolvedMode(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Apply theme whenever themeId or system mode changes
  useEffect(() => {
    if (!mounted) return;
    
    const theme = getTheme(themeId, resolvedMode);
    applyTheme(theme);
  }, [themeId, resolvedMode, mounted]);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    localStorage.setItem("notely-theme", id);
  };

  // Prevent flash by not rendering until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return safe defaults for SSR/static generation
    return {
      themeId: "morning-mist" as ThemeId,
      setThemeId: () => {},
      resolvedMode: "light" as ThemeMode,
    };
  }
  return context;
}
