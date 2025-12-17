"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "./Icons";

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Check for updates periodically
    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setRegistration(reg);
          
          // Check for updates
          await reg.update();
          
          // Listen for new service worker
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New service worker available
                  setShowUpdate(true);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    // Check immediately
    checkForUpdates();

    // Check every 5 minutes (good balance between responsiveness and battery/data usage)
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = async () => {
    if (!registration) return;

    try {
      // Tell the service worker to skip waiting and activate
      const worker = registration.waiting;
      if (worker) {
        worker.postMessage({ type: "SKIP_WAITING" });
      }

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error updating:", error);
      // Fallback: just reload
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg p-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">
                New version available!
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Click update to get the latest features and improvements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Update
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Dismiss"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
