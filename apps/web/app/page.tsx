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

type Section = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
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

  async function generateNotes() {
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
        alert(`⚠️ ${transcriptData.error}`);
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
        alert(`⚠️ ${sectionsData.error}`);
        setLoading(false);
        return;
      }

      // Add stable IDs to sections for drag & drop
      const sectionsWithIds = (sectionsData.sections || []).map(
        (section: Omit<Section, "id">) => ({
          ...section,
          id: crypto.randomUUID(),
        })
      );
      setSections(sectionsWithIds);
    } catch {
      alert(
        "⚠️ Failed to generate notes. Make sure the API server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      {/* 1. Page title - Most important */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        YT-Transcript
      </h1>

      {/* 2. Primary action - Generate Notes */}
      <div className="flex gap-3">
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
      </div>

      {/* 5. Secondary actions - Save and Export (grouped, less prominent) */}
      {sections.length > 0 && (
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
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
                  alert("Notes saved!");
                }
              } catch {
                alert(
                  "⚠️ Failed to save notes. Make sure the API server is running."
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
                const res = await fetch(
                  "http://localhost:3001/export/markdown",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sections }),
                  }
                );

                if (!res.ok) {
                  const errorData = await res
                    .json()
                    .catch(() => ({ error: "Unknown error" }));
                  alert(errorData.error || `Failed to export: ${res.status}`);
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
                  "⚠️ Failed to export notes. Make sure the API server is running."
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
            <section className="space-y-5">
              {sections.map((section) => {
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
                    className={dimmed ? "pointer-events-none" : "pointer-events-auto"}
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
            </section>
          </AnimatePresence>
        </SortableContext>
      </DndContext>
    </main>
  );
}
