# Ionic Appflow Setup Guide

Ionic Appflow is a cloud-based CI/CD service that allows you to build, test, and deploy your Capacitor apps without needing local development environments.

## 📋 Prerequisites

1. **Ionic CLI installed** (already done):
   ```bash
   npm install -g @ionic/cli@latest
   ```

2. **Ionic Account**: Sign up at [ionic.io](https://ionic.io) or [app.ionic.io](https://app.ionic.io)

3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, Bitbucket)

## 🚀 Step 1: Initialize Ionic Appflow

### Option A: Using Ionic CLI (Recommended)

1. **Login to Ionic:**
   ```bash
   ionic login
   ```
   This will open your browser to authenticate with Ionic.

2. **Link your app to Ionic Appflow:**
   ```bash
   ionic link
   ```
   This will:
   - Create a new app in Ionic Appflow (or link to existing)
   - Connect your local repository to Appflow
   - Set up the connection

3. **Verify the connection:**
   ```bash
   ionic link --name "CommuteDrop"
   ```

### Option B: Using Ionic Dashboard

1. Go to [app.ionic.io](https://app.ionic.io)
2. Click **"New App"**
3. Select **"Link Existing Repository"**
4. Choose your Git provider (GitHub, GitLab, Bitbucket)
5. Select your repository
6. Follow the setup wizard

## 🔧 Step 2: Configure Your App

### App Configuration

Your `ionic.config.json` is already created with:
```json
{
  "name": "CommuteDrop",
  "type": "custom",
  "integrations": {
    "capacitor": {}
  }
}
```

### Build Configuration

Ionic Appflow will automatically detect your Capacitor setup. However, you may need to configure build settings:

1. **Go to Appflow Dashboard**: [app.ionic.io](https://app.ionic.io)
2. **Select your app**: CommuteDrop
3. **Go to Settings** → **Build Settings**
4. **Configure build scripts**:

   For **Android**:
   - Build Command: `npm run build:capacitor`
   - Build Directory: `out`

   For **iOS**:
   - Build Command: `npm run build:capacitor`
   - Build Directory: `out`

### Environment Variables

If you need environment variables for builds:

1. Go to **Settings** → **Environment Variables**
2. Add your Firebase config variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📱 Step 3: Set Up Native Projects

### Android Setup

1. **Upload Android Keystore** (for release builds):
   - Go to **Settings** → **Certificates** → **Android**
   - Upload your keystore file or generate a new one
   - Save the credentials securely

2. **Configure Android Build**:
   - Go to **Builds** → **New Build**
   - Select **Android**
   - Choose build type (Debug or Release)
   - Select branch (usually `main` or `master`)

### iOS Setup

1. **Upload iOS Certificates** (for App Store builds):
   - Go to **Settings** → **Certificates** → **iOS**
   - Upload your:
     - Distribution Certificate (.p12)
     - Provisioning Profile (.mobileprovision)
   - Or use Appflow's automatic certificate management

2. **Configure iOS Build**:
   - Go to **Builds** → **New Build**
   - Select **iOS**
   - Choose build type (Development, Ad-Hoc, or App Store)
   - Select branch

## 🏗️ Step 4: Create Your First Build

### Using Ionic CLI

```bash
# Build Android APK
ionic build android --prod

# Build iOS App
ionic build ios --prod
```

### Using Appflow Dashboard

1. Go to **Builds** → **New Build**
2. Select platform (Android or iOS)
3. Select branch
4. Choose build type
5. Click **"Start Build"**

## 🔄 Step 5: Automate Builds (Optional)

### Set Up Automatic Builds

1. Go to **Deploy** → **Automations**
2. Create a new automation:
   - **Trigger**: Git push to specific branch
   - **Action**: Build Android/iOS
   - **Condition**: Only on `main` branch, etc.

### Example Automation

- **Trigger**: Push to `main` branch
- **Action**: Build Android Release APK
- **Notification**: Email on completion

## 📦 Step 6: Deploy and Distribute

### Android Distribution

1. **Download APK**:
   - Go to **Builds**
   - Click on completed build
   - Download the APK

2. **Share via Appflow**:
   - Use Appflow's sharing feature
   - Generate a shareable link
   - Send to testers

3. **Google Play Store**:
   - Download the signed APK/AAB
   - Upload to Google Play Console

### iOS Distribution

1. **TestFlight**:
   - Build will automatically upload to TestFlight (if configured)
   - Invite testers via Appflow

2. **App Store**:
   - Download the IPA
   - Upload via App Store Connect

3. **Ad-Hoc Distribution**:
   - Download IPA
   - Distribute to registered devices

## 🧪 Step 7: Live Updates (Optional)

Ionic Appflow supports Live Updates for web content:

1. **Enable Live Updates**:
   ```bash
   ionic deploy add
   ```

2. **Configure Channels**:
   - Production channel
   - Staging channel
   - Development channel

3. **Deploy Updates**:
   ```bash
   ionic deploy build --channel=production
   ```

## 📝 Available Commands

| Command | Description |
|---------|-------------|
| `ionic login` | Login to Ionic account |
| `ionic link` | Link app to Appflow |
| `ionic build android` | Build Android app |
| `ionic build ios` | Build iOS app |
| `ionic deploy build` | Deploy live update |
| `ionic package build` | Create a new build |
| `ionic package list` | List all builds |

## 🔍 Troubleshooting

### Build Fails

1. **Check build logs** in Appflow dashboard
2. **Verify environment variables** are set correctly
3. **Check build scripts** in `package.json`
4. **Ensure `ionic.config.json` exists**

### Authentication Issues

```bash
# Re-login
ionic logout
ionic login
```

### Link Issues

```bash
# Re-link app
ionic link --name "CommuteDrop"
```

### Build Script Issues

Make sure your `package.json` has:
```json
{
  "scripts": {
    "build:capacitor": "node scripts/build-for-capacitor.js"
  }
}
```

## 📚 Additional Resources

- [Ionic Appflow Documentation](https://ionic.io/docs/appflow)
- [Appflow Dashboard](https://app.ionic.io)
- [Capacitor + Appflow Guide](https://capacitorjs.com/docs/guides/deploying-updates)
- [Ionic CLI Documentation](https://ionicframework.com/docs/cli)

## ✅ Checklist

- [ ] Ionic CLI installed (`ionic --version`)
- [ ] Logged in to Ionic (`ionic login`)
- [ ] App linked to Appflow (`ionic link`)
- [ ] `ionic.config.json` created
- [ ] Environment variables configured
- [ ] Android keystore uploaded (for release)
- [ ] iOS certificates uploaded (for release)
- [ ] First build completed successfully
- [ ] Build automation configured (optional)

## 🎯 Next Steps

1. **Complete the setup** by running `ionic link`
2. **Configure build settings** in Appflow dashboard
3. **Create your first build** to test the setup
4. **Set up automation** for continuous builds
5. **Configure distribution** channels

---

**Need Help?** 
- [Ionic Forum](https://forum.ionicframework.com/)
- [Ionic Support](https://ionic.io/support)
- [Appflow Status](https://status.ionic.io/)

