"use client";

import { motion } from "framer-motion";

type InlineAIButtonProps = {
  label: string;
  onClick: () => void;
  loading?: boolean;
};

export function InlineAIButton({
  label,
  onClick,
  loading = false,
}: InlineAIButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileTap={{ scale: 0.95 }}
      className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium"
    >
      {loading ? "..." : label}
    </motion.button>
  );
}

