"use client";

import { motion } from "framer-motion";

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
  const options: Array<{ key: Language; label: string }> = [
    { key: "english", label: "EN" },
    { key: "hindi", label: "HI" },
    { key: "hinglish", label: "Hinglish" },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {options.map((opt) => (
        <motion.button
          key={opt.key}
          onClick={() => !disabled && onChange(opt.key)}
          disabled={disabled}
          className={`text-xs px-2 py-1 rounded-md transition-colors ${
            value === opt.key
              ? "bg-white dark:bg-gray-700 shadow-sm font-medium text-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          transition={{ duration: 0.1 }}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  );
}

