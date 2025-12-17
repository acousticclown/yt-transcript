"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type ShortcutHandler = () => void;

type UseKeyboardShortcutsOptions = {
  onSearch?: ShortcutHandler;
  onNewNote?: ShortcutHandler;
  enabled?: boolean;
};

export function useKeyboardShortcuts({
  onSearch,
  onNewNote,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape to work even in inputs
        if (e.key !== "Escape") return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K - Search
      if (isMod && e.key === "k") {
        e.preventDefault();
        onSearch?.();
      }

      // Cmd/Ctrl + N - New Note
      if (isMod && e.key === "n") {
        e.preventDefault();
        if (onNewNote) {
          onNewNote();
        } else {
          router.push("/notes/new");
        }
      }

      // Cmd/Ctrl + / - Go to dashboard
      if (isMod && e.key === "/") {
        e.preventDefault();
        router.push("/dashboard");
      }
    },
    [enabled, onSearch, onNewNote, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

