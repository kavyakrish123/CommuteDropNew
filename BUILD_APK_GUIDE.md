# Building APK for CommuteDrop - Complete Guide

## ✅ Prerequisites

1. **Android Studio** - Download from https://developer.android.com/studio
   - Install Android SDK (API level 33 or higher recommended)
   - Install Android SDK Build-Tools
   - Install Android SDK Platform-Tools

2. **Java JDK** - Android Studio includes JDK 17, or install separately

3. **Node.js** - Already installed ✅

## 📦 Step-by-Step APK Build Process

### Step 1: Build Next.js App for Capacitor

```bash
npm run build:capacitor
```

This will:
- Build the Next.js app
- Copy static files to `out/` directory
- Prepare files for Capacitor

### Step 2: Sync with Capacitor

```bash
npx cap sync
```

This copies the web assets to the Android project.

### Step 3: Open Android Studio

```bash
npx cap open android
```

This will open the Android project in Android Studio.

### Step 4: Build APK in Android Studio

#### Option A: Build Debug APK (for testing)

1. Wait for Gradle sync to complete
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete
4. Click **locate** in the notification to find the APK
5. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Build Release APK (for distribution)

**First time setup - Create Keystore:**

1. Go to **Build** → **Generate Signed Bundle / APK**
2. Select **APK**
3. Click **Create new...** to create a keystore
4. Fill in the keystore information:
   - Key store path: Choose a location and filename (e.g., `commutedrop-release-key.jks`)
   - Password: Create a strong password
   - Key alias: `commutedrop-key`
   - Key password: Create a strong password
   - Validity: 25 years (recommended)
   - Certificate information: Fill in your details
5. Click **OK**

**Build Release APK:**

1. Go to **Build** → **Generate Signed Bundle / APK**
2. Select **APK**
3. Select your keystore file
4. Enter passwords
5. Select **release** build variant
6. Click **Finish**
7. APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Step 5: Install APK on Device

1. Transfer the APK to your Android device
2. Enable "Install from Unknown Sources" in device settings
3. Open the APK file and install

## 🔧 Command Line Build (Alternative)

If you prefer command line:

### Debug APK:
```bash
cd android
./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK:
```bash
cd android
./gradlew assembleRelease
```
APK: `android/app/build/outputs/apk/release/app-release.apk`

**Note:** For release builds, you need to configure signing in `android/app/build.gradle`

## 📝 Important Notes

1. **Dynamic Routes**: The `/requests/[id]` route is handled client-side. The app will work, but initial navigation to dynamic routes may require client-side routing.

2. **Firebase Configuration**: Make sure your Firebase config is set in `.env.local` before building.

3. **Permissions**: The app requires:
   - Internet permission (for Firebase)
   - Location permission (for tracking)
   - Camera permission (for QR code scanning, if implemented)

4. **Keystore Security**: 
   - Keep your keystore file safe and backed up
   - Never commit keystore files to git
   - You'll need the same keystore for app updates

## 🐛 Troubleshooting

### Build Errors

- **Gradle sync fails**: 
  - Check Android Studio SDK settings
  - Ensure Java JDK is properly configured
  - Try: File → Invalidate Caches / Restart

- **"SDK location not found"**:
  - Set `ANDROID_HOME` environment variable
  - Or configure in Android Studio: File → Project Structure → SDK Location

- **Version conflicts**:
  - Run `npm install` to ensure all dependencies are up to date
  - Check Capacitor versions match

### Runtime Issues

- **App crashes on startup**:
  - Check Firebase configuration
  - Ensure all environment variables are set
  - Check Android logs: `adb logcat`

- **Dynamic routes not working**:
  - This is expected - routes are handled client-side
  - Navigation within the app will work fine

## 📱 Testing the APK

1. Install the debug APK on a test device
2. Test all major features:
   - Authentication
   - Creating requests
   - Accepting deliveries
   - OTP verification
   - Payment flow
   - Location tracking

## 🚀 Next Steps

After building the APK:

1. Test thoroughly on multiple devices
2. Create a release keystore for production
3. Build signed release APK
4. Consider uploading to Google Play Store (requires developer account)

## 📚 Additional Resources

- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Android Studio Guide](https://developer.android.com/studio)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)


