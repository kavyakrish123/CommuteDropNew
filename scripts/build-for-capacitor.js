/**
 * Build script for Capacitor that handles dynamic routes
 * This script temporarily renames dynamic route folders, builds, then restores them
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// No longer needed - using catch-all route [...id] instead
// const DYNAMIC_ROUTE = path.join(__dirname, '../src/app/requests/[id]');
// const TEMP_ROUTE = path.join(__dirname, '../src/app/requests/_id_temp');

console.log('🔄 Building Next.js app for Capacitor...');

try {
  // Build Next.js app (regular build)
  console.log('🔨 Building Next.js app...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
  // Copy and prepare static files for Capacitor
  console.log('📦 Preparing static export...');
  execSync('node scripts/copy-next-build.js', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('✨ Done! You can now run: npx cap sync');

