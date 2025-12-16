"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      <Link
        href={`/notes/${note.id}`}
        className="block p-5 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:shadow-lg transition-all group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={handleContextMenu}
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
      </Link>

      {/* Long press context menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl overflow-hidden min-w-[160px]"
          >
            {onToggleFavorite && (
              <button
                onClick={() => {
                  onToggleFavorite(note.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text)]"
              >
                <span>{note.isFavorite ? "★" : "☆"}</span>
                {note.isFavorite ? "Unfavorite" : "Favorite"}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(note.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600"
              >
                <span>🗑️</span>
                Delete
              </button>
            )}
            <button
              onClick={() => setShowMenu(false)}
              className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors border-t border-[var(--color-border)]"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Backdrop when menu is open */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowMenu(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

