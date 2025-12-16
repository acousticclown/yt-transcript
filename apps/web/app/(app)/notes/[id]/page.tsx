"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UnifiedNoteEditor } from "../../../../components/notes";

// Mock note data - would come from API
const mockNotes: Record<string, { 
  title: string; 
  tags: string[]; 
  language: "english" | "hindi" | "hinglish";
  sections: Array<{ id: string; title: string; summary: string; bullets: string[]; language: "english" | "hindi" | "hinglish" }>;
  source?: "manual" | "youtube";
}> = {
  "1": {
    title: "React Best Practices",
    tags: ["react", "development"],
    language: "english",
    sections: [
      {
        id: "s1",
        title: "Component Composition",
        summary: "Break down UI into small, reusable components. Use composition over inheritance for better flexibility.",
        bullets: ["Small, focused components", "Props for customization", "Children for flexibility"],
        language: "english",
      },
      {
        id: "s2",
        title: "State Management",
        summary: "Keep state as local as possible. Lift state up only when necessary for shared data.",
        bullets: ["Local state first", "Lift when needed", "Consider context for deep props"],
        language: "english",
      },
    ],
    source: "manual",
  },
  "2": {
    title: "Machine Learning Basics",
    tags: ["ml", "ai"],
    language: "english",
    sections: [
      {
        id: "s1",
        title: "Neural Networks",
        summary: "Computing systems inspired by biological neural networks with input, hidden, and output layers.",
        bullets: ["Input layer receives data", "Hidden layers process", "Output layer produces result"],
        language: "english",
      },
    ],
    source: "youtube",
  },
};

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const note = mockNotes[noteId];

  const handleSave = (data: any) => {
    console.log("Saving note:", noteId, data);
    router.push("/notes");
  };

  const handleAIAction = async (action: string, text: string): Promise<string> => {
    try {
      const res = await fetch("http://localhost:3001/ai/inline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.text || text;
      }
    } catch (e) {
      console.error("AI action failed:", e);
    }
    return text;
  };

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
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {note ? (
          <UnifiedNoteEditor
            initialNote={note}
            onSave={handleSave}
            onAIAction={handleAIAction}
          />
        ) : (
          <div className="text-center py-12 text-[var(--color-text-muted)]">
            Note not found
          </div>
        )}
      </motion.div>
    </div>
  );
}
