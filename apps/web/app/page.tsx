"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableSectionCard } from "../components/SortableSectionCard";
import { Container, Stack } from "../components/layout";
import { CategoryFilter } from "../components/CategoryFilter";

type LanguageVariant = {
  title: string;
  summary: string;
  bullets: string[];
};

type Section = {
  id: string;
  // Source of truth (always English)
  source: LanguageVariant;
  // Cached variants
  variants: {
    english: LanguageVariant;
    hindi?: LanguageVariant;
    hinglish?: {
      neutral?: LanguageVariant;
      casual?: LanguageVariant;
      interview?: LanguageVariant;
    };
  };
  // Current view state
  current: LanguageVariant;
  language: "english" | "hindi" | "hinglish";
  hinglishTone?: "neutral" | "casual" | "interview";
  // Smart organization
  category?: {
    type: string;
    tags: string[];
    confidence: number;
  };
  personalTags?: string[];
};

const loadingMessages = [
  "🧠 Listening to the video…",
  "✍️ Writing clean notes…",
  "🧩 Organizing thoughts…",
  "🎨 Making it readable…",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [transcript, setTranscript] = useState<
    Array<{ text: string; start: number; duration: number }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  async function generateNotes() {
    // Soft warning for potentially long videos (estimate based on URL)
    // This is a rough heuristic - we can't know video length without fetching
    // Just set expectations, don't block
    const isLongVideo = false; // Could be enhanced with video metadata later

    setLoading(true);
    setSections([]);
    // Random loading message for micro-playfulness
    setLoadingMessage(
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    );

    try {
      // 1. Fetch transcript
      const transcriptRes = await fetch("http://localhost:3001/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const transcriptData = await transcriptRes.json();

      if (transcriptData.error) {
        // Human-friendly error message
        const errorMsg =
          transcriptData.error.includes("captions") ||
          transcriptData.error.includes("Transcript not available")
            ? "This video doesn't have captions yet. Try another video with captions enabled."
            : transcriptData.error;
        alert(`⚠️ ${errorMsg}`);
        setLoading(false);
        return;
      }

      // Store transcript for regeneration
      setTranscript(transcriptData.transcript || []);

      // 2. Fetch sections
      const sectionsRes = await fetch("http://localhost:3001/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptData.transcript }),
      });
      const sectionsData = await sectionsRes.json();

      if (sectionsData.error) {
        // Human-friendly error message
        alert(
          `⚠️ Couldn't generate notes right now. ${
            sectionsData.error || "Please try again."
          }`
        );
        setLoading(false);
        return;
      }

      // Initialize sections with variants cache
      // source = always English (stable, editable)
      // variants = cached language versions (no re-generation needed)
      // current = what user sees & edits
      const sectionsWithIds = (sectionsData.sections || []).map(
        (section: { title: string; summary: string; bullets: string[] }) => ({
          id: crypto.randomUUID(),
          source: section, // Always English from backend
          variants: {
            english: section, // Cache English version
          },
          current: section, // Initially same as source
          language: "english" as const,
        })
      );

      // 3. Detect categories for all sections
      try {
        const categoryRes = await fetch("http://localhost:3001/ai/detect-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sections: sectionsWithIds.map((s) => s.current),
          }),
        });

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          // Apply same category to all sections (video-level categorization)
          const sectionsWithCategories = sectionsWithIds.map((section) => ({
            ...section,
            category: categoryData,
          }));
          setSections(sectionsWithCategories);
        } else {
          // If category detection fails, just use sections without categories
          setSections(sectionsWithIds);
        }
      } catch {
        // If category detection fails, just use sections without categories
        setSections(sectionsWithIds);
      }
    } catch (error) {
      // Keep existing sections, show clear error
      alert(
        "⚠️ Couldn't generate notes right now. Make sure the API server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size="lg" className="py-6 sm:py-8">
      <Stack gap={8}>
        {/* 1. Page title - Most important */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          YT-Transcript
        </h1>

        {/* 2. Primary action - Generate Notes */}
        <Stack direction="row" gap={3}>
        <input
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent"
          placeholder="Paste YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              generateNotes();
            }
          }}
        />
        <motion.button
          onClick={generateNotes}
          disabled={loading || !url.trim()}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
          className="bg-black dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Generate Notes
        </motion.button>
        </Stack>

        {/* Category Filter */}
        {sections.length > 0 && (
          <CategoryFilter
            categories={Array.from(
              new Set(
                sections
                  .map((s) => s.category?.type)
                  .filter((c): c is string => !!c)
              )
            )}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {/* 5. Secondary actions - Save and Export (grouped, less prominent) */}
        {sections.length > 0 && (
          <Stack direction="row" gap={2} className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <motion.button
            onClick={async () => {
              if (sections.length === 0) {
                alert("No sections to save.");
                return;
              }
              setSaving(true);
              try {
                const res = await fetch("http://localhost:3001/save", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url, sections }),
                });

                if (!res.ok) {
                  const errorData = await res
                    .json()
                    .catch(() => ({ error: "Unknown error" }));
                  alert(errorData.error || `Failed to save: ${res.status}`);
                  return;
                }

                const data = await res.json();
                if (data.error) {
                  alert(data.error);
                } else {
                  alert("Saved to library!");
                }
              } catch {
                // Keep existing sections, show clear error
                alert(
                  "⚠️ Couldn't save notes right now. Make sure the API server is running."
                );
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || sections.length === 0}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.15 }}
            className="text-sm border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {saving ? "Saving..." : "Save to Library"}
          </motion.button>
          <motion.button
            onClick={async () => {
              if (sections.length === 0) {
                alert("No sections to export.");
                return;
              }
              try {
                // Export only current content (what user sees)
                const sectionsToExport = sections.map((s) => s.current);
                const res = await fetch(
                  "http://localhost:3001/export/markdown",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sections: sectionsToExport }),
                  }
                );

                if (!res.ok) {
                  const errorData = await res
                    .json()
                    .catch(() => ({ error: "Unknown error" }));
                  alert(
                    `⚠️ ${errorData.error || `Failed to export: ${res.status}`}`
                  );
                  return;
                }

                const blob = await res.blob();
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "notes.md";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
              } catch {
                // Keep existing sections, show clear error
                alert(
                  "⚠️ Couldn't export notes right now. Make sure the API server is running."
                );
              }
            }}
            disabled={sections.length === 0}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.15 }}
            className="text-sm border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Export as Markdown
          </motion.button>
          </Stack>
        )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center py-12"
        >
          <p className="text-base text-gray-600 dark:text-gray-400">
            {loadingMessage}
          </p>
        </motion.div>
      )}

      {!loading && sections.length === 0 && (
        <div className="text-center py-20 px-4">
          <p className="text-base text-gray-500 dark:text-gray-400 mb-2">
            👋 Paste a YouTube link to begin.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Your notes will appear here, fully editable.
          </p>
        </div>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={(event: DragEndEvent) => {
          const { active, over } = event;
          if (over && active.id !== over.id) {
            setSections((items) => {
              const oldIndex = items.findIndex((i) => i.id === active.id);
              const newIndex = items.findIndex((i) => i.id === over.id);
              return arrayMove(items, oldIndex, newIndex);
            });
          }
        }}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            <Stack gap={5} as="section">
              {sections
                .filter((section) => {
                  if (selectedCategory === null) return true;
                  return section.category?.type === selectedCategory;
                })
                .map((section) => {
                  const isFocused = focusedSectionId === section.id;
                  const dimmed = focusedSectionId !== null && !isFocused;

                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: dimmed ? 0.3 : 1,
                      y: 0,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={
                      dimmed ? "pointer-events-none" : "pointer-events-auto"
                    }
                  >
                    <SortableSectionCard
                      section={section}
                      transcript={transcript}
                      isFocused={isFocused}
                      onChange={(updated) => {
                        setSections((items) =>
                          items.map((item) =>
                            item.id === section.id ? updated : item
                          )
                        );
                      }}
                      onFocus={() => setFocusedSectionId(section.id)}
                      onBlurFocus={() => setFocusedSectionId(null)}
                    />
                  </motion.div>
                );
              })}
            </Stack>
          </AnimatePresence>
        </SortableContext>
      </DndContext>
      </Stack>
    </Container>
  );
}
