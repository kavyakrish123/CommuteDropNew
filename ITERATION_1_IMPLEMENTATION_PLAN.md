# Iteration 1 Implementation Plan

## 📋 Overview

This document outlines the complete implementation plan for Iteration 1 improvements based on `02_Iteration_1_20251122.txt`.

## 🔄 Complete Revised UX Flow

### 1. Signup Flow (NEW)
```
Landing Page
  ↓
Auth Page (Phone/Email)
  ↓
Terms & Policies Screen (MUST VIEW)
  ↓
Agreement Checkbox (MUST ACCEPT)
  ↓
Account Creation
  ↓
Onboarding Profile Setup
  - Name (required)
  - Profile Image Upload (required)
  - Bio (required)
  - PayNow QR Upload (optional, can skip)
  ↓
Main Dashboard
```

### 2. Task Creation Flow (UPDATED)
```
Dashboard
  ↓
Create Task Button
  ↓
Task Creation Wizard:
  Step 1: Item Details
    - Item Description
    - Category Selection (with restrictions)
    - Item Photo Upload
    - SG Compliance Warning
  Step 2: Pickup Location
    - Postal Code
    - Optional Details
  Step 3: Drop Location
    - Postal Code
    - Optional Details
  Step 4: Pricing (Optional)
    - Price Offered
  ↓
Review & Submit
  ↓
Task Created (auto-expires in 60 min)
```

### 3. Rider Flow (NEW)
```
Rider Dashboard
  ↓
View Available Tasks (sorted by distance, nearest first)
  ↓
Filter by Proximity (1km default)
  ↓
Accept Task (if eligible: < 3 active AND OTP verified for current)
  ↓
Task Status: "accepted" → "waiting_pickup"
  ↓
Navigate to Pickup (external maps)
  ↓
OTP Verification Page
  - Sender provides OTP
  - Rider enters OTP
  ↓
Status: "pickup_otp_pending" → "picked"
  ↓
Navigate to Drop (external maps)
  ↓
Status: "in_transit"
  ↓
Drop OTP Verification
  ↓
Status: "delivered" → "completed"
```

### 4. Sender Flow (UPDATED)
```
Dashboard
  ↓
My Requests Tab
  ↓
View Request Details
  ↓
Parcel Progress Page
  - Timeline visualization
  - Current status
  - OTP display (for sender)
  - Rider info
```

## 📱 Updated Screen List

### Existing Screens (Modified)
1. **Landing Page** (`/`) - Add platform positioning disclaimers
2. **Auth Page** (`/auth`) - Add Terms link before signup
3. **Dashboard** (`/app`) - Split into Sender/Rider views
4. **Create Request** (`/requests/create`) - Convert to wizard with photo/category
5. **Request Detail** (`/requests/[id]`) - Add timeline, maps links

### New Screens
1. **Terms & Policies** (`/terms`) - Policies & Usage Rules
2. **Onboarding** (`/onboarding`) - Profile setup wizard
3. **Rider Dashboard** (`/rider`) - Active/pending tasks view
4. **Parcel Progress** (`/parcels/[id]`) - Timeline visualization
5. **OTP Verification** (`/otp/[id]`) - Dedicated OTP entry page
6. **PayNow QR Upload** (`/profile/paynow`) - QR code upload

## 🧭 Navigation Changes

### Main Navigation Structure
```
/ (Landing)
  ├── /auth (Auth with Terms link)
  ├── /terms (Terms & Policies)
  ├── /onboarding (Profile Setup)
  └── /app (Main App - Protected)
      ├── /app/sender (Sender Dashboard)
      ├── /app/rider (Rider Dashboard)
      ├── /requests/create (Task Creation Wizard)
      ├── /requests/[id] (Request Detail)
      ├── /parcels/[id] (Parcel Progress)
      ├── /otp/[id] (OTP Verification)
      └── /profile (Profile Management)
          └── /profile/paynow (PayNow QR)
```

## 🧩 Components Required

### New Components
1. `TermsModal.tsx` - Terms & Policies modal/viewer
2. `OnboardingWizard.tsx` - Multi-step profile setup
3. `ImageUploader.tsx` - Image upload component
4. `CategorySelector.tsx` - Category selection with restrictions
5. `RiderDashboard.tsx` - Rider-specific dashboard
6. `ParcelTimeline.tsx` - Status timeline visualization
7. `OTPVerificationCard.tsx` - OTP input component
8. `DistanceFilter.tsx` - Proximity filter component
9. `TaskCard.tsx` - Enhanced task card with distance
10. `PlatformDisclaimer.tsx` - Platform positioning banner
11. `MapLinkButton.tsx` - External maps link button

### Updated Components
1. `RequestCard.tsx` - Add distance, category, photo
2. `StatusBadge.tsx` - Support new statuses
3. `PhoneAuthForm.tsx` - Add Terms acceptance
4. `EmailAuthForm.tsx` - Add Terms acceptance

## 🔌 API Changes Required

### Firestore Functions (New)
1. `getRiderActiveTasks(commuterId)` - Get active tasks for rider
2. `getRiderPendingTasks(commuterId)` - Get pending tasks
3. `canRiderAcceptTask(commuterId)` - Check eligibility
4. `getNearbyTasks(pincode, radius)` - Distance-based filtering
5. `expireOldTasks()` - Auto-expire tasks (Firebase Function)
6. `updateUserProfile(uid, data)` - Update profile fields
7. `uploadImage(file)` - Image upload to Firebase Storage

### Updated Functions
1. `createRequest()` - Add category, photo, expiresAt
2. `acceptRequest()` - Add eligibility checks
3. `verifyPickupOTP()` - Update status flow
4. `verifyDropOTP()` - Update status flow

## 💾 DB Field Changes Required

### Users Collection (New Fields)
```typescript
{
  profileImage: string | null,
  bio: string | null,
  payNowQR: string | null,
  policiesAccepted: boolean,
  onboardingCompleted: boolean
}
```

### Requests Collection (New Fields)
```typescript
{
  category: ItemCategory,
  itemPhoto: string | null,
  expiresAt: Timestamp,
  pickupLat: number | null,
  pickupLng: number | null,
  dropLat: number | null,
  dropLng: number | null,
  status: RequestStatus // Updated enum
}
```

## ✅ Validation Rules Per Step

### Signup Validation
- ✅ Must view Terms & Policies
- ✅ Must check agreement checkbox
- ✅ Phone/Email must be valid

### Onboarding Validation
- ✅ Name: Required, min 2 chars
- ✅ Profile Image: Required
- ✅ Bio: Required, min 10 chars, max 200 chars
- ✅ PayNow QR: Optional

### Task Creation Validation
- ✅ Item Description: Required, min 10 chars
- ✅ Category: Required, must not be restricted
- ✅ Item Photo: Required
- ✅ Pickup/Drop Pincode: Required, valid SG format
- ✅ Price: Optional, if provided must be positive

### Rider Acceptance Validation
- ✅ Must have < 3 active pickups
- ✅ Must have verified OTP for current pickup (if any)
- ✅ Task must not be expired
- ✅ Task must be "created" status

### OTP Verification Validation
- ✅ OTP: Required, 4 digits, numeric only

## 🔄 State Transition Improvements

### Request Status Flow
```
created
  ↓ (rider accepts)
accepted
  ↓ (rider at pickup location)
waiting_pickup
  ↓ (OTP verification initiated)
pickup_otp_pending
  ↓ (OTP verified)
picked
  ↓ (rider starts delivery)
in_transit
  ↓ (rider at drop location)
delivered
  ↓ (drop OTP verified)
completed

OR

created → expired (after 60 minutes)
any_status → cancelled (by sender)
```

## ⚠️ Edge Cases to Handle

1. **Task Expiry**: Auto-expire after 60 minutes, notify sender
2. **Rider Limit**: Block acceptance if 3+ active tasks
3. **OTP Blocking**: Block new acceptance until current OTP verified
4. **Category Restrictions**: Show warning, prevent submission
5. **Onboarding Skip**: Redirect to onboarding if not completed
6. **Terms Not Accepted**: Block all app features
7. **Image Upload Failures**: Show error, allow retry
8. **Distance Calculation**: Handle missing coordinates gracefully
9. **Concurrent Acceptances**: Prevent double-acceptance
10. **Network Failures**: Show retry options

## 🧪 Testing Items List

### Signup Flow
- [ ] Terms viewing required
- [ ] Agreement checkbox required
- [ ] Onboarding redirect after signup
- [ ] Skip onboarding blocked

### Onboarding
- [ ] All required fields validated
- [ ] Image upload works
- [ ] PayNow QR optional
- [ ] Can edit later

### Task Creation
- [ ] Category restrictions enforced
- [ ] Photo upload required
- [ ] SG compliance warning shown
- [ ] Expiry time set correctly (60 min)
- [ ] All validations pass

### Rider Flow
- [ ] Max 3 active tasks enforced
- [ ] OTP verification blocks new acceptance
- [ ] Distance filtering works
- [ ] Sorting by nearest first
- [ ] External maps links work

### Status Transitions
- [ ] All status transitions valid
- [ ] OTP verification updates status correctly
- [ ] Auto-expiry works
- [ ] Timeline displays correctly

### Edge Cases
- [ ] Concurrent acceptances prevented
- [ ] Network failures handled
- [ ] Image upload failures handled
- [ ] Missing coordinates handled

## 📊 Final UX Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE                              │
│  - Platform positioning disclaimers                         │
│  - "Get Started" → /auth                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AUTH PAGE                                 │
│  - Phone/Email tabs                                          │
│  - Link to /terms                                            │
│  - Agreement checkbox (required)                             │
│  - Sign up → /onboarding                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              ONBOARDING WIZARD                              │
│  Step 1: Name + Profile Image                               │
│  Step 2: Bio                                                │
│  Step 3: PayNow QR (optional)                               │
│  → /app                                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  MAIN DASHBOARD                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Sender View  │  │  Rider View  │                        │
│  │ - My Tasks  │  │ - Available  │                        │
│  │ - Create    │  │ - Active     │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
         ↓                           ↓
┌──────────────────┐      ┌──────────────────┐
│ CREATE TASK      │      │ RIDER DASHBOARD  │
│ Wizard:          │      │ - Filter (1km)  │
│ - Item + Photo   │      │ - Sort (nearest) │
│ - Category       │      │ - Accept (if OK) │
│ - Locations      │      │ - Track Status  │
│ - Review         │      └──────────────────┘
└──────────────────┘              ↓
         ↓              ┌──────────────────┐
┌──────────────────┐   │ OTP VERIFICATION │
│ PARCEL PROGRESS  │   │ - Enter OTP      │
│ - Timeline       │   │ - Verify         │
│ - Status         │   │ - Update Status  │
│ - Maps Links     │   └──────────────────┘
└──────────────────┘
```

## 🚀 Implementation Priority

1. **Phase 1**: Data models + Terms & Onboarding
2. **Phase 2**: Task creation wizard + Category restrictions
3. **Phase 3**: Rider dashboard + Restrictions
4. **Phase 4**: Distance filtering + Sorting
5. **Phase 5**: Timeline UI + Status transitions
6. **Phase 6**: Maps integration + Polish

