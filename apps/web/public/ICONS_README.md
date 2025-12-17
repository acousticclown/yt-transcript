# PWA Icons

This directory contains the PWA icon files:

- `icon-192.png` - 192x192 pixels (for Android, iOS)
- `icon-512.png` - 512x512 pixels (for Android, splash screens)

## Regenerating Icons

If you need to regenerate the icons (e.g., after updating `app/icon.svg`):

```bash
npm run generate-icons
```

Or manually:
```bash
node scripts/generate-icons-sharp.js
```

## Alternative Methods

### Online Tools
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `app/icon.svg`
3. Download the generated PNG files
4. Place them in the `public/` directory

### ImageMagick
```bash
convert -background none -resize 192x192 app/icon.svg public/icon-192.png
convert -background none -resize 512x512 app/icon.svg public/icon-512.png
```

