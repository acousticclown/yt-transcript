# PWA Testing Guide

This guide helps you test and benchmark the PWA features of Notely.

## Quick Benchmark

Run the automated benchmark:
```bash
cd apps/web
node scripts/pwa-benchmark.js
```

## Manual Testing Checklist

### 1. Manifest Validation

**Chrome DevTools:**
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** in the left sidebar
4. Verify:
   - ✅ Manifest is valid
   - ✅ Icons are defined (may show warnings if PNGs missing)
   - ✅ Start URL is correct
   - ✅ Display mode is "standalone"
   - ✅ Theme color matches

**Expected Score:** 100% (except for missing icons)

### 2. Service Worker Testing

**Chrome DevTools:**
1. Go to **Application** > **Service Workers**
2. Verify:
   - ✅ Service Worker is registered
   - ✅ Status is "activated and is running"
   - ✅ Scope matches your domain

**Test Offline:**
1. Check "Offline" checkbox in Service Workers panel
2. Refresh the page
3. Verify app still loads (from cache)
4. Uncheck "Offline" to go back online

### 3. Install Prompt Testing

**Desktop (Chrome/Edge):**
1. Visit the app
2. Look for install button in address bar (or use menu)
3. Click install
4. Verify app opens in standalone window
5. Check that it appears in your applications list

**Mobile (Android Chrome):**
1. Visit the app
2. Look for "Add to Home Screen" banner
3. Or use browser menu > "Add to Home Screen"
4. Verify app icon appears on home screen
5. Launch app - should open in standalone mode

**iOS Safari:**
1. Visit the app
2. Tap Share button
3. Select "Add to Home Screen"
4. Verify app icon appears
5. Launch app - should open in standalone mode

### 4. Lighthouse PWA Audit

**Run Lighthouse:**
1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **Progressive Web App** category
4. Click "Generate report"

**Target Scores:**
- ✅ Installable: 100%
- ✅ PWA Optimized: 90%+
- ✅ Fast and Reliable: 90%+

**Common Issues:**
- Missing icons (192x192, 512x512) - Generate from SVG
- HTTPS required - Use localhost for testing, HTTPS for production
- Service Worker errors - Check console for issues

### 5. Offline Functionality

**Test Offline Viewing:**
1. Visit app while online (to cache assets)
2. Go offline (DevTools > Network > Offline)
3. Navigate between pages
4. Verify pages load from cache

**Test Offline Editing:**
1. Go offline
2. Create/edit a note
3. Verify changes are saved locally
4. Go back online
5. Verify sync happens (if implemented)

### 6. App Shortcuts

**Test Shortcuts:**
1. Install the app
2. Right-click app icon (desktop) or long-press (mobile)
3. Verify shortcuts appear:
   - "New Note"
   - "YouTube Notes"

### 7. Share Target (if implemented)

**Test Share:**
1. Install the app
2. Share a YouTube URL from another app
3. Verify "Notely" appears in share menu
4. Verify it opens with the URL

## Generating Icons

To generate the required PNG icons:

### Option 1: Online Tool
1. Visit https://realfavicongenerator.net/
2. Upload `apps/web/app/icon.svg`
3. Download generated icons
4. Place in `apps/web/public/`

### Option 2: ImageMagick
```bash
convert -background none -resize 192x192 app/icon.svg public/icon-192.png
convert -background none -resize 512x512 app/icon.svg public/icon-512.png
```

### Option 3: Sharp (Node.js)
```bash
npm install sharp --save-dev
# Then use the generate-icons-sharp.js script
```

## Production Checklist

Before deploying to production:

- [ ] Generate and add icon-192.png
- [ ] Generate and add icon-512.png
- [ ] Test on real mobile device
- [ ] Run Lighthouse audit (target 90%+)
- [ ] Test offline functionality
- [ ] Verify install prompt works
- [ ] Test app shortcuts
- [ ] Verify HTTPS is enabled
- [ ] Test on multiple browsers (Chrome, Edge, Safari)

## Troubleshooting

### Install Prompt Not Showing
- Ensure HTTPS (or localhost)
- Check manifest is valid
- Verify service worker is registered
- Check browser console for errors

### Service Worker Not Registering
- Check browser console for errors
- Verify sw.js is accessible
- Check service worker scope
- Clear browser cache and try again

### Icons Not Showing
- Verify icon files exist in public/
- Check manifest icon paths are correct
- Clear browser cache
- Regenerate icons if corrupted

## Performance Targets

- **First Contentful Paint:** < 1.8s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.8s
- **Cumulative Layout Shift:** < 0.1
- **Total Blocking Time:** < 200ms

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Lighthouse PWA Audit](https://web.dev/lighthouse-pwa/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)

