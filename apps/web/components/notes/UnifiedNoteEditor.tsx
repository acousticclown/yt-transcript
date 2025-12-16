"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// Types
type LanguageVariant = {
  title: string;
  summary: string;
  bullets: string[];
};

type NoteSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  language: "english" | "hindi" | "hinglish";
  variants?: {
    english?: LanguageVariant;
    hindi?: LanguageVariant;
    hinglish?: LanguageVariant;
  };
  collapsed?: boolean;
};

type UnifiedNote = {
  id?: string;
  title: string;
  tags: string[];
  language: "english" | "hindi" | "hinglish";
  sections: NoteSection[];
  source?: "manual" | "youtube";
  youtubeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type UnifiedNoteEditorProps = {
  initialNote?: Partial<UnifiedNote>;
  onSave?: (note: UnifiedNote) => void;
  onAIAction?: (action: string, text: string, sectionId?: string) => Promise<string>;
};

export function UnifiedNoteEditor({
  initialNote,
  onSave,
  onAIAction,
}: UnifiedNoteEditorProps) {
  const [note, setNote] = useState<UnifiedNote>({
    title: initialNote?.title || "",
    tags: initialNote?.tags || [],
    language: initialNote?.language || "english",
    sections: initialNote?.sections || [],
    source: initialNote?.source || "manual",
    youtubeUrl: initialNote?.youtubeUrl,
  });

  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  // Stats
  const totalChars = note.sections.reduce(
    (acc, s) => acc + s.summary.length + s.bullets.join("").length,
    0
  );
  const totalPoints = note.sections.reduce((acc, s) => acc + s.bullets.length, 0);

  // Tag handlers
  const handleAddTag = () => {
    if (newTag.trim() && !note.tags.includes(newTag.trim())) {
      setNote({ ...note, tags: [...note.tags, newTag.trim()] });
      setNewTag("");
    }
    setShowTagInput(false);
  };

  const handleRemoveTag = (tag: string) => {
    setNote({ ...note, tags: note.tags.filter((t) => t !== tag) });
  };

  // Section handlers
  const addSection = () => {
    const newSection: NoteSection = {
      id: crypto.randomUUID(),
      title: "",
      summary: "",
      bullets: [""],
      language: note.language,
    };
    setNote({ ...note, sections: [...note.sections, newSection] });
  };

  const updateSection = (sectionId: string, updates: Partial<NoteSection>) => {
    setNote({
      ...note,
      sections: note.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const deleteSection = (sectionId: string) => {
    setNote({
      ...note,
      sections: note.sections.filter((s) => s.id !== sectionId),
    });
  };

  const addBullet = (sectionId: string) => {
    setNote({
      ...note,
      sections: note.sections.map((s) =>
        s.id === sectionId ? { ...s, bullets: [...s.bullets, ""] } : s
      ),
    });
  };

  const updateBullet = (sectionId: string, index: number, value: string) => {
    setNote({
      ...note,
      sections: note.sections.map((s) =>
        s.id === sectionId
          ? { ...s, bullets: s.bullets.map((b, i) => (i === index ? value : b)) }
          : s
      ),
    });
  };

  const deleteBullet = (sectionId: string, index: number) => {
    setNote({
      ...note,
      sections: note.sections.map((s) =>
        s.id === sectionId
          ? { ...s, bullets: s.bullets.filter((_, i) => i !== index) }
          : s
      ),
    });
  };

  // Language change for entire note
  const handleLanguageChange = async (lang: "english" | "hindi" | "hinglish") => {
    setNote({ ...note, language: lang });
    // Could trigger AI translation here
  };

  // AI Actions
  const handleSectionAI = async (
    sectionId: string,
    action: "simplify" | "expand" | "regenerate"
  ) => {
    if (!onAIAction) return;
    const section = note.sections.find((s) => s.id === sectionId);
    if (!section) return;

    setAiLoading({ ...aiLoading, [`${sectionId}-${action}`]: true });
    try {
      const result = await onAIAction(action, section.summary, sectionId);
      updateSection(sectionId, { summary: result });
    } finally {
      setAiLoading({ ...aiLoading, [`${sectionId}-${action}`]: false });
    }
  };

  const handleSave = () => {
    onSave?.({
      ...note,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)]">
        {/* Title */}
        <input
          type="text"
          placeholder="Untitled Note"
          value={note.title}
          onChange={(e) => setNote({ ...note, title: e.target.value })}
          className="w-full text-2xl font-bold text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]"
        />

        {/* Tags */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text-muted)]"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500 transition-colors ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          {showTagInput ? (
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onBlur={handleAddTag}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="tag"
              autoFocus
              className="text-xs px-2.5 py-1 bg-[var(--color-bg)] rounded-full text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] w-20"
            />
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-xs px-2.5 py-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-full transition-colors"
            >
              + tag
            </button>
          )}
        </div>

        {/* Language Toggle - Note level */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-[var(--color-text-muted)]">Language:</span>
          <div className="inline-flex gap-1 bg-[var(--color-bg)] rounded-lg p-1">
            {(["english", "hindi", "hinglish"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors capitalize",
                  note.language === lang
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="p-6 space-y-6">
        <AnimatePresence>
          {note.sections.map((section, sectionIndex) => {
            const isFocused = focusedSectionId === section.id;
            const dimmed = focusedSectionId !== null && !isFocused;

            return (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: dimmed ? 0.4 : 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isFocused
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-border)] bg-[var(--color-bg)]/50"
                )}
              >
                {/* Section Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={`Section ${sectionIndex + 1}`}
                      value={section.title}
                      onChange={(e) =>
                        updateSection(section.id, { title: e.target.value })
                      }
                      className="w-full text-lg font-semibold text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Focus button */}
                    <button
                      onClick={() =>
                        setFocusedSectionId(isFocused ? null : section.id)
                      }
                      className={cn(
                        "p-1.5 rounded-lg text-xs transition-colors",
                        isFocused
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
                      )}
                      title={isFocused ? "Unfocus" : "Focus"}
                    >
                      {isFocused ? "◉" : "○"}
                    </button>
                    {/* Delete section */}
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs"
                      title="Delete section"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Summary/Content */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-[var(--color-text-muted)]">
                      Summary
                    </label>
                    <div className="flex gap-1">
                      <AIActionButton
                        onClick={() => handleSectionAI(section.id, "simplify")}
                        loading={aiLoading[`${section.id}-simplify`]}
                      >
                        Simplify
                      </AIActionButton>
                      <AIActionButton
                        onClick={() => handleSectionAI(section.id, "expand")}
                        loading={aiLoading[`${section.id}-expand`]}
                      >
                        Expand
                      </AIActionButton>
                      <AIActionButton
                        onClick={() => handleSectionAI(section.id, "regenerate")}
                        loading={aiLoading[`${section.id}-regenerate`]}
                      >
                        Regen
                      </AIActionButton>
                    </div>
                  </div>
                  <textarea
                    placeholder="Write a summary..."
                    value={section.summary}
                    onChange={(e) =>
                      updateSection(section.id, { summary: e.target.value })
                    }
                    className="w-full min-h-[80px] p-3 text-sm text-[var(--color-text)] bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] resize-none"
                  />
                  <div className="mt-1 text-xs text-[var(--color-text-subtle)] text-right">
                    {section.summary.length} chars
                  </div>
                </div>

                {/* Key Points / Bullets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-[var(--color-text-muted)]">
                      Key Points ({section.bullets.filter(Boolean).length})
                    </label>
                  </div>
                  <ul className="space-y-2">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 mt-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Add a key point..."
                          value={bullet}
                          onChange={(e) =>
                            updateBullet(section.id, bulletIndex, e.target.value)
                          }
                          className="flex-1 text-sm text-[var(--color-text)] bg-transparent border-none focus:outline-none placeholder:text-[var(--color-text-subtle)]"
                        />
                        <button
                          onClick={() => deleteBullet(section.id, bulletIndex)}
                          className="p-1 text-[var(--color-text-subtle)] hover:text-red-500 transition-colors text-xs opacity-60 hover:opacity-100"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => addBullet(section.id)}
                    className="mt-2 text-xs text-[var(--color-primary)] hover:underline"
                  >
                    + Add point
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Section Button */}
        <button
          onClick={addSection}
          className="w-full p-4 border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          + Add Section
        </button>

        {/* No sections hint */}
        {note.sections.length === 0 && (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            <p>No sections yet. Add a section to organize your notes.</p>
            <p className="text-sm mt-1">
              Sections are optional - great for YouTube imports or long notes.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/30">
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-subtle)]">
          <span>{note.sections.length} sections</span>
          <span>{totalPoints} points</span>
          <span>{totalChars} chars</span>
          {note.source === "youtube" && note.youtubeUrl && (
            <span className="text-red-500">📺 YouTube</span>
          )}
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Save Note
        </button>
      </div>
    </div>
  );
}

function AIActionButton({
  children,
  onClick,
  loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "px-2 py-1 text-xs rounded-md transition-colors",
        "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20",
        loading && "opacity-50 cursor-not-allowed"
      )}
    >
      {loading ? "..." : children}
    </button>
  );
}

