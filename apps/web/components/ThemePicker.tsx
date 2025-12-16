"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { themes, lightThemes, darkThemes, applyTheme, getTheme, type ThemeId, type ThemeMode } from "../lib/themes";

export function ThemePicker() {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("morning-mist");
  const [isOpen, setIsOpen] = useState(false);
  const [systemMode, setSystemMode] = useState<ThemeMode>("light");

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemMode(mediaQuery.matches ? "dark" : "light");
    
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeId | null;
    if (saved && (saved === "auto" || themes[saved])) {
      setCurrentTheme(saved);
    }
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    const theme = getTheme(currentTheme, systemMode);
    applyTheme(theme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme, systemMode]);

  const handleSelect = (id: ThemeId) => {
    setCurrentTheme(id);
    setIsOpen(false);
  };

  const currentThemeData = currentTheme === "auto" 
    ? { name: "Auto", preview: `linear-gradient(135deg, #faf9f7 0%, #1a1a1a 100%)` }
    : themes[currentTheme];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
      >
        <div
          className="w-5 h-5 rounded-full border border-[var(--color-border)]"
          style={{ background: currentThemeData.preview }}
        />
        <span className="text-sm text-[var(--color-text)]">{currentThemeData.name}</span>
        <svg className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xl z-50 overflow-hidden"
            >
              {/* Auto Option */}
              <div className="p-3 border-b border-[var(--color-border)]">
                <button
                  onClick={() => handleSelect("auto")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    currentTheme === "auto" 
                      ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]" 
                      : "hover:bg-[var(--color-bg)]"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #faf9f7 50%, #1a1a1a 50%)" }}
                  />
                  <div className="text-left">
                    <p className="font-medium text-[var(--color-text)]">Auto</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Match system preference</p>
                  </div>
                  {currentTheme === "auto" && (
                    <span className="ml-auto text-[var(--color-primary)]">✓</span>
                  )}
                </button>
              </div>

              {/* Light Themes */}
              <div className="p-3 border-b border-[var(--color-border)]">
                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2 px-1">☀️ Light</p>
                <div className="grid grid-cols-2 gap-2">
                  {lightThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleSelect(theme.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        currentTheme === theme.id
                          ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]"
                          : "hover:bg-[var(--color-bg)] border border-transparent"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-md border border-black/10"
                        style={{ background: theme.preview }}
                      />
                      <span className="text-xs text-[var(--color-text)] truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dark Themes */}
              <div className="p-3">
                <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2 px-1">🌙 Dark</p>
                <div className="grid grid-cols-2 gap-2">
                  {darkThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleSelect(theme.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        currentTheme === theme.id
                          ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]"
                          : "hover:bg-[var(--color-bg)] border border-transparent"
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-md border border-white/10"
                        style={{ background: theme.preview }}
                      />
                      <span className="text-xs text-[var(--color-text)] truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

