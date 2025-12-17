const fs = require('fs');
const path = require('path');

// Generate a unique cache version based on timestamp
const CACHE_VERSION = `notely-${Date.now()}`;

// Paths
const swSourcePath = path.join(__dirname, '../public/sw.source.js');
const swOutputPath = path.join(__dirname, '../public/sw.js');

// Check if source exists
if (!fs.existsSync(swSourcePath)) {
  console.error('❌ sw.source.js not found!');
  process.exit(1);
}

// Read the service worker source
let swContent = fs.readFileSync(swSourcePath, 'utf8');

// Replace placeholders with actual version
swContent = swContent.replace(/__CACHE_VERSION__/g, CACHE_VERSION);

// Write the updated service worker
fs.writeFileSync(swOutputPath, swContent, 'utf8');

console.log(`✅ Service Worker cache version updated: ${CACHE_VERSION}`);

