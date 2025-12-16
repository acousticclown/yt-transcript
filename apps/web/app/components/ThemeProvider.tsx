"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type GlassStyle = "default" | "matte" | "glossy";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  glassStyle: GlassStyle;
  setGlassStyle: (style: GlassStyle) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [glassStyle, setGlassStyleState] = useState<GlassStyle>("default");

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setThemeState(stored);
    }
    
    // Load glass style from localStorage
    const storedGlassStyle = localStorage.getItem("glassStyle") as GlassStyle | null;
    if (storedGlassStyle && ["default", "matte", "glossy"].includes(storedGlassStyle)) {
      setGlassStyleState(storedGlassStyle);
    }
  }, []);

  useEffect(() => {
    // Determine resolved theme
    const root = window.document.documentElement;
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setResolvedTheme(systemTheme);
      root.classList.remove("light", "dark");
      root.style.colorScheme = systemTheme;
    } else {
      setResolvedTheme(theme);
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      root.style.colorScheme = theme;
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
      document.documentElement.style.colorScheme = e.matches ? "dark" : "light";
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setGlassStyle = (style: GlassStyle) => {
    setGlassStyleState(style);
    localStorage.setItem("glassStyle", style);
    
    // Apply glass style class to root
    const root = document.documentElement;
    root.classList.remove("glass-default", "glass-matte", "glass-glossy");
    if (style !== "default") {
      root.classList.add(`glass-${style}`);
    }
  };

  // Apply glass style on mount and change
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("glass-default", "glass-matte", "glass-glossy");
    if (glassStyle !== "default") {
      root.classList.add(`glass-${glassStyle}`);
    }
  }, [glassStyle]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, glassStyle, setGlassStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

