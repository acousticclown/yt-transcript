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
  tags?: string[];
  selectedTag?: string | null;
  onSelectTag?: (tag: string | null) => void;
};

/**
 * CategoryFilter - Filter sections by category
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  tags = [],
  selectedTag,
  onSelectTag,
}: CategoryFilterProps) {
  const allCategories: CategoryType[] = ["All", ...(categories as CategoryType[])];
  const allTags = Array.from(new Set(tags));

  return (
    <div className="space-y-3">
      {/* Category Filter */}
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

      {/* Tag Filter */}
      {allTags.length > 0 && onSelectTag && (
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={() => onSelectTag(null)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "transition-all",
              selectedTag === null
                ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent"
                : "opacity-70 hover:opacity-100"
            )}
          >
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium",
                selectedTag === null
                  ? "bg-indigo-600 text-white"
                  : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
              )}
            >
              All Tags
            </span>
          </motion.button>
          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <motion.button
                key={tag}
                onClick={() => onSelectTag(tag)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "transition-all",
                  isSelected
                    ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700"
                  )}
                >
                  #{tag}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

