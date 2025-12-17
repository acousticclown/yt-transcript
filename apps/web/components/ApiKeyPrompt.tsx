"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SparklesIcon } from "./Icons";

type ApiKeyPromptProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  context?: "youtube" | "ai-generate" | "inline-action";
};

const contextMessages = {
  youtube: "Connect your Gemini API key to generate notes from YouTube videos.",
  "ai-generate": "Connect your Gemini API key to generate AI-powered notes.",
  "inline-action": "Connect your Gemini API key to use AI text actions.",
};

export function ApiKeyPrompt({ isOpen, onClose, onSuccess, context = "ai-generate" }: ApiKeyPromptProps) {
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!apiKey.trim()) return;

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/auth/gemini-key", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid API key");
      } else {
        onSuccess?.();
        // Don't call onClose here - onSuccess handles it
      }
    } catch (err) {
      setError("Failed to connect. Please try again.");
    } finally {
      setSaving(false);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-xl z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Connect Gemini AI
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  One-time setup
                </p>
              </div>
            </div>

            {/* Message */}
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              {contextMessages[context]}
            </p>

            {/* Input */}
            <div className="space-y-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Gemini API key"
                className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-primary)]"
                autoFocus
              />

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <p className="text-xs text-[var(--color-text-subtle)]">
                Get a free API key from{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Google AI Studio →
                </a>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-xl transition-colors"
              >
                Maybe later
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !apiKey.trim()}
                className="flex-1 px-4 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-xl hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Connecting..." : "Connect"}
              </button>
            </div>

            {/* Skip info */}
            <p className="mt-4 text-center text-xs text-[var(--color-text-subtle)]">
              You can also do this later in{" "}
              <Link href="/settings" className="text-[var(--color-primary)] hover:underline" onClick={onClose}>
                Settings
              </Link>
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to check API key status and show prompt when needed
export function useApiKeyCheck() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptContext, setPromptContext] = useState<"youtube" | "ai-generate" | "inline-action">("ai-generate");
  const resolveRef = useRef<((hasKey: boolean) => void) | null>(null);

  const checkAndPrompt = (context: "youtube" | "ai-generate" | "inline-action" = "ai-generate"): Promise<boolean> => {
    return new Promise(async (resolve) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          resolve(false);
          return;
        }

        const res = await fetch("http://localhost:3001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          resolve(false);
          return;
        }
        
        const data = await res.json();
        
        if (!data.user?.hasGeminiKey) {
          setPromptContext(context);
          setShowPrompt(true);
          // Store resolve to call when user connects or dismisses
          resolveRef.current = resolve;
          return;
        }
        
        resolve(true);
      } catch {
        resolve(false);
      }
    });
  };

  const handleClose = (connected: boolean) => {
    setShowPrompt(false);
    // Resolve the promise with whether key was connected
    resolveRef.current?.(connected);
    resolveRef.current = null;
  };

  return {
    showPrompt,
    promptContext,
    handleClose,
    checkAndPrompt,
  };
}

