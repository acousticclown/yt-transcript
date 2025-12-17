# Lighthouse PWA Audit Checklist

## Pre-Audit Setup

1. **Build the app:**
   ```bash
   cd apps/web
   npm run build
   npm run start
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:3000`
   - Ensure service worker is registered (check DevTools > Application > Service Workers)

3. **Run PWA benchmark:**
   ```bash
   node scripts/pwa-benchmark.js
   ```
   Should show 100% pass rate.

## Running Lighthouse Audit

1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select:
   - ✅ **Progressive Web App** category
   - ✅ **Desktop** or **Mobile** (test both)
4. Click **Generate report**

## Target Scores

### PWA Category
- **Installable:** 100% ✅
- **PWA Optimized:** 100% ✅
- **Fast and Reliable:** 90%+ ✅

### Performance
- **First Contentful Paint:** < 1.8s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.8s
- **Cumulative Layout Shift:** < 0.1
- **Total Blocking Time:** < 200ms

## Common Issues & Fixes

### ❌ "Manifest doesn't have a maskable icon"
**Fix:** Ensure icons have `"purpose": "maskable"` entry (already fixed)

### ❌ "Icons don't meet size requirements"
**Fix:** Verify icon-192.png and icon-512.png exist and are correct sizes
```bash
# Check icon sizes
file public/icon-192.png
file public/icon-512.png
```

### ❌ "Service Worker doesn't provide an offline page"
**Fix:** Service worker should cache "/" for offline fallback (already implemented)

### ❌ "Does not provide a valid apple-touch-icon"
**Fix:** Already configured in layout.tsx metadata

### ❌ "Theme color doesn't match"
**Fix:** Ensure theme color in manifest matches viewport themeColor
- Manifest: `"theme_color": "#F5A623"`
- Viewport: `themeColor: "#F5A623"`

### ❌ "Does not redirect HTTP traffic to HTTPS"
**Fix:** Only applies in production. Use HTTPS in production.

### ❌ "Page load is not fast enough on 3G"
**Fix:** 
- Optimize bundle size
- Lazy load components
- Use Next.js Image optimization
- Enable compression

## Verification Checklist

Before running audit, verify:

- [ ] Manifest file exists and is valid JSON
- [ ] Service worker is registered and active
- [ ] Icons (192x192 and 512x512) exist in public/
- [ ] Theme color matches in manifest and viewport
- [ ] App works offline (test in DevTools > Network > Offline)
- [ ] Install prompt appears (or can be triggered)
- [ ] HTTPS enabled (or localhost for testing)

## Post-Audit Actions

1. **Document scores:** Record Lighthouse scores
2. **Fix issues:** Address any failures
3. **Re-audit:** Run again to verify fixes
4. **Screenshot:** Save audit report for documentation

## Expected Results

With all fixes applied, you should see:

✅ **Installable: 100%**
- Manifest is valid
- Icons are provided
- Service worker registered
- Served over HTTPS (or localhost)

✅ **PWA Optimized: 100%**
- All PWA best practices followed
- Fast load times
- Offline support

✅ **Fast and Reliable: 90%+**
- Good performance metrics
- Reliable loading
- Proper caching

## Notes

- Lighthouse requires HTTPS in production (localhost is OK for dev)
- Some metrics may vary based on network conditions
- Run audit multiple times for consistency
- Test on both desktop and mobile views

