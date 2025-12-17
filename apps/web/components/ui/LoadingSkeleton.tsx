"use client";

import { motion } from "framer-motion";

export function NoteCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]"
    >
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-12 rounded-full bg-[var(--color-bg)] flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-[var(--color-bg)] rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-[var(--color-bg)] rounded w-full animate-pulse" />
          <div className="h-3 bg-[var(--color-bg)] rounded w-5/6 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="h-6 w-16 bg-[var(--color-bg)] rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-[var(--color-bg)] rounded-full animate-pulse" />
        </div>
        <div className="h-4 w-20 bg-[var(--color-bg)] rounded animate-pulse" />
      </div>
    </motion.div>
  );
}

export function NoteListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  );
}

