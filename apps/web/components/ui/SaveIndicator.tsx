"use client";

import { motion, AnimatePresence } from "framer-motion";

type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveIndicator({ state }: { state: SaveState }) {
  return (
    <AnimatePresence mode="wait">
      {state !== "idle" && (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5 text-xs"
        >
          {state === "saving" && (
            <>
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <span className="text-[var(--color-text-muted)]">Saving</span>
            </>
          )}
          {state === "saved" && (
            <>
              <motion.svg
                className="w-3.5 h-3.5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </motion.svg>
              <span className="text-green-600 dark:text-green-400">Saved</span>
            </>
          )}
          {state === "error" && (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-red-500">Failed</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

