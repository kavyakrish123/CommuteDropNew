# Firestore Security Rules Setup Guide

## Quick Fix: Development/Test Mode Rules

If you're just getting started and want to test the app quickly, use these **TEST MODE** rules (⚠️ **NOT for production**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for authenticated users (TEST MODE ONLY)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Production-Ready Security Rules

For production, use these more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection: only owner can read/write their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Requests collection
    match /requests/{requestId} {
      // Anyone authenticated can read requests
      allow read: if request.auth != null;
      
      // Anyone authenticated can create a request (must be the sender)
      allow create: if request.auth != null 
        && request.resource.data.senderId == request.auth.uid
        && request.resource.data.status == "open"
        && request.resource.data.commuterId == null;
      
      // Updates:
      // - Sender can update their own requests (any field)
      // - Assigned commuter can only update status and commuterId
      allow update: if request.auth != null && (
        // Sender can update their own requests
        (resource.data.senderId == request.auth.uid) ||
        // Commuter can update status and commuterId when they're assigned
        (resource.data.commuterId == request.auth.uid && 
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'commuterId', 'updatedAt']))
      );
      
      // No deletes allowed
      allow delete: if false;
    }
  }
}
```

## How to Apply Rules in Firebase Console

### Step 1: Open Firestore Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Paste the Rules
1. Copy one of the rule sets above (test mode for development, production for later)
2. Paste it into the rules editor
3. Click **Publish**

### Step 3: Verify
1. Try using your app again
2. The permissions error should be resolved

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Causes:**
1. ❌ Firestore rules not set up (default is deny all)
2. ❌ User not authenticated
3. ❌ Rules too restrictive

**Solutions:**
1. ✅ Apply the test mode rules above
2. ✅ Make sure user is logged in
3. ✅ Check browser console for auth errors

### Error: "Permission denied" on queries

**Note:** The `getAvailableRequests` function uses a `!=` query which requires an index. If you see an index error:

1. Click the link in the error message to create the index automatically
2. Or manually create an index in Firebase Console:
   - Go to Firestore → Indexes
   - Create composite index on `requests` collection:
     - Fields: `status` (Ascending), `senderId` (Ascending)
     - Query scope: Collection

### Check Authentication Status

Open browser console and check:
```javascript
// Should show user object if authenticated
firebase.auth().currentUser
```

## Testing Rules

You can test your rules in Firebase Console:
1. Go to Firestore → Rules
2. Click **Rules Playground**
3. Test different scenarios

## Security Best Practices

1. **Never use test mode rules in production**
2. **Always validate data in rules** (check required fields, data types)
3. **Use least privilege principle** (only allow what's needed)
4. **Regularly audit your rules**
5. **Test rules thoroughly before deploying**

## Current App Requirements

The app needs these permissions:
- ✅ Read all requests (for listing available requests)
- ✅ Read own requests (for "My Requests" tab)
- ✅ Create requests (as authenticated user)
- ✅ Update request status (commuter accepting/verifying OTP)
- ✅ Read/write own user document

All of these are covered in the production rules above.

