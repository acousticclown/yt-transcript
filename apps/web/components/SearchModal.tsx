"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useNotes } from "../lib/hooks";

type SearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data: notes = [] } = useNotes();

  // Filter notes based on query
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return notes
      .filter(
        (note) =>
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.tags.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, notes]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        router.push(`/notes/${results[selectedIndex].id}`);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, router, onClose]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelect = (noteId: string) => {
    router.push(`/notes/${noteId}`);
    onClose();
  };

  // Highlight matching text
  const highlight = (text: string, maxLen = 100) => {
    if (!query.trim()) return text.slice(0, maxLen);
    const q = query.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text.slice(0, maxLen);

    const start = Math.max(0, idx - 20);
    const end = Math.min(text.length, idx + query.length + 60);
    const snippet = text.slice(start, end);

    return snippet.split(new RegExp(`(${query})`, "gi")).map((part, i) =>
      part.toLowerCase() === q ? (
        <mark key={i} className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
                <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none text-base"
                />
                <kbd className="text-xs text-[var(--color-text-subtle)] bg-[var(--color-bg)] px-2 py-1 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {query.trim() && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                    No notes found for "{query}"
                  </div>
                )}

                {results.map((note, index) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelect(note.id)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-[var(--color-primary)]/10"
                        : "hover:bg-[var(--color-bg)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--color-text)] truncate">
                          {highlight(note.title)}
                        </p>
                        {note.content && (
                          <p className="text-sm text-[var(--color-text-muted)] truncate mt-0.5">
                            {highlight(note.content, 80)}
                          </p>
                        )}
                        {note.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {note.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-1.5 py-0.5 bg-[var(--color-bg)] rounded text-[var(--color-text-muted)]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {index === selectedIndex && (
                        <kbd className="text-xs text-[var(--color-text-subtle)] bg-[var(--color-bg)] px-2 py-1 rounded">
                          ↵
                        </kbd>
                      )}
                    </div>
                  </button>
                ))}

                {!query.trim() && (
                  <div className="px-4 py-6 text-center text-[var(--color-text-muted)] text-sm">
                    Start typing to search your notes
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[var(--color-border)] flex items-center gap-4 text-xs text-[var(--color-text-subtle)]">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[var(--color-bg)] rounded">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[var(--color-bg)] rounded">↵</kbd> Open
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[var(--color-bg)] rounded">ESC</kbd> Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

