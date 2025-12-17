#!/usr/bin/env node

/**
 * PWA Benchmark and Testing Script
 * 
 * This script helps verify PWA requirements and provides a checklist
 * Run: node scripts/pwa-benchmark.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 PWA Benchmark & Requirements Check");
console.log("=======================================\n");

const checks = [];
const publicDir = path.join(__dirname, "../public");
const appDir = path.join(__dirname, "../app");

// Check 1: Manifest file
const manifestPath = path.join(publicDir, "manifest.json");
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  checks.push({
    name: "Manifest file exists",
    status: true,
    details: `✓ Found manifest.json with name: "${manifest.name}"`,
  });

  // Check manifest requirements
  const requiredFields = ["name", "short_name", "start_url", "display", "icons"];
  const missingFields = requiredFields.filter((field) => !manifest[field]);
  if (missingFields.length === 0) {
    checks.push({
      name: "Manifest has required fields",
      status: true,
      details: "✓ All required fields present",
    });
  } else {
    checks.push({
      name: "Manifest has required fields",
      status: false,
      details: `✗ Missing: ${missingFields.join(", ")}`,
    });
  }

  // Check icons
  if (manifest.icons && manifest.icons.length > 0) {
    const iconSizes = manifest.icons.map((icon) => icon.sizes);
    checks.push({
      name: "Manifest defines icons",
      status: true,
      details: `✓ Icons defined: ${iconSizes.join(", ")}`,
    });
  } else {
    checks.push({
      name: "Manifest defines icons",
      status: false,
      details: "✗ No icons defined in manifest",
    });
  }
} else {
  checks.push({
    name: "Manifest file exists",
    status: false,
    details: "✗ manifest.json not found",
  });
}

// Check 2: Service Worker
const swPath = path.join(publicDir, "sw.js");
if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, "utf8");
  checks.push({
    name: "Service Worker exists",
    status: true,
    details: "✓ sw.js found",
  });

  // Check for required service worker features
  const hasInstall = swContent.includes("install");
  const hasActivate = swContent.includes("activate");
  const hasFetch = swContent.includes("fetch");

  if (hasInstall && hasActivate && hasFetch) {
    checks.push({
      name: "Service Worker has required events",
      status: true,
      details: "✓ Has install, activate, and fetch handlers",
    });
  } else {
    checks.push({
      name: "Service Worker has required events",
      status: false,
      details: `✗ Missing: ${[
        !hasInstall && "install",
        !hasActivate && "activate",
        !hasFetch && "fetch",
      ]
        .filter(Boolean)
        .join(", ")}`,
    });
  }
} else {
  checks.push({
    name: "Service Worker exists",
    status: false,
    details: "✗ sw.js not found",
  });
}

// Check 3: Icons
const icon192 = path.join(publicDir, "icon-192.png");
const icon512 = path.join(publicDir, "icon-512.png");
const iconSvg = path.join(appDir, "icon.svg");

if (fs.existsSync(icon192)) {
  checks.push({
    name: "192x192 icon exists",
    status: true,
    details: "✓ icon-192.png found",
  });
} else {
  checks.push({
    name: "192x192 icon exists",
    status: false,
    details: "✗ icon-192.png not found (optional, but recommended)",
  });
}

if (fs.existsSync(icon512)) {
  checks.push({
    name: "512x512 icon exists",
    status: true,
    details: "✓ icon-512.png found",
  });
} else {
  checks.push({
    name: "512x512 icon exists",
    status: false,
    details: "✗ icon-512.png not found (optional, but recommended)",
  });
}

if (fs.existsSync(iconSvg)) {
  checks.push({
    name: "Source SVG icon exists",
    status: true,
    details: "✓ icon.svg found (can be used to generate PNGs)",
  });
}

// Check 4: Layout metadata
const layoutPath = path.join(appDir, "layout.tsx");
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, "utf8");
  const hasManifest = layoutContent.includes("manifest");
  const hasViewport = layoutContent.includes("viewport");
  const hasThemeColor = layoutContent.includes("themeColor");

  if (hasManifest && hasViewport && hasThemeColor) {
    checks.push({
      name: "Layout has PWA metadata",
      status: true,
      details: "✓ Manifest, viewport, and themeColor configured",
    });
  } else {
    checks.push({
      name: "Layout has PWA metadata",
      status: false,
      details: `✗ Missing: ${[
        !hasManifest && "manifest",
        !hasViewport && "viewport",
        !hasThemeColor && "themeColor",
      ]
        .filter(Boolean)
        .join(", ")}`,
    });
  }
}

// Print results
console.log("Results:\n");
checks.forEach((check, index) => {
  const icon = check.status ? "✓" : "✗";
  const color = check.status ? "\x1b[32m" : "\x1b[33m";
  console.log(`${color}${icon}\x1b[0m ${check.name}`);
  console.log(`  ${check.details}\n`);
});

// Summary
const passed = checks.filter((c) => c.status).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log("Summary:");
console.log(`  ${passed}/${total} checks passed (${percentage}%)`);

if (percentage === 100) {
  console.log("\n🎉 All PWA requirements met! Your app is ready for installation.");
} else if (percentage >= 80) {
  console.log("\n✅ Most requirements met. Review the warnings above.");
} else {
  console.log("\n⚠️  Some requirements are missing. Please address the issues above.");
}

console.log("\n📋 Next Steps:");
console.log("1. Test in Chrome DevTools > Application > Manifest");
console.log("2. Test Service Worker in Application > Service Workers");
console.log("3. Run Lighthouse audit (F12 > Lighthouse > PWA)");
console.log("4. Test install prompt on mobile device");
console.log("5. Test offline functionality");

