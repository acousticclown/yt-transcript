#!/usr/bin/env node

/**
 * Generate PWA icons from SVG using Sharp
 * Run: npm install sharp --save-dev && node scripts/generate-icons-sharp.js
 */

const fs = require("fs");
const path = require("path");

// Check if sharp is installed
let sharp;
try {
  sharp = require("sharp");
} catch (error) {
  console.error("❌ Sharp is not installed.");
  console.log("\n📦 Installing sharp...");
  console.log("   Run: npm install sharp --save-dev");
  console.log("   Then run this script again.\n");
  process.exit(1);
}

const appDir = path.join(__dirname, "../app");
const publicDir = path.join(__dirname, "../public");
const iconSvg = path.join(appDir, "icon.svg");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateIcons() {
  console.log("🎨 Generating PWA icons from SVG...\n");

  if (!fs.existsSync(iconSvg)) {
    console.error(`❌ Source icon not found: ${iconSvg}`);
    process.exit(1);
  }

  const sizes = [
    { size: 192, filename: "icon-192.png" },
    { size: 512, filename: "icon-512.png" },
  ];

  try {
    for (const { size, filename } of sizes) {
      const outputPath = path.join(publicDir, filename);
      
      await sharp(iconSvg)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${filename} (${size}x${size})`);
    }

    console.log("\n🎉 All icons generated successfully!");
    console.log(`📁 Icons saved to: ${publicDir}\n`);
  } catch (error) {
    console.error("❌ Error generating icons:", error.message);
    process.exit(1);
  }
}

generateIcons();

