"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
            style={{ backgroundColor: tag.color }}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl overflow-hidden min-w-[140px]"
            >
              <button
                onClick={() => { onDelete(tag.id); setShowMenu(false); }}
                className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
              >
                🗑️ Delete
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

const initialTags: Tag[] = [
  { id: "1", name: "react", color: "#F5A623", count: 5 },
  { id: "2", name: "typescript", color: "#3178C6", count: 3 },
  { id: "3", name: "ai", color: "#10B981", count: 4 },
  { id: "4", name: "design", color: "#8B5CF6", count: 2 },
  { id: "5", name: "development", color: "#EF4444", count: 6 },
  { id: "6", name: "ml", color: "#06B6D4", count: 2 },
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(COLORS[0]);
  const [filter, setFilter] = useState("");

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: newTagName.trim().toLowerCase(),
      color: newTagColor,
      count: 0,
    };
    setTags([...tags, newTag]);
    setNewTagName("");
    setShowNewTag(false);
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );

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
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors text-sm"
                >
                  Create
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

