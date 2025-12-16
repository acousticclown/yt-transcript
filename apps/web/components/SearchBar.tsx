"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * SearchBar - Search input with clear button
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search sections...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 pl-10 pr-10 text-base text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 dark:text-gray-500">🔍</span>
        </div>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <span className="text-lg">✕</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

