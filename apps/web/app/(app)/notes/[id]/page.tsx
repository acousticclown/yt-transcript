"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { NoteEditor } from "../../../../components/notes";

// Mock note data
const mockNotes: Record<string, { title: string; content: string; tags: string[] }> = {
  "1": {
    title: "React Best Practices",
    content: `Key patterns for building scalable React applications:

1. Component Composition
   - Break down UI into small, reusable components
   - Use composition over inheritance

2. State Management
   - Keep state as local as possible
   - Lift state up only when necessary

3. Performance Optimization
   - Use React.memo for expensive renders
   - Implement proper key props for lists`,
    tags: ["react", "development"],
  },
  "2": {
    title: "Machine Learning Basics",
    content: `Introduction to neural networks and deep learning concepts.

Neural networks are computing systems inspired by biological neural networks. They consist of:
- Input layer
- Hidden layers
- Output layer

Key concepts:
- Weights and biases
- Activation functions
- Backpropagation`,
    tags: ["ml", "ai"],
  },
};

export default function NoteEditorPage() {
  const params = useParams();
  const noteId = params.id as string;
  const note = mockNotes[noteId] || { title: "", content: "", tags: [] };

  const handleSave = (data: { title: string; content: string; tags: string[] }) => {
    console.log("Saving note:", noteId, data);
    // Would save via API
  };

  const handleAIAction = async (action: string, text?: string): Promise<string> => {
    await new Promise((r) => setTimeout(r, 1000));
    
    switch (action) {
      case "summarize":
        return `Summary: ${text?.slice(0, 100)}...`;
      case "expand":
        return `\n\nExpanded: ${text?.slice(0, 50)}...`;
      case "simplify":
        return text?.split(" ").slice(0, Math.ceil((text?.split(" ").length || 0) / 2)).join(" ") + "...";
      default:
        return text || "";
    }
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
        <NoteEditor
          initialTitle={note.title}
          initialContent={note.content}
          initialTags={note.tags}
          onSave={handleSave}
          onAIAction={handleAIAction}
        />
      </motion.div>
    </div>
  );
}
