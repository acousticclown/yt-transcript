# PWA Update System

## Overview

The PWA update system ensures that users always get the latest version of the app, even when cached by the service worker.

## How It Works

### 1. Cache Versioning

- Each build generates a unique cache version based on timestamp
- The version is injected into `sw.js` from `sw.source.js` template
- Old caches are automatically cleaned up when a new version is detected

### 2. Update Detection

- Service worker checks for updates on page load
- Periodic checks every hour
- When a new service worker is detected, an update notification appears

### 3. Update Notification

- A non-intrusive notification appears at the top of the screen
- Users can click "Update" to reload with the new version
- Users can dismiss the notification (it will reappear on next check)

### 4. Automatic Cache Cleanup

- Old caches are deleted when a new service worker activates
- Only the current cache version and runtime cache are kept

## Build Process

The cache version is automatically injected before each build:

```bash
npm run build  # Automatically runs inject-sw-version.js
npm run dev    # Also runs inject-sw-version.js for development
```

## Manual Update

To manually trigger a cache version update:

```bash
npm run inject-sw-version
```

## Files

- `public/sw.source.js` - Service worker template with `__CACHE_VERSION__` placeholder
- `public/sw.js` - Generated service worker with actual cache version (auto-generated)
- `scripts/inject-sw-version.js` - Script that injects cache version
- `components/UpdateNotification.tsx` - UI component for update notifications
- `components/ServiceWorkerRegistration.tsx` - Service worker registration and update checking

## Testing Updates

1. Make a change to the app
2. Run `npm run build`
3. Deploy the new version
4. Open the app in a browser (with existing service worker)
5. The update notification should appear
6. Click "Update" to reload with the new version

## Troubleshooting

### Updates not showing

- Check browser console for service worker errors
- Verify `sw.js` has a new cache version
- Clear browser cache and reload
- Check that service worker is registered (Application tab in DevTools)

### Old version still showing

- Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Clear site data in browser settings
- Unregister service worker in DevTools and reload

