"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

type SortOption = "relevance" | "title" | "date";

type SortOptionsProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
};

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
  { value: "relevance", label: "Relevance", icon: "⭐" },
  { value: "title", label: "Title", icon: "🔤" },
  { value: "date", label: "Date", icon: "📅" },
];

/**
 * SortOptions - Sort sections by relevance, title, or date
 */
export function SortOptions({
  value,
  onChange,
  className,
}: SortOptionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        Sort:
      </span>
      <div className="inline-flex gap-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700 rounded-lg p-1">
        {sortOptions.map((option) => {
          const isSelected = value === option.value;
          return (
            <motion.button
              key={option.value}
              onClick={() => onChange(option.value)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "text-xs px-2.5 py-1.5 rounded-md transition-all min-h-[28px] flex items-center gap-1.5",
                isSelected
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white font-medium shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

