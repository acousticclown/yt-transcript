"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Check if we're in a secure context (required for service workers)
    if (!window.isSecureContext && window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      console.warn("⚠️ Service Workers require HTTPS (or localhost)");
      return;
    }

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("✅ Service Worker registered:", registration.scope);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New service worker available
                console.log("🔄 New service worker available");
                // Optionally show a notification to reload
                if (window.confirm("New version available! Reload to update?")) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("❌ Service Worker registration failed:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        
        // If registration fails, try to unregister any existing service workers
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().then(() => {
              console.log("Unregistered old service worker");
            });
          });
        });
      });
  }, []);

  return null;
}

