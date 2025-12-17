"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { NoteViewer } from "../../../../components/notes/NoteViewer";
import { UnifiedNoteEditor } from "../../../../components/notes";
import { SaveIndicator } from "../../../../components/ui";
import { useNote, useUpdateNote } from "../../../../lib/hooks";
import { aiApi } from "../../../../lib/api";
import { downloadMarkdown, copyMarkdownToClipboard } from "../../../../lib/exportNote";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const { data: note, isLoading, error } = useNote(noteId);
  const updateNote = useUpdateNote();
  const [isEditing, setIsEditing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

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
      setTimeout(() => {
        setSaveState("idle");
        setIsEditing(false);
      }, 1000);
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
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-[var(--color-text-muted)]">Note not found</p>
        <Link href="/notes" className="text-[var(--color-primary)] hover:underline">
          ← Back to notes
        </Link>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 py-3"
        >
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors"
            >
              ← Done
            </button>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">Editing</h1>
            <SaveIndicator state={saveState} />
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
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
          </div>
        </div>
      </div>
    );
  }

  // Read mode (beautiful viewer)
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-lg border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 py-3"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/notes"
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors"
          >
            ←
          </Link>
          
          <div className="flex-1" />
          
          {/* Actions */}
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors"
            title="Edit"
          >
            <PenIcon />
          </button>
          
          <div className="relative group">
            <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg transition-colors">
              <ExportIcon />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button
                onClick={() => downloadMarkdown(note)}
                className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-t-xl flex items-center gap-2"
              >
                📥 Download .md
              </button>
              <button
                onClick={() => copyMarkdownToClipboard(note)}
                className="w-full px-4 py-2.5 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-b-xl flex items-center gap-2"
              >
                📋 Copy Markdown
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content - Click anywhere to edit */}
      <div 
        className="flex-1 overflow-y-auto cursor-pointer"
        onClick={() => setIsEditing(true)}
      >
        <NoteViewer note={note} />
      </div>
    </div>
  );
}

function PenIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
