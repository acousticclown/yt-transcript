"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableSectionCard } from "../components/SortableSectionCard";
import { Container, Stack } from "../components/layout";
import { CategoryFilter } from "../components/CategoryFilter";
import { ActionButton } from "../components/ActionButton";
import { ButtonGroup } from "../components/ButtonGroup";
import { ThemeToggle } from "../components/ThemeToggle";

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
  // Section type (Tutorial, Interview, Lecture, etc.)
  sectionType?: {
    type: string;
    confidence: number;
  };
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Mobile-optimized drag sensors - allow touch drag with delay to prevent conflicts
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay on touch to prevent accidental drags
        tolerance: 8, // 8px movement tolerance
      },
    })
  );

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

      // 3. Detect categories and section types for all sections
      try {
        const [categoryRes, typeRes] = await Promise.all([
          fetch("http://localhost:3001/ai/detect-categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sections: sectionsWithIds.map((s) => s.current),
            }),
          }),
          fetch("http://localhost:3001/ai/section-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sections: sectionsWithIds.map((s) => s.current),
            }),
          }),
        ]);

        const categoryData = categoryRes.ok ? await categoryRes.json() : null;
        const typeData = typeRes.ok ? await typeRes.json() : null;

        const sectionsWithMetadata = sectionsWithIds.map((section, i) => ({
          ...section,
          category: categoryData || null,
          sectionType: typeData?.types?.[i] || null,
        }));
        setSections(sectionsWithMetadata);
      } catch {
        // If metadata detection fails, just use sections without metadata
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
        {/* Header with title and theme toggle */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            YT-Transcript
          </h1>
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>

        {/* 2. Primary action - Generate Notes */}
        <Stack direction="row" gap={3} className="flex-col sm:flex-row">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Paste YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                generateNotes();
              }
            }}
          />
          <ActionButton
            onClick={generateNotes}
            disabled={loading || !url.trim()}
            loading={loading}
            variant="primary"
            size="lg"
            icon={<span>✨</span>}
            className="w-full sm:w-auto"
          >
            Generate Notes
          </ActionButton>
        </Stack>

        {/* Category, Type & Tag Filter */}
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
            sectionTypes={Array.from(
              new Set(
                sections
                  .map((s) => s.sectionType?.type)
                  .filter((t): t is string => !!t)
              )
            )}
            selectedSectionType={selectedSectionType}
            onSelectSectionType={setSelectedSectionType}
            tags={Array.from(
              new Set([
                ...sections.flatMap((s) => s.category?.tags || []),
                ...sections.flatMap((s) => s.personalTags || []),
              ])
            )}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        )}

        {/* 5. Secondary actions - Save and Export (grouped, less prominent) */}
        {sections.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <ButtonGroup className="flex-col sm:flex-row w-full sm:w-auto">
              <ActionButton
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
                      alert("✅ Saved to library!");
                    }
                  } catch {
                    alert(
                      "⚠️ Couldn't save notes right now. Make sure the API server is running."
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || sections.length === 0}
                loading={saving}
                variant="secondary"
                size="md"
                icon={<span>💾</span>}
                className="w-full sm:w-auto"
              >
                Save to Library
              </ActionButton>
              <ActionButton
                onClick={async () => {
                  if (sections.length === 0) {
                    alert("No sections to export.");
                    return;
                  }
                  try {
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
                    alert(
                      "⚠️ Couldn't export notes right now. Make sure the API server is running."
                    );
                  }
                }}
                disabled={sections.length === 0}
                variant="secondary"
                size="md"
                icon={<span>📥</span>}
                className="w-full sm:w-auto"
              >
                Export Markdown
              </ActionButton>
            </ButtonGroup>
          </div>
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
        sensors={sensors}
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
            <Stack gap={4} as="section" className="pb-4 sm:pb-0 sm:gap-5">
              {sections
                .filter((section) => {
                  // Section type filter
                  if (selectedSectionType !== null && section.sectionType?.type !== selectedSectionType) {
                    return false;
                  }
                  // Category filter
                  if (selectedCategory !== null && section.category?.type !== selectedCategory) {
                    return false;
                  }
                  // Tag filter
                  if (selectedTag !== null) {
                    const hasTag =
                      section.category?.tags.includes(selectedTag) ||
                      section.personalTags?.includes(selectedTag);
                    if (!hasTag) return false;
                  }
                  return true;
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
