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
  | "Other";

type CategoryBadgeProps = {
  type: CategoryType | string;
  className?: string;
  size?: "sm" | "md";
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  Tutorial: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
  },
  Interview: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
  },
  Lecture: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
  },
  Review: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  Documentary: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  Podcast: {
    bg: "bg-pink-100 dark:bg-pink-900/30",
    text: "text-pink-700 dark:text-pink-300",
  },
  News: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
  },
  Entertainment: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
  },
  Technical: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  Business: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  Other: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
  },
};

/**
 * CategoryBadge - Display category type with color coding
 */
export function CategoryBadge({
  type,
  className,
  size = "md",
}: CategoryBadgeProps) {
  const colors = categoryColors[type] || categoryColors.Other;
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        colors.bg,
        colors.text,
        sizeClasses[size],
        className
      )}
    >
      {type}
    </span>
  );
}

