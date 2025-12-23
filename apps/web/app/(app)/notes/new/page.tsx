"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UnifiedNoteEditor } from "../../../../components/notes";
import { SaveIndicator } from "../../../../components/ui";
import { useCreateNote } from "../../../../lib/hooks";
import { aiApi } from "../../../../lib/api";
import { logger } from "../../../../lib/logger";

type SaveState = "idle" | "saving" | "saved" | "error";

function NewNotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  
  const createNote = useCreateNote();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Auto-hide saved state
  useEffect(() => {
    if (saveState === "saved") {
      const timer = setTimeout(() => setSaveState("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  const handleSave = async (note: any) => {
    setSaveState("saving");
    try {
      const result = await createNote.mutateAsync({
        title: note.title || "Untitled",
        content: note.content || "",
        tags: note.tags || [],
        language: note.language || "english",
        source: note.source || "manual",
        youtubeUrl: note.youtubeUrl,
        sections: note.sections || [],
      });
      setSaveState("saved");
      setTimeout(() => router.push(`/notes/${result.id}`), 500);
    } catch (err) {
      logger.error("Failed to save note:", err);
      setSaveState("error");
    }
  };

  const handleAIAction = async (action: string, text: string): Promise<string> => {
    try {
      if (action === "simplify" || action === "expand" || action === "example") {
        return await aiApi.inline(text, action);
      }
      return text;
    } catch (e) {
      logger.error("AI action failed:", e);
      return text;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 py-3"
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/notes"
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">New Note</h1>
          <SaveIndicator state={saveState} />
        </div>
      </motion.div>

      {/* Scrollable Editor */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto"
        >
          <UnifiedNoteEditor 
            onSave={handleSave} 
            onAIAction={handleAIAction}
            initialNote={prompt ? { title: prompt } : undefined}
            isSaving={saveState === "saving" || createNote.isPending}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default function NewNotePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewNotePageContent />
    </Suspense>
  );
}
