# Vercel Deployment Setup Guide

## Why Vercel Might Not Be Working

If your Vercel deployment says "Automatically created" but isn't working, it's likely due to:

1. **Missing Environment Variables** (Most Common)
2. **Build Errors**
3. **Missing Firestore Indexes**

## Step-by-Step Fix

### 1. Add Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (`CommuteDropNew`)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables (use the same values from your `.env.local`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**

### 2. Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

### 3. Check Build Logs

1. Go to **Deployments** tab
2. Click on a deployment to see build logs
3. Look for errors like:
   - Missing environment variables
   - TypeScript errors
   - Build failures

### 4. Common Issues and Fixes

#### Issue: "Environment variable not found"
**Fix**: Add all required Firebase environment variables in Vercel Settings

#### Issue: "Firestore index required"
**Fix**: 
1. Check the error message in the build logs
2. Click the link provided to create the index in Firebase Console
3. Wait for the index to build (can take a few minutes)

#### Issue: "Build failed"
**Fix**:
1. Check the build logs for specific errors
2. Common causes:
   - TypeScript errors
   - Missing dependencies
   - Configuration issues

### 5. Verify Deployment

After deployment succeeds:

1. Check the deployment URL (e.g., `commutedropnew.vercel.app`)
2. Open the browser console to check for errors
3. Test the authentication flow

## Quick Checklist

- [ ] All Firebase environment variables added in Vercel
- [ ] Variables set for Production, Preview, and Development
- [ ] Redeployed after adding variables
- [ ] Build logs show successful build
- [ ] No TypeScript errors
- [ ] Firestore indexes created (if needed)

## Need Help?

If deployment still fails:
1. Check the **Deployments** tab for error messages
2. Check the **Functions** tab for runtime errors
3. Check browser console on the deployed site
4. Verify Firebase configuration is correct

