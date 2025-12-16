"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

type InlineAIButtonProps = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  icon?: string;
};

const actionIcons: Record<string, string> = {
  simplify: "✨",
  expand: "➕",
  example: "💡",
};

export function InlineAIButton({
  label,
  onClick,
  loading = false,
  icon,
}: InlineAIButtonProps) {
  // Auto-detect icon from label
  const detectedIcon =
    icon ||
    Object.keys(actionIcons).find((key) =>
      label.toLowerCase().includes(key)
    );
  const displayIcon = detectedIcon ? actionIcons[detectedIcon] : null;

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.1 }}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-md",
        "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm",
        "border border-gray-300 dark:border-gray-700",
        "shadow-sm hover:shadow-md active:scale-95",
        "hover:bg-white dark:hover:bg-gray-700",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-gray-700 dark:text-gray-300 font-medium",
        "transition-all duration-150",
        "min-h-[44px] sm:min-h-[32px] min-w-[44px] sm:min-w-[32px]" // Mobile: 44px, Desktop: 32px
      )}
      title={label}
    >
      {loading ? (
        <svg
          className="animate-spin h-3 w-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {displayIcon && <span className="text-sm">{displayIcon}</span>}
          <span className="hidden sm:inline">{label.replace(/[✨➕💡]/g, "").trim()}</span>
        </>
      )}
    </motion.button>
  );
}

