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
      className="text-xs bg-white border border-gray-300 rounded px-2 py-1 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
    >
      {loading ? "..." : label}
    </motion.button>
  );
}

