"use client";

import { motion } from "framer-motion";

const mockTags = [
  { name: "react", color: "#F5A623", count: 5 },
  { name: "typescript", color: "#3178C6", count: 3 },
  { name: "ai", color: "#10B981", count: 4 },
  { name: "design", color: "#8B5CF6", count: 2 },
  { name: "development", color: "#EF4444", count: 6 },
  { name: "ml", color: "#06B6D4", count: 2 },
];

export default function TagsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Tags</h1>
          <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors text-sm">
            + New Tag
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTags.map((tag, index) => (
            <motion.div
              key={tag.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-medium text-[var(--color-text)]">#{tag.name}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {tag.count} {tag.count === 1 ? "note" : "notes"}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

