# App Installation Guide

## For Users

### Installing Pikkrr as a Mobile App

Pikkrr can be installed on your iOS or Android device to work like a native app. Once installed, you'll get:
- Full-screen experience
- Home screen icon
- Offline capabilities
- Push notifications
- Faster performance

### iOS Installation

1. **Open Pikkrr in Safari**
   - Make sure you're using Safari (not Chrome or other browsers)
   - Navigate to the Pikkrr website

2. **Tap the Share Button**
   - Look for the Share icon (square with arrow pointing up) at the bottom of Safari

3. **Select "Add to Home Screen"**
   - Scroll down in the share menu
   - Tap "Add to Home Screen"

4. **Confirm Installation**
   - Tap "Add" in the top right corner
   - The Pikkrr app icon will appear on your home screen

### Android Installation

1. **Open Pikkrr in Chrome**
   - Use Chrome browser for best experience
   - Navigate to the Pikkrr website

2. **Tap the Menu Button**
   - Look for the three dots (⋮) in the top right corner

3. **Select "Install App" or "Add to Home Screen"**
   - Look for "Install app" or "Add to Home screen" option
   - Tap it

4. **Confirm Installation**
   - Tap "Install" in the popup
   - The Pikkrr app will be added to your home screen

## For Developers

### Generating App Icons

The app uses the following icon files:
- `public/icon.svg` - SVG icon (192x192)
- `public/icon-192x192.png` - PNG icon for Android (192x192)
- `public/icon-512x512.png` - PNG icon for iOS and PWA (512x512)

### Icon Design Specifications

Based on Figma design:
- **Color**: #00C57E (Pikkrr Green)
- **Icon**: Package emoji (📦) or custom package icon
- **Background**: Rounded corners (24px radius)
- **Size**: 192x192 minimum, 512x512 recommended

### Generating Icons from Figma

1. Export the icon from Figma at 512x512px
2. Use an online tool or script to generate multiple sizes:
   ```bash
   # Using ImageMagick (if installed)
   convert icon-512x512.png -resize 192x192 icon-192x192.png
   ```

3. Place files in `public/` directory:
   - `icon.svg`
   - `icon-192x192.png`
   - `icon-512x512.png`

### Updating Capacitor Icons

For native iOS/Android builds:

1. Generate icons using Capacitor:
   ```bash
   npx @capacitor/assets generate
   ```

2. Or manually place icons in:
   - `android/app/src/main/res/` (various mipmap folders)
   - `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Testing Installation

1. **Test PWA Installation**:
   - Open the app in Chrome (Android) or Safari (iOS)
   - Check if install prompt appears
   - Verify icon appears correctly after installation

2. **Test Native Build**:
   ```bash
   # Build for Android
   npm run build
   npx cap sync android
   npx cap open android

   # Build for iOS
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

### Manifest Configuration

The `public/manifest.json` file controls PWA installation:
- `name`: App name shown during installation
- `short_name`: Short name for home screen
- `icons`: Array of icon sizes
- `theme_color`: Status bar color (#00C57E)
- `background_color`: Splash screen color

### Troubleshooting

**Icon not showing after installation:**
- Clear browser cache
- Regenerate icons with correct sizes
- Check manifest.json paths

**Install prompt not appearing:**
- Ensure HTTPS (required for PWA)
- Check manifest.json is valid
- Verify service worker is registered

**Icons look blurry:**
- Use higher resolution source (512x512 minimum)
- Ensure PNG format (not JPEG)
- Check icon sizes match manifest.json

