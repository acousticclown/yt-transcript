"use client";

import { AnimatePresence } from "framer-motion";
import { NoteCard, Note } from "./NoteCard";

type NoteListProps = {
  notes: Note[];
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  emptyMessage?: string;
};

export function NoteList({
  notes,
  onDelete,
  onToggleFavorite,
  emptyMessage = "No notes yet",
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
        <span className="text-4xl">📝</span>
        <p className="mt-4 text-[var(--color-text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

