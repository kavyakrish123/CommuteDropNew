# Push Notifications Setup Guide

## Overview

This app uses Firebase Cloud Messaging (FCM) for push notifications. The frontend is set up, but you need to configure Firebase Cloud Functions to actually send notifications.

## What's Already Implemented

✅ Frontend FCM setup (`src/lib/notifications/fcm.ts`)
✅ Service worker for background notifications (`public/firebase-messaging-sw.js`)
✅ Notification permission requests
✅ FCM token storage in user documents
✅ Notification triggers for pickup/drop events
✅ Nearby task notification logic

## What You Need to Set Up

### 1. Get Firebase VAPID Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Cloud Messaging** tab
4. Scroll down to **Web configuration** section
5. If you don't have a Web Push certificate yet:
   - Click **Generate key pair** button
   - A VAPID key pair will be generated (looks like: `BK...` or `BL...`)
6. Copy the **Key pair** value (the long base64 string, usually 87 characters)
   - ⚠️ **Important**: Copy the entire key pair string, not just part of it
   - The key should start with letters like `BK`, `BL`, `BM`, etc.

### 2. Add VAPID Key to Environment Variables

Create or update `.env.local` in the project root:
```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important Notes:**
- The VAPID key must be the complete key pair string from Firebase
- Do not add quotes around the key value
- The key should be a single line with no spaces
- After adding, **restart your development server** (`npm run dev`)

**For Production (Vercel):**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add `NEXT_PUBLIC_FIREBASE_VAPID_KEY` with the same value
4. Redeploy your application

### Troubleshooting VAPID Key Issues

If you see the error: `InvalidAccessError: The provided applicationServerKey is not valid`

1. **Check the key format**: The VAPID key should be a base64 URL-safe string (only letters, numbers, `-`, and `_`)
2. **Verify it's complete**: Make sure you copied the entire key from Firebase Console
3. **Check .env.local**: Ensure the key is in `.env.local` (not `.env`)
4. **Restart server**: After adding the key, restart your dev server
5. **Check for typos**: Ensure there are no extra spaces or line breaks
6. **Regenerate if needed**: If the key still doesn't work, generate a new one in Firebase Console

### 3. Set Up Firebase Cloud Functions

You need to create a Cloud Function to send notifications. Here's a template:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotification = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, fcmToken, title, body, data: notificationData } = data;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: notificationData || {},
    token: fcmToken,
    webpush: {
      fcmOptions: {
        link: notificationData?.url || '/app',
      },
    },
  };

  try {
    await admin.messaging().send(message);
    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send notification');
  }
});
```

### 4. Update Notification Triggers

Update `src/lib/notifications/triggers.ts` to call the Cloud Function:

```typescript
export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) return;

    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;
    if (!fcmToken || !userData?.notificationEnabled) return;

    // Call Cloud Function
    const sendNotification = httpsCallable(functions, 'sendNotification');
    await sendNotification({
      userId,
      fcmToken,
      title,
      body,
      data,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
```

### 5. Set Up Nearby Task Notifications

Create a scheduled Cloud Function to check for nearby tasks:

```javascript
// functions/index.js
exports.checkNearbyTasks = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    // Get all users with notifications enabled
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('notificationEnabled', '==', true)
      .where('role', 'in', ['commuter', 'both'])
      .get();

    for (const userDoc of usersSnapshot.docs) {
      const user = userDoc.data();
      // Check for nearby tasks and send notifications
      // (Implement the logic from src/lib/notifications/triggers.ts)
    }
  });
```

## Testing

1. **Request Permission**: The app will request notification permission on first load
2. **Check Token**: Open browser console, you should see "FCM Token: ..."
3. **Test Notification**: Use Firebase Console → Cloud Messaging → Send test message

## Troubleshooting

### Notifications Not Working

1. Check browser console for errors
2. Verify VAPID key is set correctly
3. Ensure service worker is registered (check Application → Service Workers in DevTools)
4. Check notification permission status

### Service Worker Not Registering

1. Ensure `firebase-messaging-sw.js` is in the `public` folder
2. Check that the file is accessible at `/firebase-messaging-sw.js`
3. Clear browser cache and reload

## Next Steps

1. Set up Firebase Cloud Functions
2. Deploy the notification functions
3. Test with real devices
4. Monitor notification delivery in Firebase Console

