/**
 * Copy Next.js build output to a static directory for Capacitor
 * This handles the dynamic routes by creating a simple HTML fallback
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NEXT_DIR = path.join(__dirname, '../.next');
const OUT_DIR = path.join(__dirname, '../out');
const REQUESTS_ID_DIR = path.join(OUT_DIR, 'requests', '[id]');

console.log('🔄 Preparing static export for Capacitor...');

// Create out directory structure
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Copy static files from .next
console.log('📁 Copying static files...');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy .next/static to out/_next/static
if (fs.existsSync(path.join(NEXT_DIR, 'static'))) {
  const staticDest = path.join(OUT_DIR, '_next', 'static');
  copyRecursive(path.join(NEXT_DIR, 'static'), staticDest);
  console.log('✅ Copied static assets');
}

// Copy HTML files from .next/server/app to out
const serverAppDir = path.join(NEXT_DIR, 'server', 'app');
if (fs.existsSync(serverAppDir)) {
  const files = fs.readdirSync(serverAppDir);
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const srcFile = path.join(serverAppDir, file);
      const destFile = path.join(OUT_DIR, file === 'index.html' ? 'index.html' : file.replace('.html', '/index.html'));
      const destDir = path.dirname(destFile);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(srcFile, destFile);
    }
  });
  console.log('✅ Copied HTML files');
}

// Create index.html if it doesn't exist (copy from .next/server/app/index.html or create new)
if (!fs.existsSync(path.join(OUT_DIR, 'index.html'))) {
  const nextIndexHtml = path.join(serverAppDir, 'index.html');
  if (fs.existsSync(nextIndexHtml)) {
    fs.copyFileSync(nextIndexHtml, path.join(OUT_DIR, 'index.html'));
  } else {
    // Create a simple index.html that redirects to /app
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pikkrr</title>
  <script>
    window.location.href = '/app/';
  </script>
</head>
<body>
  <p>Loading...</p>
</body>
</html>`;
    fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml);
  }
  console.log('✅ Created index.html');
}

// Create a simple HTML file for dynamic routes
if (!fs.existsSync(REQUESTS_ID_DIR)) {
  fs.mkdirSync(REQUESTS_ID_DIR, { recursive: true });
}

// Create index.html for dynamic route that loads the app
const dynamicRouteHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pikkrr - Request Details</title>
  <script>
    // Load the main app - client-side routing will handle the dynamic route
    window.location.href = '/app/';
  </script>
</head>
<body>
  <p>Loading request details...</p>
</body>
</html>`;

fs.writeFileSync(path.join(REQUESTS_ID_DIR, 'index.html'), dynamicRouteHtml);

console.log('✅ Static export prepared!');
console.log('📦 Output directory: out/');
console.log('✨ You can now run: npx cap sync');

