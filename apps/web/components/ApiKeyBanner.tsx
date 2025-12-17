"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useUser } from "../lib/UserContext";
import { SparklesIcon } from "./Icons";

export function ApiKeyBanner() {
  const { user } = useUser();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has dismissed the banner this session
    const sessionDismissed = sessionStorage.getItem("apiKeyBannerDismissed");
    if (sessionDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("apiKeyBannerDismissed", "true");
  };

  // Don't show if: not mounted, user has key, or dismissed
  if (!mounted || user?.hasGeminiKey || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Connect Gemini AI for full features
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              YouTube transcription, AI note generation, and more require an API key.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link
                href="/settings"
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Connect in Settings →
              </Link>
              <button
                onClick={handleDismiss}
                className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

