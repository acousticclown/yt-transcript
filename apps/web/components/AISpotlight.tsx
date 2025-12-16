"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type AISpotlightProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
};

const suggestions = [
  { icon: "📝", text: "Write a summary about..." },
  { icon: "💡", text: "Brainstorm ideas for..." },
  { icon: "📋", text: "Create a list of..." },
  { icon: "✨", text: "Explain in simple terms..." },
];

export function AISpotlight({ isOpen, onClose, onSubmit }: AISpotlightProps) {
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt("");
      onClose();
    }
  };

  const handleMicClick = () => {
    // Toggle listening state (actual speech recognition would go here)
    setIsListening(!isListening);
    // For now, just show visual feedback
    if (!isListening) {
      // Start listening animation
      setTimeout(() => setIsListening(false), 3000); // Auto-stop after 3s for demo
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Spotlight Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-xl z-50"
          >
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
              {/* Input area */}
              <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
                <div className="flex-shrink-0">
                  <motion.div
                    animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isListening
                        ? "bg-red-500/20 text-red-500"
                        : "bg-purple-500/20 text-purple-500"
                    )}
                  >
                    <SparkleIcon />
                  </motion.div>
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="Ask AI to generate anything..."
                  className="flex-1 bg-transparent text-lg text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none"
                />

                {/* Mic button */}
                <button
                  onClick={handleMicClick}
                  className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    isListening
                      ? "bg-red-500 text-white"
                      : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  )}
                >
                  <MicIcon isActive={isListening} />
                </button>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className={cn(
                    "p-2.5 rounded-xl transition-colors",
                    prompt.trim()
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-bg)] text-[var(--color-text-subtle)]"
                  )}
                >
                  <ArrowIcon />
                </button>
              </div>

              {/* Suggestions */}
              <div className="p-3">
                <p className="text-xs text-[var(--color-text-subtle)] px-2 mb-2">Suggestions</p>
                <div className="space-y-1">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPrompt(suggestion.text);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] transition-colors"
                    >
                      <span className="text-lg">{suggestion.icon}</span>
                      <span>{suggestion.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer hint */}
              <div className="px-4 py-3 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-subtle)]">
                <span>Press <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">Enter</kbd> to generate</span>
                <span>Press <kbd className="px-1.5 py-0.5 bg-[var(--color-surface)] rounded border border-[var(--color-border)]">Esc</kbd> to close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function MicIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {isActive ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      )}
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

