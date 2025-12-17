"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useAIStream, type GeneratedNote, type ThinkingStep } from "../lib/useAIStream";
import { ApiKeyPrompt } from "./ApiKeyPrompt";

type AISpotlightProps = {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (note: GeneratedNote) => void;
};

const suggestions = [
  { icon: "📝", text: "Meeting notes about project kickoff", category: "Work" },
  { icon: "💡", text: "Brainstorm ideas for a mobile app", category: "Ideas" },
  { icon: "📚", text: "Study notes on machine learning basics", category: "Learning" },
  { icon: "✅", text: "Weekly goals and action items", category: "Productivity" },
  { icon: "🎯", text: "Product roadmap for Q1", category: "Planning" },
  { icon: "📖", text: "Book summary: Atomic Habits", category: "Reading" },
];

export function AISpotlight({ isOpen, onClose, onGenerate }: AISpotlightProps) {
  const [prompt, setPrompt] = useState("");
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    state, 
    steps, 
    error, 
    generate, 
    cancel, 
    reset,
    isLoading 
  } = useAIStream();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setPrompt("");
      reset();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, reset]);

  // Close on Escape (only when not loading)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose, isLoading]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    
    const result = await generate(prompt.trim());
    if (result) {
      onGenerate(result);
      setPrompt("");
      reset();
    }
  };

  // Show API key prompt if error is API_KEY_REQUIRED
  useEffect(() => {
    if (error === "API_KEY_REQUIRED") {
      setShowApiKeyPrompt(true);
    }
  }, [error]);

  const handleCancel = () => {
    cancel();
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
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {isLoading ? "Creating your note..." : "Describe what you want to create"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Input area - Hidden during generation */}
              {!isLoading && state !== "complete" && (
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
                      placeholder="e.g., Create notes about React hooks best practices..."
                      className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none"
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={!prompt.trim()}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
                        prompt.trim()
                          ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
                          : "bg-[var(--color-surface-muted)] text-[var(--color-text-subtle)]"
                      )}
                    >
                      <SparkleIcon className="w-4 h-4" />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Thinking Steps - Show during generation */}
              {isLoading && (
                <div className="p-4">
                  <ThinkingSteps steps={steps} />
                  
                  {/* Cancel button */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Error state */}
              {state === "error" && error && (
                <div className="p-4">
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button
                      onClick={reset}
                      className="mt-2 text-sm text-[var(--color-primary)] hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {/* Suggestions - Show when idle */}
              {state === "idle" && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-[var(--color-text-subtle)] mb-2">Try these examples:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPrompt(suggestion.text);
                          inputRef.current?.focus();
                        }}
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

          {/* API Key Prompt */}
          <ApiKeyPrompt
            isOpen={showApiKeyPrompt}
            onClose={() => {
              setShowApiKeyPrompt(false);
              reset();
            }}
            onSuccess={() => {
              setShowApiKeyPrompt(false);
              reset();
              // Retry generation
              if (prompt.trim()) {
                handleSubmit();
              }
            }}
            context="ai-generate"
          />
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Thinking Steps Component - Shows AI progress
 */
function ThinkingSteps({ steps }: { steps: ThinkingStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all",
            step.status === "active" && "bg-[var(--color-primary)]/10",
            step.status === "completed" && "opacity-60"
          )}
        >
          {/* Status indicator */}
          <div className="flex-shrink-0">
            {step.status === "pending" && (
              <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border)]" />
            )}
            {step.status === "active" && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent"
              />
            )}
            {step.status === "completed" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
              >
                <CheckIcon className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>

          {/* Message */}
          <span className={cn(
            "text-sm",
            step.status === "active" 
              ? "text-[var(--color-text)] font-medium" 
              : "text-[var(--color-text-muted)]"
          )}>
            {step.message}
          </span>

          {/* Thinking dots for active step */}
          {step.status === "active" && (
            <div className="ml-auto flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -4, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity, 
                    delay: i * 0.15 
                  }}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
                />
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
