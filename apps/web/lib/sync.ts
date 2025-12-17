/**
 * Client-side sync utilities
 * Handles offline queue and sync with server
 */

import { Note } from "./api";

export interface SyncQueueItem {
  id: string;
  type: "create" | "update" | "delete";
  note: Note;
  timestamp: string;
}

export interface SyncStatus {
  lastSyncAt: string | null;
  pendingChanges: number;
  isSyncing: boolean;
}

const SYNC_QUEUE_KEY = "notely-sync-queue";
const LAST_SYNC_KEY = "notely-last-sync";
const DEVICE_ID_KEY = "notely-device-id";

/**
 * Get or create device ID
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Get sync queue from localStorage
 */
export function getSyncQueue(): SyncQueueItem[] {
  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
}

/**
 * Add item to sync queue
 */
export function addToSyncQueue(type: "create" | "update" | "delete", note: Note): void {
  const queue = getSyncQueue();
  
  // Remove existing item for this note
  const filtered = queue.filter((item) => item.note.id !== note.id);
  
  // Add new item
  filtered.push({
    id: `${type}-${note.id}-${Date.now()}`,
    type,
    note,
    timestamp: new Date().toISOString(),
  });
  
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
}

/**
 * Clear sync queue
 */
export function clearSyncQueue(): void {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

/**
 * Get last sync timestamp
 */
export function getLastSyncAt(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

/**
 * Set last sync timestamp
 */
export function setLastSyncAt(timestamp: string): void {
  localStorage.setItem(LAST_SYNC_KEY, timestamp);
}

/**
 * Check if there are pending changes
 */
export function hasPendingChanges(): boolean {
  return getSyncQueue().length > 0;
}

/**
 * Get sync status
 */
export function getSyncStatus(): SyncStatus {
  return {
    lastSyncAt: getLastSyncAt(),
    pendingChanges: getSyncQueue().length,
    isSyncing: false, // This would be managed by the sync hook
  };
}

