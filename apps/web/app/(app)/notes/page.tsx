"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { NoteList, Note } from "../../../components/notes";

// Mock data
const initialNotes: Note[] = [
  { id: "1", title: "React Best Practices", preview: "Key patterns for building scalable React apps...", color: "#F5A623", tags: ["react", "development"], date: "2 hours ago", isFavorite: true },
  { id: "2", title: "Machine Learning Basics", preview: "Introduction to neural networks and deep learning...", color: "#4A7C59", tags: ["ml", "ai"], date: "Yesterday" },
  { id: "3", title: "Product Design Notes", preview: "User-centered design principles and methodologies...", color: "#6366f1", tags: ["design", "ux"], date: "3 days ago" },
  { id: "4", title: "TypeScript Tips", preview: "Advanced TypeScript patterns and best practices...", color: "#F5A623", tags: ["typescript"], date: "1 week ago" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Notes</h1>
        <Link
          href="/notes/new"
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors flex items-center gap-2"
        >
          <span>+</span>
          <span className="hidden sm:inline">New Note</span>
        </Link>
      </motion.div>

      {/* Notes Grid */}
      <NoteList
        notes={notes}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        emptyMessage="No notes yet. Create your first note!"
      />
    </div>
  );
}

