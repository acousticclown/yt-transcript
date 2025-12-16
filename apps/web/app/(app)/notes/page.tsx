"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// Mock data
const notes = [
  { id: "1", title: "React Best Practices", preview: "Key patterns for building scalable React apps...", color: "#F5A623", tags: ["react", "development"], date: "2 hours ago" },
  { id: "2", title: "Machine Learning Basics", preview: "Introduction to neural networks and deep learning...", color: "#4A7C59", tags: ["ml", "ai"], date: "Yesterday" },
  { id: "3", title: "Product Design Notes", preview: "User-centered design principles and methodologies...", color: "#6366f1", tags: ["design", "ux"], date: "3 days ago" },
  { id: "4", title: "TypeScript Tips", preview: "Advanced TypeScript patterns and best practices...", color: "#F5A623", tags: ["typescript"], date: "1 week ago" },
];

export default function NotesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Notes</h1>
        <Link
          href="/notes/new"
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span className="hidden sm:inline">New Note</span>
        </Link>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
          >
            <Link
              href={`/notes/${note.id}`}
              className="block p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-1.5 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: note.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                    {note.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                    {note.preview}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-[var(--color-text-subtle)]">{note.date}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

