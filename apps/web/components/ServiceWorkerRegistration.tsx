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

        // Check for updates on page load
        registration.update();

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // New service worker available (waiting to activate)
                  console.log("🔄 New service worker available");
                  // The UpdateNotification component will handle showing the UI
                } else {
                  // First time installation
                  console.log("✅ Service Worker installed for the first time");
                }
              }
            });
          }
        });

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
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

