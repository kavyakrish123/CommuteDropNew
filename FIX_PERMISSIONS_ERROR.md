# 🔧 Fix: "Missing or insufficient permissions" Error

## The Problem

You're seeing this error:
```
FirebaseError: Missing or insufficient permissions.
```

This happens because **Firestore security rules are blocking your requests**. By default, Firestore denies all access until you set up rules.

## ✅ Quick Fix (2 minutes)

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project
3. Click **Firestore Database** → **Rules** tab

### Step 2: Paste Test Rules (for development)
Copy and paste this into the rules editor:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for authenticated users (TEST MODE)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish
Click the **Publish** button.

### Step 4: Test
Refresh your app - the error should be gone! ✅

## 🔒 Production Rules

For production, use the rules in `firestore.rules` file (more secure).

## 📋 Additional Setup

### 1. Make sure Authentication is enabled:
- Firebase Console → Authentication → Sign-in method
- Enable **Phone** and **Email/Password**

### 2. Make sure Firestore is created:
- Firebase Console → Firestore Database
- Click "Create database"
- Start in **test mode** (or production with rules)

### 3. Create Composite Index (if needed):
If you see an index error when loading "Available Requests":
- Click the link in the error message (Firebase will create it automatically)
- Or manually: Firestore → Indexes → Create index

## 🐛 Still Not Working?

1. **Check if user is authenticated:**
   - Open browser console
   - Type: `firebase.auth().currentUser`
   - Should show user object, not `null`

2. **Check browser console:**
   - Look for other error messages
   - Check network tab for failed requests

3. **Verify Firebase config:**
   - Check `.env.local` has correct values
   - Restart dev server after changing env vars

## 📚 More Details

See `FIRESTORE_RULES.md` for:
- Detailed rule explanations
- Production-ready rules
- Security best practices
- Troubleshooting guide

