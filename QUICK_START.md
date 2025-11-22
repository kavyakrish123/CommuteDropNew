# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Firebase
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Phone + Email/Password)
3. Create Firestore database
4. Copy your Firebase config

### 3. Create `.env.local`
Create a file named `.env.local` in the root directory with:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## 📱 Building for Mobile

### Android
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

### iOS (macOS only)
```bash
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

## ✅ What's Included

- ✅ Complete authentication (Phone + Email/Password)
- ✅ Request creation and management
- ✅ Commuter matching system
- ✅ OTP verification flows
- ✅ Mobile-first responsive UI
- ✅ Capacitor integration ready
- ✅ TypeScript + Tailwind CSS
- ✅ Form validation with Zod
- ✅ Toast notifications

## 🎯 Next Steps

1. Fill in your Firebase config in `.env.local`
2. Set up Firestore security rules (see README.md)
3. Test the authentication flow
4. Create your first delivery request!

For detailed documentation, see [README.md](./README.md)

