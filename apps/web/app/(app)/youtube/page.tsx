"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Container, Stack } from "../../../components/layout";
import { ActionButton } from "../../../components/ActionButton";
import { UnifiedNoteEditor } from "../../../components/notes";
import { SaveIndicator } from "../../../components/ui";
import { useCreateNote } from "../../../lib/hooks";
import { youtubeApi, aiApi } from "../../../lib/api";

type SaveState = "idle" | "saving" | "saved" | "error";

const loadingMessages = [
  "🧠 Listening to the video…",
  "✍️ Writing clean notes…",
  "🧩 Organizing thoughts…",
  "🎨 Making it readable…",
];

type NoteSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  language: "english" | "hindi" | "hinglish";
};

type GeneratedNote = {
  title: string;
  tags: string[];
  language: "english" | "hindi" | "hinglish";
  sections: NoteSection[];
  source: "youtube";
  youtubeUrl: string;
};

export default function YouTubePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);

  const createNote = useCreateNote();
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Auto-hide saved state
  useEffect(() => {
    if (saveState === "saved") {
      const timer = setTimeout(() => setSaveState("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  async function generateNotes() {
    if (!url.trim()) return;

    setLoading(true);
    setGeneratedNote(null);
    setLoadingMessage(
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    );

    try {
      // Use API client
      const result = await youtubeApi.generate(url);

      if (result.error) {
        const errorMsg =
          result.error.includes("captions") ||
          result.error.includes("Transcript not available")
            ? "This video doesn't have captions yet. Try another video with captions enabled."
            : result.error;
        alert(`⚠️ ${errorMsg}`);
        setLoading(false);
        return;
      }

      // Convert to unified note format
      const sections: NoteSection[] = (result.sections || []).map(
        (section: { title: string; summary: string; bullets: string[] }) => ({
          id: crypto.randomUUID(),
          title: section.title,
          summary: section.summary,
          bullets: section.bullets,
          language: "english" as const,
        })
      );

      // Extract video title from URL or use first section title
      const videoTitle = sections[0]?.title || "YouTube Notes";

      setGeneratedNote({
        title: videoTitle,
        tags: ["youtube"],
        language: "english",
        sections,
        source: "youtube",
        youtubeUrl: url,
      });
    } catch (error) {
      alert(
        "⚠️ Couldn't generate notes right now. Make sure the API server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (note: any) => {
    setSaveState("saving");
    try {
      const result = await createNote.mutateAsync({
        title: note.title || "YouTube Notes",
        content: note.content || "",
        tags: note.tags || ["youtube"],
        language: note.language || "english",
        source: "youtube",
        youtubeUrl: generatedNote?.youtubeUrl || url,
        sections: note.sections || [],
      });
      setSaveState("saved");
      setTimeout(() => router.push(`/notes/${result.id}`), 500);
    } catch (err) {
      console.error("Failed to save note:", err);
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

  // If note is generated, show the editor
  if (generatedNote) {
    return (
      <Container size="lg" className="py-6 sm:py-8">
        <Stack gap={6}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
                  Generated Notes
                </h1>
                <p className="mt-1 text-[var(--color-text-muted)] text-sm truncate max-w-md">
                  From: {generatedNote.youtubeUrl}
                </p>
              </div>
              <SaveIndicator state={saveState} />
            </div>
            <button
              onClick={() => {
                setGeneratedNote(null);
                setUrl("");
              }}
              className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-xl transition-colors"
            >
              ← New Import
            </button>
          </div>

          {/* Editor with generated sections */}
          <UnifiedNoteEditor
            initialNote={generatedNote}
            onSave={handleSave}
            onAIAction={handleAIAction}
          />
        </Stack>
      </Container>
    );
  }

  // Initial state - URL input
  return (
    <Container size="lg" className="py-6 sm:py-8">
      <Stack gap={8}>
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            YouTube to Notes
          </h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Transform any YouTube video into structured, editable notes
          </p>
        </div>

        {/* URL Input */}
        <Stack direction="row" gap={3} className="flex-col sm:flex-row">
          <input
            className="flex-1 border border-[var(--color-border)] rounded-xl px-4 py-3 text-base text-[var(--color-text)] bg-[var(--color-surface)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
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

        {/* Loading state */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-primary)]/10 mb-4">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                ✨
              </motion.span>
            </div>
            <p className="text-lg text-[var(--color-text)]">{loadingMessage}</p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              This may take a moment...
            </p>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !generatedNote && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
              <span className="text-4xl">📺</span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">
              Import from YouTube
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)] max-w-md mx-auto">
              Paste a YouTube URL above to automatically generate structured notes with sections, summaries, and key points.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center text-xs text-[var(--color-text-subtle)]">
              <span className="px-3 py-1 bg-[var(--color-bg)] rounded-full">✓ Auto-sections</span>
              <span className="px-3 py-1 bg-[var(--color-bg)] rounded-full">✓ Key points</span>
              <span className="px-3 py-1 bg-[var(--color-bg)] rounded-full">✓ Multilingual</span>
              <span className="px-3 py-1 bg-[var(--color-bg)] rounded-full">✓ Editable</span>
            </div>
          </div>
        )}
      </Stack>
    </Container>
  );
}
