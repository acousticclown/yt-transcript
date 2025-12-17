"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NoteList } from "../../../components/notes";
import { useNotes, useDeleteNote, useToggleFavorite } from "../../../lib/hooks";
import { Note as ApiNote } from "../../../lib/api";

type SortOption = "recent" | "title" | "favorites";
type FilterOption = "all" | "favorites";

// Transform API note to card format
function toCardNote(note: ApiNote) {
  return {
    id: note.id,
    title: note.title,
    preview: note.content || note.sections[0]?.summary || "No content",
    color: note.color || "#F5A623",
    tags: note.tags,
    date: formatDate(note.updatedAt),
    isFavorite: note.isFavorite,
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function NotesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tagFromUrl = searchParams.get("tag");

  // TanStack Query hooks
  const { data: notes = [], isLoading, error } = useNotes();
  const deleteNote = useDeleteNote();
  const toggleFavorite = useToggleFavorite();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(tagFromUrl);

  // Sync tag from URL
  useEffect(() => {
    setSelectedTag(tagFromUrl);
  }, [tagFromUrl]);

  // Update URL when tag changes
  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    if (tag) {
      router.push(`/notes?tag=${encodeURIComponent(tag)}`);
    } else {
      router.push("/notes");
    }
  };

  const handleDelete = (id: string) => {
    deleteNote.mutate(id);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite.mutate(id);
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
          n.content.toLowerCase().includes(q) ||
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
    } else {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return result;
  }, [notes, search, sort, filter, selectedTag]);

  // Transform to card format
  const cardNotes = filteredNotes.map(toCardNote);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--color-danger)]">Failed to load notes</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

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
                  onClick={() => handleTagSelect(selectedTag === tag ? null : tag)}
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
        notes={cardNotes}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        emptyMessage={search || selectedTag ? "No notes match your filters" : "No notes yet. Create your first note!"}
      />
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NotesPageContent />
    </Suspense>
  );
}
