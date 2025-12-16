"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NoteEditorPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/notes"
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
        >
          ←
        </Link>
        <div className="flex-1" />
        <button className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          ✨ AI Assist
        </button>
        <button className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors">
          Save
        </button>
      </div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
      >
        {/* Title */}
        <input
          type="text"
          placeholder="Untitled Note"
          defaultValue="React Best Practices"
          className="w-full text-2xl font-bold text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]"
        />

        {/* Tags */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)]">
            #react
          </span>
          <span className="text-xs px-2 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)]">
            #development
          </span>
          <button className="text-xs px-2 py-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors">
            + Add tag
          </button>
        </div>

        {/* Content */}
        <textarea
          placeholder="Start writing..."
          defaultValue="Key patterns for building scalable React applications:

1. Component Composition
   - Break down UI into small, reusable components
   - Use composition over inheritance

2. State Management
   - Keep state as local as possible
   - Lift state up only when necessary

3. Performance Optimization
   - Use React.memo for expensive renders
   - Implement proper key props for lists"
          className="w-full mt-6 min-h-[400px] text-[var(--color-text)] bg-transparent border-none focus:outline-none resize-none placeholder:text-[var(--color-text-subtle)] leading-relaxed"
        />
      </motion.div>
    </div>
  );
}

