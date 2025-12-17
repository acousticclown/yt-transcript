"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type GeneratedNote = {
  title: string;
  content: string;
  tags: string[];
  sections: Array<{
    id: string;
    title: string;
    summary: string;
    bullets: string[];
    language: "english" | "hindi" | "hinglish";
  }>;
};

type AISpotlightProps = {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (note: GeneratedNote) => void;
  isLoading?: boolean;
};

const suggestions = [
  { icon: "📝", text: "Meeting notes about project kickoff", category: "Work" },
  { icon: "💡", text: "Brainstorm ideas for a mobile app", category: "Ideas" },
  { icon: "📚", text: "Study notes on machine learning basics", category: "Learning" },
  { icon: "✅", text: "Weekly goals and action items", category: "Productivity" },
  { icon: "🎯", text: "Product roadmap for Q1", category: "Planning" },
  { icon: "📖", text: "Book summary: Atomic Habits", category: "Reading" },
];

export function AISpotlight({ isOpen, onClose, onGenerate, isLoading = false }: AISpotlightProps) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setPrompt("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading) onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose, isLoading]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    
    try {
      const { aiApi } = await import("../lib/api");
      const note = await aiApi.generateNote(prompt.trim());
      onGenerate(note);
      setPrompt("");
    } catch (error) {
      console.error("Failed to generate note:", error);
      alert("Failed to generate note. Please try again.");
    }
  };

  const handleSuggestionClick = (text: string) => {
    setPrompt(text);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && onClose()}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Spotlight Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-50"
          >
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[var(--color-border)] bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <SparkleIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text)]">AI Note Generator</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Describe what you want to create</p>
                  </div>
                </div>
              </div>

              {/* Input area */}
              <div className="p-4">
                <div className="flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit();
                    }}
                    disabled={isLoading}
                    placeholder="e.g., Create notes about React hooks best practices..."
                    className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none disabled:opacity-50"
                  />

                  {/* Submit button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() || isLoading}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
                      prompt.trim() && !isLoading
                        ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-text-subtle)]"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SparkleIcon className="w-4 h-4" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              {!isLoading && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-[var(--color-text-subtle)] mb-2">Try these examples:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="flex items-start gap-2 p-2.5 rounded-xl text-left text-sm hover:bg-[var(--color-bg)] transition-colors group"
                      >
                        <span className="text-lg">{suggestion.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] truncate">
                            {suggestion.text}
                          </p>
                          <p className="text-xs text-[var(--color-text-subtle)]">{suggestion.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="px-4 pb-6 pt-2">
                  <div className="flex flex-col items-center gap-3 py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"
                    >
                      <SparkleIcon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-medium text-[var(--color-text)]">Creating your note...</p>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        AI is organizing your thoughts
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-2.5 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-subtle)]">
                <span className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">↵</kbd>
                  Generate
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">Esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
