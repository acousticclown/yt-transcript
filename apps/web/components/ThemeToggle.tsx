"use client";

import { useTheme } from "../app/components/ThemeProvider";
import { motion } from "framer-motion";

/**
 * ThemeToggle - Compact toggle between light/dark/system themes
 * Mobile-optimized with icon-only on small screens
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="glass rounded-lg p-1 inline-flex gap-1">
      <motion.button
        onClick={() => setTheme("light")}
        className={`px-2.5 py-1.5 text-xs rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
          theme === "light"
            ? "bg-indigo-600 text-white"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
        whileTap={{ scale: 0.95 }}
        title="Light mode"
      >
        <span className="sm:hidden">☀️</span>
        <span className="hidden sm:inline">Light</span>
      </motion.button>
      <motion.button
        onClick={() => setTheme("dark")}
        className={`px-2.5 py-1.5 text-xs rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
          theme === "dark"
            ? "bg-indigo-600 text-white"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
        whileTap={{ scale: 0.95 }}
        title="Dark mode"
      >
        <span className="sm:hidden">🌙</span>
        <span className="hidden sm:inline">Dark</span>
      </motion.button>
      <motion.button
        onClick={() => setTheme("system")}
        className={`px-2.5 py-1.5 text-xs rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${
          theme === "system"
            ? "bg-indigo-600 text-white"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
        whileTap={{ scale: 0.95 }}
        title="System preference"
      >
        <span className="sm:hidden">💻</span>
        <span className="hidden sm:inline">System</span>
      </motion.button>
    </div>
  );
}
