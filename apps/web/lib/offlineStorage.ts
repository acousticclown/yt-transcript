"use client";

// Offline storage utilities for PWA
// Stores notes locally when offline, syncs when online

const OFFLINE_NOTES_KEY = "notely-offline-notes";
const OFFLINE_QUEUE_KEY = "notely-offline-queue";

export type OfflineNote = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  language: string;
  sections: any[];
  timestamp: number;
  action: "create" | "update" | "delete";
};

// Save note to offline storage
export function saveNoteOffline(note: OfflineNote): void {
  if (typeof window === "undefined") return;

  try {
    const existing = getOfflineNotes();
    const index = existing.findIndex((n) => n.id === note.id);

    if (index >= 0) {
      existing[index] = note;
    } else {
      existing.push(note);
    }

    localStorage.setItem(OFFLINE_NOTES_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error("Failed to save note offline:", error);
  }
}

// Get all offline notes
export function getOfflineNotes(): OfflineNote[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(OFFLINE_NOTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get offline notes:", error);
    return [];
  }
}

// Add to sync queue (for when we come back online)
export function addToSyncQueue(noteId: string, action: "create" | "update" | "delete", data?: any): void {
  if (typeof window === "undefined") return;

  try {
    const queue = getSyncQueue();
    queue.push({
      noteId,
      action,
      data,
      timestamp: Date.now(),
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to add to sync queue:", error);
  }
}

// Get sync queue
export function getSyncQueue(): Array<{ noteId: string; action: string; data?: any; timestamp: number }> {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get sync queue:", error);
    return [];
  }
}

// Clear sync queue
export function clearSyncQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// Check if online
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

// Listen for online/offline events
export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

