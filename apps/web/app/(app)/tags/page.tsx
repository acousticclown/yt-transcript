"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTags, useCreateTag, useDeleteTag } from "../../../lib/hooks";

type Tag = {
  id: string;
  name: string;
  color: string;
  count: number;
};

// Tag card with long-press menu
function TagCard({ 
  tag, 
  onDelete, 
  index 
}: { 
  tag: Tag; 
  onDelete: (id: string) => void;
  index: number;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    longPressTimer.current = setTimeout(() => setShowMenu(true), 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: 0.03 * index }}
      className="group relative"
    >
      <Link
        href={`/notes?tag=${encodeURIComponent(tag.name)}`}
        className="block bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 hover:border-[var(--color-primary)] hover:shadow-md transition-all"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: tag.color || "#F5A623" }}
          />
          <span className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">#{tag.name}</span>
        </div>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {tag.count} {tag.count === 1 ? "note" : "notes"}
        </p>
      </Link>

      {/* Long press menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-0 top-full mt-2 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg z-50 overflow-hidden min-w-[160px]"
            >
              <button
                onClick={() => { onDelete(tag.id); setShowMenu(false); }}
                className="w-full px-4 py-3 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Tag
              </button>
              <button
                onClick={() => setShowMenu(false)}
                className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] border-t border-[var(--color-border)]"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const COLORS = [
  "#F5A623", "#3178C6", "#10B981", "#8B5CF6", 
  "#EF4444", "#06B6D4", "#F59E0B", "#EC4899"
];

export default function TagsPage() {
  // TanStack Query hooks
  const { data: apiTags = [], isLoading } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();

  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(COLORS[0]);
  const [filter, setFilter] = useState("");

  // Transform API tags
  const tags: Tag[] = apiTags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color || COLORS[Math.floor(Math.random() * COLORS.length)],
    count: t.noteCount,
  }));

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTag.mutate(
      { name: newTagName.trim().toLowerCase(), color: newTagColor },
      {
        onSuccess: () => {
          setNewTagName("");
          setShowNewTag(false);
        },
      }
    );
  };

  const handleDeleteTag = (id: string) => {
    deleteTag.mutate(id);
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Tags</h1>
          <button
            onClick={() => setShowNewTag(true)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
          >
            + New Tag
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter tags..."
            className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* New Tag Form */}
        <AnimatePresence>
          {showNewTag && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 overflow-hidden"
            >
              <h3 className="font-medium text-[var(--color-text)] mb-4">Create New Tag</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  autoFocus
                  className="flex-1 px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newTagColor === color ? "ring-2 ring-offset-2 ring-[var(--color-primary)] scale-110" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateTag}
                  disabled={createTag.isPending}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors text-sm disabled:opacity-50"
                >
                  {createTag.isPending ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => setShowNewTag(false)}
                  className="px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTags.map((tag, index) => (
              <TagCard 
                key={tag.id} 
                tag={tag} 
                onDelete={handleDeleteTag} 
                index={index} 
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredTags.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            {filter ? "No tags match your filter" : "No tags yet. Create your first tag!"}
          </div>
        )}
      </motion.div>
    </div>
  );
}
