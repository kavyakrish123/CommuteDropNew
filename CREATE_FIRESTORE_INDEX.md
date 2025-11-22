# 🔧 Create Firestore Composite Index

## The Error

You're seeing this error:
```
FirebaseError: The query requires an index.
```

This happens because Firestore needs a **composite index** for queries that filter on multiple fields.

## ✅ Quick Fix (2 ways)

### Method 1: Click the Link (Easiest)

The error message includes a direct link to create the index:

1. **Look at the browser console** - you'll see a URL like:
   ```
   https://console.firebase.google.com/v1/r/project/.../firestore/indexes?create_composite=...
   ```

2. **Click the link** (or copy and paste it in your browser)

3. **Click "Create Index"** in Firebase Console

4. **Wait for the index to build** (usually takes 1-2 minutes)

5. **Refresh your app** - the error should be gone! ✅

### Method 2: Manual Creation

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure:
   - **Collection ID**: `requests`
   - **Fields to index**:
     - `status` (Ascending)
     - `senderId` (Ascending)
   - **Query scope**: Collection
6. Click **Create**

## Why This Index is Needed

The `getAvailableRequests` function queries:
```javascript
where("status", "==", "open")
where("senderId", "!=", currentUserId)
```

Firestore requires a composite index when you:
- Filter on multiple fields
- Use inequality operators (`!=`, `<`, `>`, etc.)

## Index Build Time

- Usually takes **1-2 minutes**
- You'll see status: "Building" → "Enabled"
- The app will work once it's enabled

## Alternative: Modify Query (Not Recommended)

If you want to avoid the index, you could:
1. Fetch all open requests
2. Filter out current user's requests in JavaScript

But this is **less efficient** and costs more (reads all documents).

## After Creating Index

1. Wait for index to finish building
2. Refresh your app
3. Try loading "Available Requests" again
4. It should work! ✅

## Need Help?

- Check Firebase Console → Firestore → Indexes
- Look for index status (Building/Enabled)
- Make sure you're using the correct project

