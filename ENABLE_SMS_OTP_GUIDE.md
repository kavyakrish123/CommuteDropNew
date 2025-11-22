# How to Enable SMS OTP in Firebase

This guide will walk you through enabling SMS OTP authentication in your Firebase project.

## 📋 Prerequisites

1. **Firebase Project**: You need a Firebase project (you already have `commutedrop-1a530`)
2. **Billing Account**: Firebase Phone Authentication requires a **paid plan** (Blaze plan - pay-as-you-go)
   - The free Spark plan does NOT support phone authentication
   - You'll be charged per SMS sent (typically $0.01-0.06 per SMS depending on country)

## 🔧 Step-by-Step Setup

### Step 1: Enable Billing (Required)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **commutedrop-1a530**
3. Click on the **⚙️ Settings** icon → **Usage and billing**
4. Click **Modify plan** or **Upgrade to Blaze**
5. Follow the prompts to add a billing account (credit card required)
6. **Note**: You'll only be charged for what you use. There's a free tier for many services.

### Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Find **Phone** in the list of providers
3. Click on **Phone** to open settings
4. Toggle **Enable** to ON
5. Click **Save**

### Step 3: Configure Authorized Domains

1. Still in **Authentication** → **Sign-in method**
2. Click on the **Settings** tab (at the top)
3. Scroll down to **Authorized domains**
4. Make sure these domains are listed:
   - `localhost` (for local development)
   - `commute-drop-new2.vercel.app` (your Vercel domain)
   - Any custom domain you're using
5. To add a domain:
   - Click **Add domain**
   - Enter the domain (e.g., `yourdomain.com`)
   - Click **Add**

### Step 4: Configure reCAPTCHA (Already in Code)

Your code already uses reCAPTCHA verifier. Firebase automatically handles this, but you can verify:

1. Go to **Authentication** → **Settings** → **reCAPTCHA**
2. Make sure **reCAPTCHA Enterprise** is enabled (it's enabled by default)
3. For web apps, Firebase uses invisible reCAPTCHA v3

### Step 5: Test Phone Number (Optional - For Testing)

Firebase allows you to add test phone numbers that don't require actual SMS:

1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Scroll down to **Phone numbers for testing**
3. Click **Add phone number**
4. Enter:
   - Phone number: `+65XXXXXXXX` (your test number)
   - Verification code: `123456` (any 6-digit code)
5. Click **Add**

**Note**: Test numbers only work in development. In production, real SMS will be sent.

### Step 6: Verify Environment Variables

Make sure your `.env.local` or Vercel environment variables have:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=commutedrop-1a530.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=commutedrop-1a530
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=commutedrop-1a530.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🧪 Testing

### Test in Development

1. Start your app: `npm run dev`
2. Go to `/auth` page
3. Enter a phone number (use test number if configured)
4. Click "Send OTP"
5. Complete reCAPTCHA if prompted
6. Enter the OTP code
7. You should be authenticated

### Test in Production

1. Deploy to Vercel
2. Visit your production URL
3. Try with a real phone number
4. You should receive an SMS with the OTP code

## 💰 Pricing

Firebase Phone Authentication pricing (as of 2024):

- **SMS to US/Canada**: $0.01 per SMS
- **SMS to other countries**: $0.02 - $0.06 per SMS
- **Singapore**: Typically $0.02 - $0.03 per SMS

**Free tier**: None for phone authentication (requires Blaze plan)

## 🐛 Troubleshooting

### Issue: "Phone authentication is not enabled"

**Solution**: 
- Go to Authentication → Sign-in method → Phone
- Make sure it's enabled
- Make sure billing is enabled (Blaze plan)

### Issue: "reCAPTCHA verification failed"

**Solution**:
- Make sure your domain is in authorized domains
- Clear browser cache
- Try incognito mode
- Check browser console for errors

### Issue: "SMS not received"

**Solution**:
- Check phone number format (must include country code, e.g., +65XXXXXXXX)
- Verify billing is enabled
- Check Firebase Console → Authentication → Users to see if verification was attempted
- For testing, use test phone numbers

### Issue: "Quota exceeded"

**Solution**:
- Check your Firebase billing quota
- Phone auth has default quotas that can be increased
- Go to Firebase Console → Usage and billing → Quotas

## 📱 Phone Number Format

Your code expects phone numbers in E.164 format:
- ✅ Correct: `+6591234567` (Singapore)
- ✅ Correct: `+1234567890` (US)
- ❌ Wrong: `91234567` (missing country code)
- ❌ Wrong: `65 9123 4567` (spaces not allowed)

## 🔒 Security Notes

1. **Rate Limiting**: Firebase automatically rate-limits phone auth requests
2. **reCAPTCHA**: Prevents abuse and bot attacks
3. **Quotas**: You can set daily quotas in Firebase Console
4. **Test Numbers**: Only work in development, not production

## 📚 Additional Resources

- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [reCAPTCHA Enterprise](https://cloud.google.com/recaptcha-enterprise/docs)

## ✅ Checklist

- [ ] Billing enabled (Blaze plan)
- [ ] Phone authentication enabled in Firebase Console
- [ ] Authorized domains configured
- [ ] Environment variables set correctly
- [ ] Test phone number added (optional)
- [ ] Tested in development
- [ ] Tested in production

---

**Note**: Once you enable billing and phone authentication, SMS OTP will work automatically with your existing code. No code changes needed!

