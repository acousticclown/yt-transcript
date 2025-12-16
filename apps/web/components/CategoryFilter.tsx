"use client";

import { motion } from "framer-motion";
import { CategoryBadge } from "./CategoryBadge";
import { cn } from "../lib/utils";

type CategoryType =
  | "Tutorial"
  | "Interview"
  | "Lecture"
  | "Review"
  | "Documentary"
  | "Podcast"
  | "News"
  | "Entertainment"
  | "Technical"
  | "Business"
  | "Other"
  | "All";

type CategoryFilterProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

/**
 * CategoryFilter - Filter sections by category
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  const allCategories: CategoryType[] = ["All", ...(categories as CategoryType[])];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => {
        const isSelected = category === "All"
          ? selectedCategory === null
          : selectedCategory === category;

        return (
          <motion.button
            key={category}
            onClick={() => onSelectCategory(category === "All" ? null : category)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "transition-all",
              isSelected
                ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent"
                : "opacity-70 hover:opacity-100"
            )}
          >
            {category === "All" ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium",
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
                )}
              >
                All Categories
              </span>
            ) : (
              <CategoryBadge type={category} size="md" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

