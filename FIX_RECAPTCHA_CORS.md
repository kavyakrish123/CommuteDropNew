# 🔧 Fix: reCAPTCHA CORS Error

## The Problem

You're seeing this error:
```
Access to script at 'https://www.gstatic.com/recaptcha/...' from origin 'http://localhost:3001' 
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 
'http://localhost:3000' that is not equal to the supplied origin.
```

This happens when:
- The app is running on a different port than when reCAPTCHA was initialized
- reCAPTCHA was cached for a different port
- The dev server port changed

## ✅ Quick Fixes

### Solution 1: Use Port 3000 (Recommended)

The dev server is now configured to always use port 3000:

1. **Stop the dev server** (Ctrl+C)
2. **Kill any process on port 3000** (if needed):
   ```powershell
   # Windows PowerShell
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
3. **Restart dev server**:
   ```bash
   npm run dev
   ```
4. **Access the app at** `http://localhost:3000`

### Solution 2: Clear Browser Cache

1. **Open browser DevTools** (F12)
2. **Application/Storage tab** → **Clear site data**
3. **Or clear cookies** for `localhost`
4. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Solution 2: Use the Correct Port

If Next.js is running on port 3001 but you want 3000:

1. **Stop the dev server**
2. **Kill any process on port 3000**:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
3. **Start dev server** - it should use port 3000

### Solution 3: Clear reCAPTCHA Cache

1. **Open browser DevTools** (F12)
2. **Application/Storage tab** → **Clear site data**
3. **Or clear cookies** for `localhost`
4. **Refresh the page**

## 🔧 What Was Fixed in Code

The code has been updated to:
- ✅ **Lazy initialization**: reCAPTCHA only initializes when you click "Send OTP"
- ✅ **Container cleanup**: Clears the container before initializing
- ✅ **Error handling**: Better error messages and recovery
- ✅ **Port-agnostic**: Works regardless of which port you're on

## 📋 How It Works Now

1. reCAPTCHA is **NOT** initialized when the component mounts
2. It only initializes when you click "Send OTP"
3. The container is cleared before each initialization
4. This prevents CORS issues from port mismatches

## 🐛 Still Having Issues?

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache** completely
3. **Try a different browser** or incognito mode
4. **Check Firebase Console**:
   - Go to Authentication → Settings
   - Make sure Phone authentication is enabled
   - Check authorized domains include `localhost`

## 💡 Prevention

- Always use the same port for development
- Clear cache when switching ports
- Use incognito mode for testing if issues persist

