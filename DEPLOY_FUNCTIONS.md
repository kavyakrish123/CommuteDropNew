# Deploying Firebase Cloud Functions

## Prerequisites

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project (if not already done):
```bash
firebase init functions
```
   - Select your Firebase project
   - Choose JavaScript
   - Install dependencies: Yes

## Setup

1. **Update `.firebaserc`**:
   - Replace `"your-project-id"` with your actual Firebase project ID

2. **Install dependencies**:
```bash
cd functions
npm install
cd ..
```

## Deploy Functions

### Deploy all functions:
```bash
firebase deploy --only functions
```

### Deploy specific function:
```bash
firebase deploy --only functions:sendNotification
firebase deploy --only functions:onRequestPicked
firebase deploy --only functions:onRequestDelivered
firebase deploy --only functions:checkNearbyTasks
firebase deploy --only functions:onNewRequestCreated
```

## Available Functions

1. **sendNotification** - Callable function to send notifications manually
2. **onRequestPicked** - Automatically triggers when request status changes to "picked"
3. **onRequestDelivered** - Automatically triggers when request status changes to "delivered"
4. **checkNearbyTasks** - Scheduled function (runs every 5 minutes) to notify users about nearby tasks
5. **onNewRequestCreated** - Automatically triggers when a new request is created

## Testing Locally

1. Start Firebase emulators:
```bash
firebase emulators:start --only functions
```

2. Test functions using the Firebase console or your app

## Update Client Code

After deploying, update `src/lib/notifications/triggers.ts` to use the Cloud Functions:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/client';

// In sendNotificationToUser function:
const sendNotificationFn = httpsCallable(functions, 'sendNotification');
await sendNotificationFn({
  userId,
  fcmToken,
  title,
  body,
  data,
});
```

## Monitoring

- View function logs: `firebase functions:log`
- Monitor in Firebase Console: Functions → Logs
- Set up alerts in Firebase Console for errors

## Cost Considerations

- Cloud Functions have a free tier (2 million invocations/month)
- Each notification sent via FCM counts as one invocation
- Scheduled functions run every 5 minutes = ~8,640 invocations/month
- Monitor usage in Firebase Console

