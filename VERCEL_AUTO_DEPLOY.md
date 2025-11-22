# Enable Automatic Deployments on Vercel

## Quick Setup (Recommended - Vercel Native Integration)

Vercel automatically deploys on every push to your connected GitHub repository. Here's how to ensure it's enabled:

### 1. Verify GitHub Integration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`CommuteDropNew`)
3. Go to **Settings** → **Git**
4. Verify that:
   - ✅ GitHub is connected
   - ✅ Repository: `kavyakrish123/CommuteDropNew` is linked
   - ✅ Production Branch: `main` (or `master`)
   - ✅ Auto-deploy is enabled

### 2. Enable Auto-Deploy for All Branches (Optional)

1. In **Settings** → **Git**
2. Under **Production Branch**, ensure `main` is selected
3. Under **Ignored Build Step**, leave it empty (or set to `exit 0` to always build)
4. Enable **Automatic deployments from Git**

### 3. Verify Deployment Settings

1. Go to **Settings** → **Deployments**
2. Ensure:
   - ✅ **Automatic deployments** is enabled
   - ✅ **Deploy on push** is enabled
   - ✅ **Deploy previews** is enabled (for PRs)

### 4. Test Auto-Deployment

1. Make a small change (e.g., update README.md)
2. Commit and push:
   ```bash
   git add .
   git commit -m "test: Auto-deploy test"
   git push
   ```
3. Go to Vercel Dashboard → **Deployments**
4. You should see a new deployment start automatically within seconds

## Troubleshooting

### Issue: Deployments not triggering automatically

**Solution 1: Reconnect GitHub**
1. Go to **Settings** → **Git**
2. Click **Disconnect** (if connected)
3. Click **Connect Git Repository**
4. Select `kavyakrish123/CommuteDropNew`
5. Authorize Vercel to access your repository

**Solution 2: Check Vercel GitHub App**
1. Go to GitHub → Settings → Applications → Installed GitHub Apps
2. Find "Vercel"
3. Ensure it has access to `kavyakrish123/CommuteDropNew` repository
4. If not, reinstall the Vercel GitHub App

**Solution 3: Check Repository Settings**
1. Go to your GitHub repository: `kavyakrish123/CommuteDropNew`
2. Go to **Settings** → **Webhooks**
3. Look for Vercel webhooks
4. Ensure they are active and not failing

### Issue: Builds failing

1. Check **Deployments** tab for error logs
2. Common issues:
   - Missing environment variables (add them in Vercel Settings)
   - Build errors (check TypeScript/ESLint errors)
   - Missing Firestore indexes (create them in Firebase Console)

## Alternative: GitHub Actions (Optional)

If Vercel's native integration isn't working, you can use GitHub Actions as a backup:

1. Go to Vercel Dashboard → **Settings** → **Tokens**
2. Create a new token
3. Go to GitHub → Repository → **Settings** → **Secrets and variables** → **Actions**
4. Add these secrets:
   - `VERCEL_TOKEN` (from step 2)
   - `VERCEL_ORG_ID` (from Vercel project settings)
   - `VERCEL_PROJECT_ID` (from Vercel project settings)
   - All Firebase environment variables (NEXT_PUBLIC_*)

The GitHub Actions workflow (`.github/workflows/vercel-deploy.yml`) will then handle deployments.

## Current Configuration

Your `vercel.json` is configured for:
- ✅ Next.js framework
- ✅ Automatic builds on push
- ✅ Singapore region (sin1) for better latency

## Verification Checklist

- [ ] GitHub repository connected in Vercel
- [ ] Auto-deploy enabled in Vercel settings
- [ ] Production branch set to `main`
- [ ] Environment variables added
- [ ] Test push triggers a deployment
- [ ] Deployment succeeds without errors

## Need Help?

If deployments still don't trigger automatically:
1. Check Vercel Dashboard → **Deployments** for any error messages
2. Check GitHub repository → **Settings** → **Webhooks** for Vercel webhooks
3. Try manually triggering a deployment in Vercel Dashboard
4. Contact Vercel support if the issue persists

