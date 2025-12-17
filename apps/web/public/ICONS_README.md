# PWA Icons

This directory should contain the following PWA icon files:

- `icon-192.png` - 192x192 pixels (for Android, iOS)
- `icon-512.png` - 512x512 pixels (for Android, splash screens)

## Generating Icons

### Option 1: Online Tools
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `app/icon.svg`
3. Download the generated PNG files
4. Place them in the `public/` directory

### Option 2: ImageMagick
```bash
convert -background none -resize 192x192 app/icon.svg public/icon-192.png
convert -background none -resize 512x512 app/icon.svg public/icon-512.png
```

### Option 3: Sharp (Node.js)
```bash
npm install sharp --save-dev
node scripts/generate-icons-sharp.js
```

## Note

The app will work without these icons, but they're required for:
- Proper PWA installation experience
- App icons on home screens
- Splash screens on mobile devices

