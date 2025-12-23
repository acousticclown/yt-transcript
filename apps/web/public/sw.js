// Notely Service Worker
// Version: notely-1766504400024

'use strict';

const CACHE_NAME = "notely-1766504400024";
const RUNTIME_CACHE = "notely-runtime";

// Install event - cache essential assets only
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache essential static assets that definitely exist
      const essentialAssets = [
        "/",
        "/manifest.json",
        "/icon.svg",
      ];
      
      // Try to cache icons if they exist, but don't fail if they don't
      return Promise.allSettled(
        essentialAssets.map((url) => cache.add(url))
      ).then(() => {
        // Try to cache icons separately (optional)
        return Promise.allSettled([
          cache.add("/icon-192.png").catch(() => null),
          cache.add("/icon-512.png").catch(() => null),
        ]);
      });
    }).catch((error) => {
      console.error("Service Worker install failed:", error);
      // Don't fail the installation if caching fails
    })
  );
  self.skipWaiting();
});

// Listen for skip waiting message from client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch (error) {
    console.error("Invalid URL in service worker:", error);
    return;
  }

  // Skip API calls (they need to be online)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Skip external URLs - check if origin matches
  try {
    const swOrigin = self.location ? self.location.origin : url.origin;
    if (url.origin !== swOrigin) {
      return;
    }
  } catch (e) {
    // If we can't determine origin, skip this request
    console.warn("Could not determine origin, skipping:", url.href);
    return;
  }

  // Skip service worker and manifest requests (they're handled separately)
  if (url.pathname === "/sw.js" || url.pathname === "/manifest.json") {
    return;
  }

  // CRITICAL: Never cache Next.js chunks - they have their own versioning
  // Caching them causes "Failed to load chunk" errors after new deployments
  if (url.pathname.startsWith("/_next/static/chunks/") || 
      url.pathname.startsWith("/_next/static/css/") ||
      url.pathname.startsWith("/_next/static/media/")) {
    // Network-first for chunks (always fetch fresh)
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Try to fetch from network
      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200) {
            return response;
          }

          // Only cache same-origin responses
          // Don't cache Next.js chunks (already handled above, but double-check)
          if (response.type === "basic" || response.type === "cors") {
            // Only cache static assets (images, fonts, icons) and HTML pages
            const shouldCache = 
              url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/i) ||
              request.destination === "document" ||
              request.destination === "image" ||
              request.destination === "font";

            if (shouldCache) {
              // Clone the response for caching
              const responseToCache = response.clone();

              // Cache in background (don't block response)
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseToCache).catch((err) => {
                  console.warn("Failed to cache response:", err);
                });
              });
            }
          }

          return response;
        })
        .catch((error) => {
          // If fetch fails and we're offline, try to return a fallback
          if (request.destination === "document") {
            return caches.match("/").catch(() => {
              // If even the fallback fails, return a basic error response
              return new Response("Offline - content not available", {
                status: 503,
                statusText: "Service Unavailable",
              });
            });
          }
          // For non-document requests, rethrow to let browser handle
          throw error;
        });
    }).catch((error) => {
      console.error("Service Worker fetch error:", error);
      // Return a basic error response
      return new Response("Network error", {
        status: 408,
        statusText: "Request Timeout",
      });
    })
  );
});

