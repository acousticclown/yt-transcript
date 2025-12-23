"use client";

import { motion } from "framer-motion";

export function NoteViewerSkeleton() {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-6 py-10 sm:px-8 sm:py-14"
    >
      {/* Header Skeleton */}
      <header className="mb-10">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-20 bg-[var(--color-bg)] rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-[var(--color-bg)] rounded-full animate-pulse" />
        </div>

        {/* Title */}
        <div className="h-10 bg-[var(--color-bg)] rounded-lg w-3/4 mb-4 animate-pulse" />

        {/* Meta */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-32 bg-[var(--color-bg)] rounded animate-pulse" />
          <div className="h-4 w-20 bg-[var(--color-bg)] rounded animate-pulse" />
        </div>
      </header>

      {/* Content Skeleton */}
      <div className="mb-10 space-y-3">
        <div className="h-4 bg-[var(--color-bg)] rounded w-full animate-pulse" />
        <div className="h-4 bg-[var(--color-bg)] rounded w-full animate-pulse" />
        <div className="h-4 bg-[var(--color-bg)] rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-[var(--color-bg)] rounded w-full animate-pulse" />
        <div className="h-4 bg-[var(--color-bg)] rounded w-4/5 animate-pulse" />
      </div>

      {/* Sections Skeleton */}
      <div className="space-y-10">
        {[1, 2, 3].map((index) => (
          <motion.section
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Section number */}
            <div className="absolute -left-4 sm:-left-8 top-0 w-6 h-6 rounded-full bg-[var(--color-bg)] animate-pulse" />

            {/* Section title */}
            <div className="h-7 bg-[var(--color-bg)] rounded-lg w-1/2 mb-4 pl-4 sm:pl-0 animate-pulse" />

            {/* Summary */}
            <div className="mb-5 pl-4 sm:pl-0 space-y-2">
              <div className="h-4 bg-[var(--color-bg)] rounded w-full animate-pulse" />
              <div className="h-4 bg-[var(--color-bg)] rounded w-full animate-pulse" />
              <div className="h-4 bg-[var(--color-bg)] rounded w-3/4 animate-pulse" />
            </div>

            {/* Bullets */}
            <ul className="space-y-3 pl-4 sm:pl-0">
              {[1, 2, 3].map((bulletIndex) => (
                <li key={bulletIndex} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-bg)] mt-2.5 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 h-4 bg-[var(--color-bg)] rounded animate-pulse" />
                </li>
              ))}
            </ul>
          </motion.section>
        ))}
      </div>
    </motion.article>
  );
}

