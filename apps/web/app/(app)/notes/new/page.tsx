"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NoteEditor } from "../../../../components/notes";

export default function NewNotePage() {
  const router = useRouter();

  const handleSave = (data: { title: string; content: string; tags: string[] }) => {
    // Mock save - would create note via API
    console.log("Saving note:", data);
    const id = crypto.randomUUID();
    router.push(`/notes/${id}`);
  };

  const handleAIAction = async (action: string, text?: string): Promise<string> => {
    // Mock AI action - would call API
    await new Promise((r) => setTimeout(r, 1000));
    
    switch (action) {
      case "summarize":
        return `Summary: ${text?.slice(0, 100)}...`;
      case "expand":
        return `\n\nExpanded content based on: "${text?.slice(0, 50)}..."`;
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
        <h1 className="text-xl font-semibold text-[var(--color-text)]">New Note</h1>
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <NoteEditor onSave={handleSave} onAIAction={handleAIAction} />
      </motion.div>
    </div>
  );
}
