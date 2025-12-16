"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export type Note = {
  id: string;
  title: string;
  preview: string;
  color: string;
  tags: string[];
  date: string;
  isFavorite?: boolean;
};

type NoteCardProps = {
  note: Note;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
};

export function NoteCard({ note, onDelete, onToggleFavorite }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/notes/${note.id}`}
        className="block p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:shadow-lg transition-all group relative"
      >
        {/* Favorite button - always visible */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(note.id);
            }}
            className={cn(
              "absolute top-4 right-4 p-1.5 rounded-lg transition-colors",
              note.isFavorite
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-subtle)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)]"
            )}
          >
            {note.isFavorite ? "★" : "☆"}
          </button>
        )}

        <div className="flex items-start gap-3">
          <div
            className="w-1.5 h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: note.color }}
          />
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors truncate">
              {note.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
              {note.preview}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {note.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/notes?tag=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs px-2 py-0.5 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
          <span className="text-xs text-[var(--color-text-subtle)] flex-shrink-0">
            {note.date}
          </span>
        </div>

        {/* Delete button - always visible */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(note.id);
            }}
            className="absolute bottom-4 right-4 p-1.5 text-[var(--color-text-subtle)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs"
          >
            🗑️
          </button>
        )}
      </Link>
    </motion.div>
  );
}

