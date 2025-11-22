# CommuteDrop Project Structure

```
CommuteDrop2/
├── capacitor.config.ts          # Capacitor configuration
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── .eslintrc.json             # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .gitignore                  # Git ignore rules
├── README.md                   # Comprehensive documentation
├── MainPromptForCursor.txt     # Original requirements
│
└── src/
    ├── app/                    # Next.js App Router
    │   ├── app/
    │   │   └── page.tsx        # Main dashboard
    │   ├── auth/
    │   │   └── page.tsx        # Authentication page
    │   ├── requests/
    │   │   ├── create/
    │   │   │   └── page.tsx    # Create request page
    │   │   └── [id]/
    │   │       └── page.tsx    # Request detail page
    │   ├── globals.css         # Global styles
    │   ├── layout.tsx          # Root layout with AuthProvider
    │   ├── page.tsx            # Landing page
    │   └── not-found.tsx       # 404 page
    │
    ├── components/
    │   ├── forms/
    │   │   ├── EmailAuthForm.tsx    # Email/Password auth form
    │   │   └── PhoneAuthForm.tsx    # Phone auth form with OTP
    │   └── ui/
    │       ├── RequestCard.tsx      # Request card component
    │       ├── StatusBadge.tsx      # Status badge component
    │       └── Toast.tsx            # Toast notification component
    │
    ├── hooks/
    │   └── useToast.ts         # Toast notification hook
    │
    └── lib/
        ├── auth/
        │   └── AuthProvider.tsx     # Auth context provider
        ├── firebase/
        │   └── client.ts            # Firebase initialization
        ├── firestore/
        │   ├── requests.ts          # Request operations
        │   └── users.ts             # User operations
        ├── types/
        │   └── index.ts             # TypeScript type definitions
        ├── utils/
        │   └── otp.ts               # OTP generation utility
        └── validation/
            └── schemas.ts            # Zod validation schemas
```

## Key Files Overview

### Configuration Files
- **package.json**: All dependencies including Next.js, Firebase, React Hook Form, Zod, Capacitor
- **tsconfig.json**: TypeScript configuration with path aliases
- **tailwind.config.ts**: Tailwind CSS configuration
- **capacitor.config.ts**: Capacitor mobile app configuration

### Core Application Files
- **src/app/layout.tsx**: Root layout wrapping app with AuthProvider
- **src/app/page.tsx**: Landing page with "Get Started" CTA
- **src/app/auth/page.tsx**: Authentication page with Phone/Email tabs
- **src/app/app/page.tsx**: Main dashboard with My Requests / Available Requests tabs
- **src/app/requests/create/page.tsx**: Form to create new delivery requests
- **src/app/requests/[id]/page.tsx**: Request detail page with OTP verification

### Components
- **PhoneAuthForm.tsx**: Handles Firebase Phone Auth with reCAPTCHA
- **EmailAuthForm.tsx**: Email/Password authentication for dev mode
- **RequestCard.tsx**: Reusable card component for displaying requests
- **StatusBadge.tsx**: Colored status badges for request states
- **Toast.tsx**: Toast notification system for user feedback

### Library Files
- **lib/firebase/client.ts**: Firebase app, auth, and Firestore initialization
- **lib/firestore/requests.ts**: All Firestore operations for requests
- **lib/firestore/users.ts**: User data operations
- **lib/auth/AuthProvider.tsx**: React context for authentication state
- **lib/validation/schemas.ts**: Zod schemas for form validation
- **lib/utils/otp.ts**: OTP generation (client-side for MVP)

## Environment Variables Required

Create `.env.local` with:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

