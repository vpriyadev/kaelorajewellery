# Kaelora Jewellery - Vercel Deployment Guide

## Critical: Vercel Environment Variables Setup

### Problem
After moving to a new repository/project, if products are not loading and authentication is failing, it's likely because **Vercel environment variables are not configured**.

Local development uses `.env.local`, but Vercel needs these variables to be explicitly set in the project settings.

---

## Step 1: Firebase Configuration in Vercel

### Required Environment Variables (MUST be set in Vercel)

1. **Log in to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: kaelora (or the relevant project)
3. **Go to Settings** → **Environment Variables**
4. **Add each of the following variables:**

| Variable Name | Source | Value |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console | AIzaSyCBzcpcv_GmLfNeNwJRFroghclDK6NcPEM |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Console | kaelora-jewellery.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console | kaelora-jewellery |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Console | kaelora-jewellery.firebasestorage.app |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console | 639835407657 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console | 1:639835407657:web:577a7fad81d81f199e2338 |

### How to Find Firebase Values
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **kaelora-jewellery**
3. Click **Project Settings** (gear icon)
4. Under **Your apps**, find the Web app section
5. Copy the config object values into Vercel

---

## Step 2: Verify Firebase Authorized Domains

In **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**, ensure these are listed:
- ✓ `localhost`
- ✓ `kaelorajewellery.com`
- ✓ `www.kaelorajewellery.com`

**If these are missing, users cannot authenticate.**

---

## Step 3: Verify Firestore Database Access

### Collections Required
The following collections must exist in Firestore:
- ✓ `products` - Product catalog (should contain existing products)
- ✓ `users` - User profiles (created on first login)
- ✓ `orders` - Customer orders
- ✓ `reviews` - Product reviews
- ✓ `settings` - Global store settings

### Check Product Collection
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **kaelora-jewellery**
3. Go to **Firestore Database**
4. Click on **products** collection
5. **VERIFY**: Products should be visible here

**If the `products` collection is empty, products won't load in the app.**

---

## Step 4: Other Required Environment Variables

Also ensure these are set in Vercel:

| Variable | Purpose | From |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Image uploads | Cloudinary Dashboard |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Image uploads | Cloudinary Dashboard |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Image uploads | Cloudinary Dashboard |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Payments (Live) | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Payments (Backend) | Razorpay Dashboard |
| `RESEND_API_KEY` | Email sending | Resend Dashboard |

---

## Step 5: Redeploy

After adding all environment variables:

1. **Option A (Automatic)**: Push a commit to `main` branch - Vercel will auto-redeploy
2. **Option B (Manual)**: In Vercel Dashboard, click **Deployments** → **Redeploy** on latest build

---

## Troubleshooting

### Problem: Products still not loading
**Check**:
1. [ ] All 6 Firebase env vars are set in Vercel
2. [ ] `products` collection exists and has documents in Firestore
3. [ ] Rebuild/redeploy after setting variables

**Verify in Browser Console**:
- Open DevTools (F12)
- Go to Console tab
- Look for messages like: `[Firestore] Products loaded: { count: XX }`
- If you see errors, check Firebase permission rules

### Problem: Authentication failing
**Check**:
1. [ ] Firebase authorized domains include `kaelorajewellery.com` and `www.kaelorajewellery.com`
2. [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is exactly `kaelora-jewellery.firebaseapp.com`
3. [ ] All 6 Firebase variables are set

### Problem: Deployment still showing old/broken code
**Fix**: 
1. In Vercel Dashboard, click **Deployments**
2. Click the three-dot menu on latest deployment
3. Select **Redeploy**

---

## Local Development

To test locally before deploying:

1. **Ensure `.env.local` exists** with all values:
```bash
cp .env.local.example .env.local
# Then edit .env.local and fill in actual Firebase values
```

2. **Run dev server**:
```bash
npm run dev
```

3. **Test**:
   - Open http://localhost:3000
   - Products should load
   - Try signing in with Google

---

## Git Checklist

✓ Never commit `.env.local` (it's in `.gitignore`)
✓ Only commit `.env.local.example` (template)
✓ Keep Firebase keys safe - only in Vercel env vars

---

## Production Build Testing

To test production build locally:
```bash
npm run build
npm start
```

Check for errors in the output.

---

## Files Modified
- `.env.local.example` - Updated with all required variables template
- `DEPLOYMENT.md` - This file (NEW)

---

## Need Help?

**If products still don't load after following these steps:**

1. Check Vercel build logs for Firebase initialization errors
2. Verify Firestore security rules allow reads:
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{document=**} {
         allow read;
         allow write: if request.auth.uid != null && request.auth.token.admin == true;
       }
     }
   }
   ```
3. Confirm products exist in `products` collection in Firestore

