"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { NoteList, Note } from "../../../components/notes";

// Mock data
const initialNotes: Note[] = [
  { id: "1", title: "React Best Practices", preview: "Key patterns for building scalable React apps...", color: "#F5A623", tags: ["react", "development"], date: "2 hours ago", isFavorite: true },
  { id: "2", title: "Machine Learning Basics", preview: "Introduction to neural networks and deep learning...", color: "#4A7C59", tags: ["ml", "ai"], date: "Yesterday" },
  { id: "3", title: "Product Design Notes", preview: "User-centered design principles and methodologies...", color: "#6366f1", tags: ["design", "ux"], date: "3 days ago" },
  { id: "4", title: "TypeScript Tips", preview: "Advanced TypeScript patterns and best practices...", color: "#F5A623", tags: ["typescript"], date: "1 week ago" },
];

type SortOption = "recent" | "title" | "favorites";
type FilterOption = "all" | "favorites";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)));
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [notes]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.preview.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Favorites filter
    if (filter === "favorites") {
      result = result.filter((n) => n.isFavorite);
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter((n) => n.tags.includes(selectedTag));
    }

    // Sort
    if (sort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "favorites") {
      result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }

    return result;
  }, [notes, search, sort, filter, selectedTag]);

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

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 space-y-4"
      >
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-[var(--color-surface)] rounded-lg p-1 border border-[var(--color-border)]">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === "all"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("favorites")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === "favorites"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              ★ Favorites
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 cursor-pointer"
            >
              <option value="recent">Recent</option>
              <option value="title">Title A-Z</option>
              <option value="favorites">Favorites first</option>
            </select>
            <svg
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Tag filter */}
          {allTags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    selectedTag === tag
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Notes Grid */}
      <NoteList
        notes={filteredNotes}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        emptyMessage={search || selectedTag ? "No notes match your filters" : "No notes yet. Create your first note!"}
      />
    </div>
  );
}

