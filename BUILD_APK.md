# Building APK for CommuteDrop

## Prerequisites

1. **Android Studio** - Download and install from https://developer.android.com/studio
2. **Java JDK** - Android Studio includes this, or install separately
3. **Node.js** - Already installed

## Step-by-Step Guide

### 1. Install Capacitor Android Plugin

```bash
npm install @capacitor/android@^6.0.0 --save-dev
```

### 2. Build Next.js App

Since the app uses dynamic routes (`/requests/[id]`), we need to use a workaround for static export. 

**Option A: Use Regular Build (Recommended for now)**

For now, we'll use the regular Next.js build which works better with dynamic routes:

```bash
npm run build
```

Then copy the `.next` folder contents to a static directory, or use a different approach.

**Option B: Manual Static Export Workaround**

1. Temporarily rename the dynamic route folder:
```bash
# Windows PowerShell
Rename-Item src/app/requests/[id] src/app/requests/_id_temp
```

2. Build for Capacitor:
```bash
npm run build:capacitor
```

3. Rename back:
```bash
Rename-Item src/app/requests/_id_temp src/app/requests/[id]
```

4. Manually copy the built files to `out` directory

### 3. Add Android Platform

```bash
npx cap add android
```

### 4. Sync with Capacitor

```bash
npx cap sync
```

### 5. Open in Android Studio

```bash
npx cap open android
```

### 6. Build APK in Android Studio

1. Wait for Gradle sync to complete
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Or use the command line:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   The APK will be in `android/app/build/outputs/apk/debug/app-debug.apk`

### 7. Build Release APK (for distribution)

1. In Android Studio, go to **Build** → **Generate Signed Bundle / APK**
2. Select **APK**
3. Create or select a keystore
4. Build the release APK

Or use command line:
```bash
cd android
./gradlew assembleRelease
```

The release APK will be in `android/app/build/outputs/apk/release/app-release.apk`

## Alternative: Use Next.js Regular Build

If static export continues to cause issues, you can:

1. Use regular Next.js build (not static export)
2. Serve it with a simple HTTP server
3. Configure Capacitor to point to that server

Update `capacitor.config.ts`:
```typescript
server: {
  url: 'http://localhost:3000', // Your Next.js dev server
  cleartext: true
}
```

## Troubleshooting

- **Dynamic routes error**: The `/requests/[id]` route causes issues with static export. Consider using a catch-all route or client-side routing only.
- **Gradle sync fails**: Make sure Android Studio and SDK are properly installed
- **Build errors**: Check that all dependencies are installed and Node modules are up to date

## Notes

- The APK will be a debug build by default
- For production, you need to sign the APK with a keystore
- The app will work offline once built, but Firebase requires internet connection

