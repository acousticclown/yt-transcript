"use client";

import { useTheme } from "../app/components/ThemeProvider";
import { motion } from "framer-motion";

/**
 * ThemeToggle - Toggle between light/dark/system themes
 * Also includes glass style toggle (matte/glossy/default)
 */
export function ThemeToggle() {
  const { theme, setTheme, glassStyle, setGlassStyle } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {/* Theme Toggle */}
      <div className="glass rounded-lg p-1 flex gap-1">
        <motion.button
          onClick={() => setTheme("light")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            theme === "light"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          Light
        </motion.button>
        <motion.button
          onClick={() => setTheme("dark")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            theme === "dark"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          Dark
        </motion.button>
        <motion.button
          onClick={() => setTheme("system")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            theme === "system"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          System
        </motion.button>
      </div>

      {/* Glass Style Toggle */}
      <div className="glass rounded-lg p-1 flex gap-1">
        <motion.button
          onClick={() => setGlassStyle("default")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            glassStyle === "default"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          Default
        </motion.button>
        <motion.button
          onClick={() => setGlassStyle("matte")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            glassStyle === "matte"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          Matte
        </motion.button>
        <motion.button
          onClick={() => setGlassStyle("glossy")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            glassStyle === "glossy"
              ? "bg-indigo-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          Glossy
        </motion.button>
      </div>
    </div>
  );
}

