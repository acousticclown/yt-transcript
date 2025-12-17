"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDeviceId,
  getSyncQueue,
  clearSyncQueue,
  getLastSyncAt,
  setLastSyncAt,
  addToSyncQueue,
  type SyncQueueItem,
} from "../sync";
import { notesApi } from "../api";

/**
 * Hook for syncing notes across devices
 */
export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const deviceId = getDeviceId();
  const lastSyncAt = getLastSyncAt();

  // Check sync status
  const { data: syncStatus } = useQuery({
    queryKey: ["sync", "status"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sync/status?lastSyncAt=${lastSyncAt || ""}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to get sync status");
      return response.json();
    },
    enabled: !!localStorage.getItem("token"),
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Pull changes from server
  const pullMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sync/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          lastSyncAt,
          deviceId,
        }),
      });
      if (!response.ok) throw new Error("Failed to pull sync");
      return response.json();
    },
    onSuccess: (data) => {
      // Update local cache with pulled notes
      queryClient.setQueryData(["notes"], (old: any) => {
        if (!old) return data.notes;
        
        const noteMap = new Map(old.map((n: any) => [n.id, n]));
        data.notes.forEach((note: any) => {
          noteMap.set(note.id, note);
        });
        
        return Array.from(noteMap.values());
      });
      
      setLastSyncAt(data.serverTime);
    },
  });

  // Push changes to server
  const pushMutation = useMutation({
    mutationFn: async (queue: SyncQueueItem[]) => {
      const notes = queue.map((item) => item.note);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sync/push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          notes,
          deviceId,
        }),
      });
      if (!response.ok) throw new Error("Failed to push sync");
      return response.json();
    },
    onSuccess: (data) => {
      // Clear successfully synced items
      const queue = getSyncQueue();
      const syncedIds = new Set([...data.created, ...data.updated]);
      const remaining = queue.filter((item) => !syncedIds.has(item.note.id));
      localStorage.setItem("notely-sync-queue", JSON.stringify(remaining));
      
      // Refresh notes
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setLastSyncAt(data.serverTime);
    },
  });

  // Full sync: pull then push
  const sync = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      // First pull changes from server
      await pullMutation.mutateAsync();
      
      // Then push local changes
      const queue = getSyncQueue();
      if (queue.length > 0) {
        await pushMutation.mutateAsync(queue);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, pullMutation, pushMutation]);

  // Auto-sync on mount and when online
  useEffect(() => {
    if (navigator.onLine) {
      sync();
    }

    const handleOnline = () => {
      sync();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [sync]);

  // Periodic sync (every 5 minutes)
  useEffect(() => {
    if (!navigator.onLine) return;
    
    const interval = setInterval(() => {
      sync();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [sync]);

  return {
    sync,
    isSyncing,
    syncStatus,
    pendingChanges: getSyncQueue().length,
    lastSyncAt,
  };
}

/**
 * Hook to add note to sync queue (for offline support)
 */
export function useSyncQueue() {
  const addToQueue = useCallback((type: "create" | "update" | "delete", note: any) => {
    addToSyncQueue(type, note);
  }, []);

  return { addToQueue };
}

