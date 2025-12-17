"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UnifiedNoteEditor } from "../../../../components/notes";
import { SaveIndicator } from "../../../../components/ui";
import { useNote, useUpdateNote } from "../../../../lib/hooks";
import { aiApi } from "../../../../lib/api";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const { data: note, isLoading, error } = useNote(noteId);
  const updateNote = useUpdateNote();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Auto-hide saved state
  useEffect(() => {
    if (saveState === "saved") {
      const timer = setTimeout(() => setSaveState("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  const handleSave = async (data: any) => {
    setSaveState("saving");
    try {
      await updateNote.mutateAsync({
        id: noteId,
        data: {
          title: data.title,
          content: data.content,
          tags: data.tags,
          language: data.language,
          sections: data.sections,
        },
      });
      setSaveState("saved");
    } catch (err) {
      console.error("Failed to update note:", err);
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
      console.error("AI action failed:", e);
      return text;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--color-text-muted)]">Note not found</p>
        <Link href="/notes" className="text-[var(--color-primary)] hover:underline mt-2 inline-block">
          ← Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <Link
          href="/notes"
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Edit Note</h1>
        <SaveIndicator state={saveState} />
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <UnifiedNoteEditor
          initialNote={{
            title: note.title,
            content: note.content,
            tags: note.tags,
            language: note.language,
            sections: note.sections,
            source: note.source as "manual" | "youtube",
            youtubeUrl: note.youtubeUrl,
          }}
          onSave={handleSave}
          onAIAction={handleAIAction}
        />
      </motion.div>
    </div>
  );
}
