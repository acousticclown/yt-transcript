"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UnifiedNoteEditor } from "../../../../components/notes";

export default function NewNotePage() {
  const router = useRouter();

  const handleSave = (note: any) => {
    // Mock save - would create note via API
    console.log("Saving note:", note);
    const id = crypto.randomUUID();
    router.push(`/notes/${id}`);
  };

  const handleAIAction = async (action: string, text: string): Promise<string> => {
    // Call actual API
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
        <h1 className="text-xl font-semibold text-[var(--color-text)]">New Note</h1>
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <UnifiedNoteEditor onSave={handleSave} onAIAction={handleAIAction} />
      </motion.div>
    </div>
  );
}
