"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { NoteList, Note } from "../../../components/notes";

// Mock data for demo
const initialNotes: Note[] = [
  { id: "1", title: "React Best Practices", preview: "Key patterns for building scalable React apps...", color: "#F5A623", tags: ["react", "development"], date: "2 hours ago", isFavorite: true },
  { id: "2", title: "Machine Learning Basics", preview: "Introduction to neural networks and deep learning...", color: "#4A7C59", tags: ["ml", "ai"], date: "Yesterday" },
  { id: "3", title: "Product Design Notes", preview: "User-centered design principles and methodologies...", color: "#6366f1", tags: ["design", "ux"], date: "3 days ago" },
];

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          {getGreeting()}! 👋
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

        {notes.length > 0 ? (
          <NoteList
            notes={notes}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
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

