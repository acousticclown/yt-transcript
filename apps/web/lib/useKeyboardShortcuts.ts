"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type ShortcutHandler = () => void;

type UseKeyboardShortcutsOptions = {
  onSearch?: ShortcutHandler;
  onNewNote?: ShortcutHandler;
  onClose?: ShortcutHandler; // For closing modals/dropdowns
  onYouTube?: ShortcutHandler; // Go to YouTube page
  enabled?: boolean;
};

export function useKeyboardShortcuts({
  onSearch,
  onNewNote,
  onClose,
  onYouTube,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const isMod = e.metaKey || e.ctrlKey;

      // Escape - Close modals/dropdowns (works even in inputs)
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K - Search
      if (isMod && e.key === "k") {
        e.preventDefault();
        onSearch?.();
        return;
      }

      // Cmd/Ctrl + N - New Note
      if (isMod && e.key === "n") {
        e.preventDefault();
        if (onNewNote) {
          onNewNote();
        } else {
          router.push("/notes/new");
        }
        return;
      }

      // Cmd/Ctrl + / - Go to dashboard
      if (isMod && e.key === "/") {
        e.preventDefault();
        router.push("/dashboard");
        return;
      }

      // Cmd/Ctrl + Y - Go to YouTube page
      if (isMod && e.key === "y") {
        e.preventDefault();
        if (onYouTube) {
          onYouTube();
        } else {
          router.push("/youtube");
        }
        return;
      }
    },
    [enabled, onSearch, onNewNote, onClose, onYouTube, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

