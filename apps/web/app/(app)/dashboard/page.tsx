"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// Mock data for demo
const recentNotes = [
  { id: "1", title: "React Best Practices", preview: "Key patterns for building scalable React apps...", color: "#F5A623", tags: ["react", "development"], date: "2 hours ago" },
  { id: "2", title: "Machine Learning Basics", preview: "Introduction to neural networks and deep learning...", color: "#4A7C59", tags: ["ml", "ai"], date: "Yesterday" },
  { id: "3", title: "Product Design Notes", preview: "User-centered design principles and methodologies...", color: "#6366f1", tags: ["design", "ux"], date: "3 days ago" },
];

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          Good morning! 👋
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          What would you like to capture today?
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        <QuickAction icon="📝" label="New Note" href="/notes/new" />
        <QuickAction icon="🎬" label="From YouTube" href="/youtube" />
        <QuickAction icon="✨" label="AI Generate" href="/notes/new?ai=true" />
        <QuickAction icon="📁" label="Browse All" href="/notes" />
      </motion.div>

      {/* Recent Notes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Recent Notes</h2>
          <Link href="/notes" className="text-sm text-[var(--color-primary)] hover:underline">
            View all
          </Link>
        </div>

        {recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <NoteCard {...note} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </motion.div>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:shadow-md transition-all"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
    </Link>
  );
}

function NoteCard({
  id,
  title,
  preview,
  color,
  tags,
  date,
}: {
  id: string;
  title: string;
  preview: string;
  color: string;
  tags: string[];
  date: string;
}) {
  return (
    <Link
      href={`/notes/${id}`}
      className="block p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:shadow-lg transition-all group"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-1.5 h-12 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
            {title}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
            {preview}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)]"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-[var(--color-text-subtle)]">{date}</span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
      <span className="text-4xl">📝</span>
      <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">No notes yet</h3>
      <p className="mt-2 text-[var(--color-text-muted)]">
        Create your first note or import from YouTube
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/notes/new"
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Create Note
        </Link>
        <Link
          href="/youtube"
          className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] rounded-xl font-medium border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
        >
          Import from YouTube
        </Link>
      </div>
    </div>
  );
}

