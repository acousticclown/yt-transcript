"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

type BetaBadgeProps = {
  className?: string;
  size?: "sm" | "md";
};

export function BetaBadge({ className, size = "md" }: BetaBadgeProps) {
  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("relative inline-flex items-center", className)}
      title="v2 beta"
    >
      {/* Badge container with gradient background */}
      <div
        className={cn(
          "relative overflow-hidden rounded-full font-semibold",
          "bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500",
          "text-white shadow-lg shadow-violet-500/30",
          "border border-violet-400/50",
          sizes[size],
          "group cursor-default"
        )}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        {/* Text */}
        <span className="relative z-10 font-medium tracking-wide">Beta</span>
        
        {/* Hover tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
          v2 beta
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
        </div>
      </div>
    </motion.div>
  );
}

