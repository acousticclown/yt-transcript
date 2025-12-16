"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    // Mock save - would create note via API
    const id = crypto.randomUUID();
    router.push(`/notes/${id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/notes"
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
        >
          ←
        </Link>
        <div className="flex-1" />
        <button className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          ✨ AI Assist
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Save
        </button>
      </div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6"
      >
        {/* Title */}
        <input
          type="text"
          placeholder="Untitled Note"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]"
        />

        {/* Tags */}
        <div className="mt-4 flex items-center gap-2">
          <button className="text-xs px-2 py-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors">
            + Add tag
          </button>
        </div>

        {/* Content */}
        <textarea
          placeholder="Start writing..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mt-6 min-h-[400px] text-[var(--color-text)] bg-transparent border-none focus:outline-none resize-none placeholder:text-[var(--color-text-subtle)] leading-relaxed"
        />
      </motion.div>
    </div>
  );
}

