"use client";

import { cn } from "../lib/utils";

type SectionType =
  | "Tutorial"
  | "Interview"
  | "Lecture"
  | "Review"
  | "Explanation"
  | "Story"
  | "Discussion"
  | "Other";

type SectionTypeBadgeProps = {
  type: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const typeConfig: Record<SectionType, { icon: string; color: string }> = {
  Tutorial: { icon: "📚", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  Interview: { icon: "🎤", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
  Lecture: { icon: "🎓", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
  Review: { icon: "⭐", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" },
  Explanation: { icon: "💡", color: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" },
  Story: { icon: "📖", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300" },
  Discussion: { icon: "💬", color: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300" },
  Other: { icon: "📄", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" },
};

const sizeClasses = {
  sm: "text-xs px-1.5 py-0.5",
  md: "text-sm px-2 py-1",
  lg: "text-base px-3 py-1.5",
};

/**
 * SectionTypeBadge - Display section type with icon and color
 */
export function SectionTypeBadge({
  type,
  size = "sm",
  className,
}: SectionTypeBadgeProps) {
  const normalizedType = type as SectionType;
  const config = typeConfig[normalizedType] || typeConfig.Other;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{type}</span>
    </span>
  );
}

