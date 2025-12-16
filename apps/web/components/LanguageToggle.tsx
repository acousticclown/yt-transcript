"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type Language = "english" | "hindi" | "hinglish";

export function LanguageToggle({
  value,
  onChange,
  disabled = false,
}: {
  value: Language;
  onChange: (lang: Language) => void;
  disabled?: boolean;
}) {
  const options: Array<{ key: Language; label: string; icon: string }> = [
    { key: "english", label: "EN", icon: "🇬🇧" },
    { key: "hindi", label: "HI", icon: "🇮🇳" },
    { key: "hinglish", label: "Hinglish", icon: "🌐" },
  ];

  return (
    <div className="inline-flex gap-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg p-1 shadow-sm">
      {options.map((opt) => {
        const isSelected = value === opt.key;
        return (
          <motion.button
            key={opt.key}
            onClick={() => !disabled && onChange(opt.key)}
            disabled={disabled}
            className={cn(
              "relative text-xs px-3 py-1.5 rounded-md transition-all min-h-[32px] min-w-[32px] flex items-center justify-center gap-1",
              isSelected
                ? "bg-indigo-600 dark:bg-indigo-500 text-white font-semibold shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            whileHover={!disabled && !isSelected ? { scale: 1.05 } : {}}
            transition={{ duration: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {isSelected && (
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm"
                >
                  {opt.icon}
                </motion.span>
              )}
            </AnimatePresence>
            <span className={cn(isSelected && "hidden sm:inline")}>
              {opt.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

