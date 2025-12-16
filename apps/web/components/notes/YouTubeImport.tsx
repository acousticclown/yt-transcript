"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type YouTubeImportProps = {
  onImport: (sections: { title: string; content: string }[]) => void;
};

export function YouTubeImport({ onImport }: YouTubeImportProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sections, setSections] = useState<{ title: string; summary: string; bullets: string[] }[]>([]);
  const [selectedSections, setSelectedSections] = useState<Set<number>>(new Set());

  const handleFetch = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError("");
    setSections([]);

    try {
      // Fetch transcript
      const transcriptRes = await fetch("http://localhost:3001/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const transcriptData = await transcriptRes.json();

      if (transcriptData.error) {
        setError(transcriptData.error);
        setLoading(false);
        return;
      }

      // Fetch sections
      const sectionsRes = await fetch("http://localhost:3001/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptData.transcript }),
      });
      const sectionsData = await sectionsRes.json();

      if (sectionsData.error) {
        setError(sectionsData.error);
        setLoading(false);
        return;
      }

      setSections(sectionsData.sections || []);
      // Select all by default
      setSelectedSections(new Set(sectionsData.sections?.map((_: unknown, i: number) => i) || []));
    } catch (err) {
      setError("Failed to fetch transcript. Make sure the API is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (index: number) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSections(newSelected);
  };

  const handleImport = () => {
    const selected = sections
      .filter((_, i) => selectedSections.has(i))
      .map((s) => ({
        title: s.title,
        content: `${s.summary}\n\n${s.bullets.map((b) => `• ${b}`).join("\n")}`,
      }));
    onImport(selected);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <h3 className="font-semibold text-[var(--color-text)]">Import from YouTube</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Paste a YouTube URL to extract and import notes
        </p>
      </div>

      {/* URL Input */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Loading..." : "Fetch"}
          </button>
        </div>
        
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Sections */}
      <AnimatePresence>
        {sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--color-text-muted)]">
                  {selectedSections.size} of {sections.length} sections selected
                </span>
                <button
                  onClick={() => {
                    if (selectedSections.size === sections.length) {
                      setSelectedSections(new Set());
                    } else {
                      setSelectedSections(new Set(sections.map((_, i) => i)));
                    }
                  }}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  {selectedSections.size === sections.length ? "Deselect all" : "Select all"}
                </button>
              </div>

              <div className="space-y-2">
                {sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleSection(index)}
                    className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedSections.has(index)
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          selectedSections.has(index)
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : "border-[var(--color-border)]"
                        }`}
                      >
                        {selectedSections.has(index) && "✓"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[var(--color-text)] truncate">
                          {section.title}
                        </h4>
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mt-1">
                          {section.summary}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Import Button */}
            <div className="p-4 border-t border-[var(--color-border)]">
              <button
                onClick={handleImport}
                disabled={selectedSections.size === 0}
                className="w-full py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {selectedSections.size} Section{selectedSections.size !== 1 ? "s" : ""} as Note
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

