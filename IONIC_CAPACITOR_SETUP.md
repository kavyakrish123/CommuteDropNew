# Ionic Framework + Capacitor Setup Guide

This guide will help you set up and build your CommuteDrop app for both iOS and Android using Ionic Framework with Capacitor.

## 📋 Prerequisites

### For Android Development:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Android Studio** (latest version)
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK** (installed via Android Studio)

### For iOS Development (macOS only):
- **macOS** (required for iOS development)
- **Xcode** (latest version from App Store)
- **CocoaPods** (install via: `sudo gem install cocoapods`)
- **Xcode Command Line Tools** (`xcode-select --install`)

## 🚀 Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Capacitor Platforms

The iOS and Android platforms are already added to your project. If you need to re-add them:

```bash
# Add Android platform
npx cap add android

# Add iOS platform (macOS only)
npx cap add ios
```

### 3. Build for Capacitor

Build your Next.js app and prepare it for mobile:

```bash
npm run build:capacitor
```

This command:
- Builds your Next.js app with static export
- Prepares static files in the `out/` directory
- Copies assets for Capacitor

### 4. Sync Capacitor

After building, sync the web assets to native projects:

```bash
npm run cap:sync
```

Or use the combined command:

```bash
npm run cap:build
```

## 📱 Building for Android

### Option 1: Using Android Studio (Recommended)

1. **Open Android Studio:**
   ```bash
   npm run cap:open:android
   ```

2. **Wait for Gradle Sync:**
   - Android Studio will automatically sync Gradle dependencies
   - This may take a few minutes on first run

3. **Select a Device:**
   - Click the device dropdown (top toolbar)
   - Choose an emulator or connected physical device

4. **Build and Run:**
   - Click the **Run** button (▶️) or press `Shift + F10`
   - Or go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**

### Option 2: Using Command Line

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Building Release APK

1. **Generate a signing key** (first time only):
   ```bash
   keytool -genkey -v -keystore commutedrop-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias commutedrop
   ```

2. **Configure signing in `android/app/build.gradle`**:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file('path/to/commutedrop-release-key.jks')
               storePassword 'your-store-password'
               keyAlias 'commutedrop'
               keyPassword 'your-key-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               ...
           }
       }
   }
   ```

3. **Build release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

The signed APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## 🍎 Building for iOS (macOS only)

### Prerequisites Check

1. **Install CocoaPods** (if not installed):
   ```bash
   sudo gem install cocoapods
   ```

2. **Install iOS Dependencies:**
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

### Option 1: Using Xcode (Recommended)

1. **Open Xcode:**
   ```bash
   npm run cap:open:ios
   ```

2. **Select a Device:**
   - Click the device dropdown (top toolbar)
   - Choose a simulator or connected physical device

3. **Build and Run:**
   - Click the **Run** button (▶️) or press `Cmd + R`
   - Or go to **Product** → **Archive** for App Store distribution

### Option 2: Using Command Line

```bash
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 14' build
```

## 🔄 Development Workflow

### Making Changes to Your App

1. **Make changes** to your Next.js app code
2. **Rebuild for Capacitor:**
   ```bash
   npm run build:capacitor
   ```
3. **Sync changes:**
   ```bash
   npm run cap:sync
   ```
4. **Test in native app** (Android Studio or Xcode)

### Quick Sync (No Rebuild)

If you only changed web assets (images, CSS, etc.):

```bash
npm run cap:copy
```

### Update Native Dependencies

When Capacitor or plugin versions change:

```bash
npm run cap:update
```

## 📦 Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run build:capacitor` | Build Next.js app for Capacitor |
| `npm run cap:sync` | Sync web assets to native projects |
| `npm run cap:copy` | Copy web assets only (faster) |
| `npm run cap:update` | Update native dependencies |
| `npm run cap:open:android` | Open Android Studio |
| `npm run cap:open:ios` | Open Xcode |
| `npm run cap:build` | Build + Sync (combined) |

## 🔧 Configuration

### Capacitor Config (`capacitor.config.ts`)

```typescript
{
  appId: 'com.commutedrop.app',
  appName: 'CommuteDrop',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  }
}
```

### Next.js Config (`next.config.js`)

The config automatically enables static export when building for Capacitor using the `CAPACITOR_BUILD` environment variable.

## 🐛 Troubleshooting

### Android Issues

**Gradle Sync Failed:**
```bash
cd android
./gradlew clean
```

**Build Errors:**
- Check that `out/` directory exists and contains `index.html`
- Ensure `npm run build:capacitor` completed successfully
- Try: `npm run cap:update`

**APK Not Installing:**
- Enable "Install from Unknown Sources" on your device
- Check AndroidManifest.xml permissions

### iOS Issues

**CocoaPods Errors:**
```bash
cd ios/App
pod deintegrate
pod install
```

**Xcode Build Errors:**
- Clean build folder: `Product` → `Clean Build Folder` (Shift + Cmd + K)
- Delete derived data: `~/Library/Developer/Xcode/DerivedData`
- Re-run `pod install`

**Simulator Not Starting:**
- Open Xcode → Preferences → Components → Download iOS Simulator

### General Issues

**"webDir must contain index.html":**
- Run `npm run build:capacitor` first
- Check that `out/index.html` exists

**Changes Not Reflecting:**
- Rebuild: `npm run build:capacitor`
- Sync: `npm run cap:sync`
- Restart the app in the simulator/device

**Dynamic Routes Not Working:**
- The build script handles dynamic routes by creating fallback HTML files
- Client-side routing will handle the actual navigation

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic Framework Documentation](https://ionicframework.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Android Studio Guide](https://developer.android.com/studio)
- [Xcode Guide](https://developer.apple.com/xcode/)

## ✅ Checklist for First Build

- [ ] All prerequisites installed
- [ ] Dependencies installed (`npm install`)
- [ ] Built for Capacitor (`npm run build:capacitor`)
- [ ] Synced Capacitor (`npm run cap:sync`)
- [ ] Opened native IDE (Android Studio or Xcode)
- [ ] Selected a device/emulator
- [ ] Built and ran the app successfully

## 🎯 Next Steps

1. **Test on Real Devices:** Always test on physical devices for accurate performance
2. **Configure App Icons:** Update icons in `android/app/src/main/res` and `ios/App/App/Assets.xcassets`
3. **Set Up Signing:** Configure code signing for release builds
4. **Add Plugins:** Install Capacitor plugins as needed (Camera, Geolocation, etc.)
5. **Optimize Performance:** Test and optimize for mobile performance

---

**Need Help?** Check the [Capacitor Community Forum](https://forum.ionicframework.com/c/capacitor/) or [GitHub Issues](https://github.com/ionic-team/capacitor/issues).

