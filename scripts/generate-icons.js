const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, '../FigmaDesigns/icon/Pikkrr_Icon_1.png');
const publicDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Icon sizes for PWA and mobile platforms
const iconSizes = [
  // PWA standard sizes
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  
  // iOS sizes
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 76, name: 'apple-touch-icon-76x76.png' },
  { size: 60, name: 'apple-touch-icon-60x60.png' },
  
  // Android sizes
  { size: 144, name: 'icon-144x144.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 48, name: 'icon-48x48.png' },
  
  // Favicon sizes
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
];

async function generateIcons() {
  try {
    // Check if source icon exists
    if (!fs.existsSync(sourceIcon)) {
      console.error(`❌ Source icon not found: ${sourceIcon}`);
      process.exit(1);
    }

    console.log('🖼️  Generating PWA icons from:', sourceIcon);
    console.log('📁 Output directory:', publicDir);
    console.log('');

    // Generate all icon sizes
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(publicDir, name);
      
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    // Also create a favicon.ico (using 32x32 as base)
    const favicon32Path = path.join(publicDir, 'favicon-32x32.png');
    const faviconPath = path.join(publicDir, 'favicon.ico');
    
    if (fs.existsSync(favicon32Path)) {
      // For ICO, we'll just copy the 32x32 PNG (browsers accept PNG as favicon)
      fs.copyFileSync(favicon32Path, faviconPath);
      console.log('✅ Generated favicon.ico');
    }

    // Create icon.svg reference (we'll use the PNG as a fallback)
    // For now, we'll keep the existing icon.svg or create a simple one
    const iconSvgPath = path.join(publicDir, 'icon.svg');
    if (!fs.existsSync(iconSvgPath)) {
      // Create a simple SVG that references the PNG
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <image href="/icon-512x512.png" width="512" height="512"/>
</svg>`;
      fs.writeFileSync(iconSvgPath, svgContent);
      console.log('✅ Created icon.svg');
    }

    // Generate Android launcher icons for different densities
    console.log('');
    console.log('📱 Generating Android launcher icons...');
    const androidIconSizes = [
      { density: 'mdpi', size: 48 },
      { density: 'hdpi', size: 72 },
      { density: 'xhdpi', size: 96 },
      { density: 'xxhdpi', size: 144 },
      { density: 'xxxhdpi', size: 192 },
    ];

    const androidResDir = path.join(__dirname, '../android/app/src/main/res');
    if (fs.existsSync(androidResDir)) {
      for (const { density, size } of androidIconSizes) {
        const mipmapDir = path.join(androidResDir, `mipmap-${density}`);
        if (fs.existsSync(mipmapDir)) {
          const outputPath = path.join(mipmapDir, 'ic_launcher.png');
          const outputPathRound = path.join(mipmapDir, 'ic_launcher_round.png');
          const outputPathForeground = path.join(mipmapDir, 'ic_launcher_foreground.png');
          
          await sharp(sourceIcon)
            .resize(size, size, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png()
            .toFile(outputPath);
          
          // Copy to round and foreground versions
          fs.copyFileSync(outputPath, outputPathRound);
          fs.copyFileSync(outputPath, outputPathForeground);
          
          console.log(`✅ Generated Android ${density} icons (${size}x${size})`);
        }
      }
    } else {
      console.log('⚠️  Android res directory not found, skipping Android icons');
    }

    console.log('');
    console.log('✨ All icons generated successfully!');
    console.log('');
    console.log('📝 Icons are ready for:');
    console.log('   ✅ PWA (web) - /public directory');
    console.log('   ✅ Android - android/app/src/main/res/mipmap-*');
    console.log('   ✅ iOS - Use apple-touch-icon files from /public');
    console.log('');
    console.log('💡 For iOS, you may need to manually add icons to Xcode:');
    console.log('   - Open ios/App/App.xcworkspace in Xcode');
    console.log('   - Go to Assets.xcassets > AppIcon');
    console.log('   - Drag the generated apple-touch-icon files to appropriate slots');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

