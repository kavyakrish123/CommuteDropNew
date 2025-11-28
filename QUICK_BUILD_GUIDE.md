# Quick Build Guide - Ionic + Capacitor

## 🚀 Quick Start

### Build for Both Platforms

```bash
# 1. Build and sync
npm run cap:build

# 2. Open Android Studio
npm run cap:open:android

# 3. Open Xcode (macOS only)
npm run cap:open:ios
```

## 📱 Android Build

```bash
# Build APK
npm run cap:build
npm run cap:open:android
# Then in Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
```

## 🍎 iOS Build (macOS only)

```bash
# Install CocoaPods dependencies
cd ios/App && pod install && cd ../..

# Build
npm run cap:build
npm run cap:open:ios
# Then in Xcode: Click Run button (▶️)
```

## 🔄 After Making Code Changes

```bash
npm run cap:build  # Rebuilds and syncs automatically
```

## 📦 Key Commands

| Command | What It Does |
|---------|--------------|
| `npm run build:capacitor` | Build Next.js for mobile |
| `npm run cap:sync` | Sync web assets to native |
| `npm run cap:open:android` | Open Android Studio |
| `npm run cap:open:ios` | Open Xcode |
| `npm run cap:build` | Build + Sync (all-in-one) |

## ⚠️ Important Notes

- **iOS requires macOS** - You can only build iOS apps on a Mac
- **Always run `cap:build`** after making code changes
- **Android Studio** - First build may take 5-10 minutes (Gradle sync)
- **Xcode** - Requires CocoaPods: `sudo gem install cocoapods`

For detailed instructions, see [IONIC_CAPACITOR_SETUP.md](./IONIC_CAPACITOR_SETUP.md)

