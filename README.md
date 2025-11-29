# Pikkrr

**Pikkrr** is a peer-to-peer delivery platform that transforms your daily commute into passive income. The platform connects commuters (MRT, BUS, walkers, or joggers) with package senders for eco-friendly, cost-effective deliveries along existing routes. Senders create delivery requests, and commuters can see open requests near them and accept one. The app uses OTP-based confirmation at pickup and drop points.

> Auto-deployment test

## Features

- 🔐 **Phone Authentication**: Secure phone number authentication with OTP verification
- 📦 **Request Management**: Create, view, and manage delivery requests
- 🚗 **Commuter Matching**: Browse and accept available delivery requests
- 🔢 **OTP Verification**: Secure pickup and drop confirmation using 4-digit OTPs
- 📱 **Mobile-First Design**: Optimized for mobile devices with PWA support
- 📲 **Native Apps**: Built with Capacitor for Android and iOS deployment

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase
  - Authentication (Phone + Email/Password)
  - Firestore (Database)
- **Form Management**: React Hook Form + Zod
- **Mobile**: Capacitor
- **Date Handling**: date-fns

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** or **yarn**
- **Firebase Account** (for backend services)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Add a Web app to your Firebase project
4. Copy the Firebase configuration values

### 3. Environment Configuration

1. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

2. Fill in your Firebase configuration values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Firebase Console Configuration

#### Enable Authentication

1. Go to **Authentication** > **Sign-in method** in Firebase Console
2. Enable **Phone** authentication
3. Enable **Email/Password** authentication (for dev mode)

#### Setup Firestore

1. Go to **Firestore Database** in Firebase Console
2. Create a database (start in **test mode** for development)
3. Apply the following security rules (recommended):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Requests collection
    match /requests/{requestId} {
      // Anyone authenticated can read
      allow read: if request.auth != null;
      
      // Anyone authenticated can create
      allow create: if request.auth != null && request.resource.data.senderId == request.auth.uid;
      
      // Updates: sender can update their own requests, commuter can update status
      allow update: if request.auth != null && (
        (resource.data.senderId == request.auth.uid) ||
        (resource.data.commuterId == request.auth.uid && 
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAt']))
      );
    }
  }
}
```

**Note**: For production, you should add more strict rules and consider additional security measures.

## Running Locally

### Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

The production build will be in the `out` directory (static export).

## 📱 Ionic Framework + Capacitor Integration

This project uses **Ionic Framework with Capacitor** to build native iOS and Android apps.

### Quick Start

```bash
# Build and sync for both platforms
npm run cap:build

# Open Android Studio
npm run cap:open:android

# Open Xcode (macOS only)
npm run cap:open:ios
```

### Available Commands

- `npm run build:capacitor` - Build Next.js app for mobile
- `npm run cap:sync` - Sync web assets to native projects
- `npm run cap:copy` - Copy web assets only (faster)
- `npm run cap:update` - Update native dependencies
- `npm run cap:open:android` - Open Android Studio
- `npm run cap:open:ios` - Open Xcode (macOS only)
- `npm run cap:build` - Build + Sync (all-in-one)

### Documentation

- **[IONIC_CAPACITOR_SETUP.md](./IONIC_CAPACITOR_SETUP.md)** - Complete setup guide for iOS and Android
- **[IONIC_APPFLOW_SETUP.md](./IONIC_APPFLOW_SETUP.md)** - Cloud builds, testing, and deployment with Ionic Appflow
- **[QUICK_BUILD_GUIDE.md](./QUICK_BUILD_GUIDE.md)** - Quick reference for building
- **[BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)** - Detailed Android APK build guide

### Prerequisites

**For Android:**
- Android Studio
- Java Development Kit (JDK) 11+
- Android SDK

**For iOS (macOS only):**
- Xcode
- CocoaPods (`sudo gem install cocoapods`)

### Development Workflow

1. Make changes to your Next.js app
2. Run `npm run cap:build` to rebuild and sync
3. Test in Android Studio or Xcode

For detailed instructions, see [IONIC_CAPACITOR_SETUP.md](./IONIC_CAPACITOR_SETUP.md)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/               # Authentication page
│   ├── app/                # Main dashboard
│   ├── requests/           # Request management pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── forms/             # Form components
│   │   ├── PhoneAuthForm.tsx
│   │   └── EmailAuthForm.tsx
│   └── ui/                 # Reusable UI components
│       ├── Toast.tsx
│       ├── StatusBadge.tsx
│       └── RequestCard.tsx
├── lib/
│   ├── auth/              # Authentication context
│   │   └── AuthProvider.tsx
│   ├── firebase/          # Firebase configuration
│   │   └── client.ts
│   ├── firestore/         # Firestore operations
│   │   ├── requests.ts
│   │   └── users.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   └── otp.ts
│   └── validation/        # Zod schemas
│       └── schemas.ts
└── hooks/                 # Custom React hooks
    └── useToast.ts
```

## Data Model

### Users Collection

- Document ID: Firebase Auth `uid`
- Fields:
  - `phone`: string | null
  - `email`: string | null
  - `name`: string
  - `role`: "sender" | "commuter" | "both"
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

### Requests Collection

- Document ID: Auto-generated
- Fields:
  - `senderId`: string
  - `commuterId`: string | null
  - `pickupPincode`: string
  - `pickupDetails`: string
  - `dropPincode`: string
  - `dropDetails`: string
  - `itemDescription`: string
  - `priceOffered`: number | null
  - `status`: "open" | "accepted" | "picked" | "delivered" | "cancelled"
  - `otpPickup`: number (4-digit)
  - `otpDrop`: number (4-digit)
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

## Authentication Modes

### Phone Authentication (Production)

- Uses Firebase Phone Authentication
- Requires reCAPTCHA verification
- Default country code: +65 (Singapore)
- Can be changed manually

### Email/Password (Dev Mode)

- Simple email and password authentication
- Useful for local testing without phone numbers
- Toggle between Login and Register modes

## Usage Flow

1. **Landing Page** → User clicks "Get started"
2. **Authentication** → User signs in with Phone or Email
3. **Dashboard** → User sees:
   - **My Requests**: Requests they created
   - **Available Requests**: Open requests they can accept
4. **Create Request** → Sender creates a delivery request
5. **Accept Request** → Commuter accepts an available request
6. **OTP Verification**:
   - Commuter verifies pickup OTP → Status: "picked"
   - Commuter verifies drop OTP → Status: "delivered"

## Future Improvements

- 🔔 **Push Notifications**: Integrate Firebase Cloud Messaging (FCM)
- 📍 **Geolocation**: Add map-based nearby matching using device location
- 💳 **Payments**: Integrate payment gateway for price transactions
- 🔒 **Enhanced Security**: Move OTP generation to Firebase Functions
- 💬 **Chat**: Add in-app messaging between sender and commuter
- 📊 **Analytics**: Add user analytics and request tracking
- 🌍 **Multi-language**: Support multiple languages
- ⭐ **Ratings**: Add rating system for users

## Troubleshooting

### Firebase Authentication Issues

- Ensure Phone and Email/Password authentication are enabled in Firebase Console
- Check that your Firebase config values in `.env.local` are correct
- For Phone Auth, ensure reCAPTCHA is properly configured

### Capacitor Build Issues

- Make sure you've run `npm run build` before `npx cap sync`
- Clear Capacitor cache: Delete `android` and `ios` folders, then re-add platforms
- For Android: Ensure Android SDK is properly installed in Android Studio

### TypeScript Errors

- Run `npm install` to ensure all dependencies are installed
- Check that `tsconfig.json` paths are correctly configured

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using Next.js, Firebase, and Capacitor**

