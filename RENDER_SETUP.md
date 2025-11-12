# Render Deployment Setup Guide

## Problem: reCAPTCHA Failing on Render (400 Error)

When trying to register on the deployed app, you may see:

- "reCAPTCHA verification failed"
- Backend returns 400 status
- Works fine locally in development

**Cause**: Environment variables are not set on Render services.

## Solution: Configure Environment Variables

### Step 1: Go to Render Dashboard

Visit https://dashboard.render.com and log in

### Step 2: Configure Backend Service

1. Click on **vocabularymanga-backend** service
2. Go to **Environment** tab
3. Add or update these variables:

| Variable                        | Value                                          |
| ------------------------------- | ---------------------------------------------- |
| `NODE_ENV`                      | `production`                                   |
| `PORT`                          | `10000`                                        |
| `VITE_RECAPTCHA_SECRET_KEY`     | Your reCAPTCHA secret key (from `.env`)        |
| `GEMINI_API_KEY`                | Your Gemini API key (from `.env`)              |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Your Firebase service account JSON (see below) |
| `VITE_FIREBASE_PROJECT_ID`      | `vocabularymanga`                              |
| `SENTRY_DSN`                    | (Optional) Your Sentry DSN                     |

4. Click **Save** - Render will start redeploying

### Step 3: Configure Frontend Service

1. Click on **leximanga-frontend** service
2. Go to **Environment** tab
3. Add or update these variables:

| Variable                            | Value                                          |
| ----------------------------------- | ---------------------------------------------- |
| `VITE_BACKEND_URL`                  | `https://vocabularymanga-backend.onrender.com` |
| `VITE_FIREBASE_API_KEY`             | From your `.env` file                          |
| `VITE_FIREBASE_AUTH_DOMAIN`         | `vocabularymanga.firebaseapp.com`              |
| `VITE_FIREBASE_PROJECT_ID`          | `vocabularymanga`                              |
| `VITE_FIREBASE_STORAGE_BUCKET`      | `vocabularymanga-storage`                      |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From your `.env` file                          |
| `VITE_FIREBASE_APP_ID`              | From your `.env` file                          |
| `VITE_FIREBASE_MEASUREMENT_ID`      | `G-NMWY60C1Z2`                                 |
| `VITE_RECAPTCHA_SITE_KEY`           | From your `.env` file                          |

4. Click **Save** - Render will start redeploying

## Getting Your Environment Variable Values

### Firebase Keys

Get all Firebase-related values from your `.env` file:

```bash
grep FIREBASE .env
grep RECAPTCHA .env
grep GEMINI .env
```

### Firebase Service Account JSON

This is the most important one for the backend:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (**vocabularymanga**)
3. Click **⚙️ Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key** button
6. A JSON file will download - copy its entire content
7. Paste it as the `FIREBASE_SERVICE_ACCOUNT_JSON` value on Render

**Important**: Don't include the downloaded file in your repo - the environment variable is enough!

## Verification

After setting variables and Render finishes redeploying:

1. **Check deployment status** on Render dashboard
2. **Hard refresh** your browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. **Try registering** - reCAPTCHA should now work
4. Check backend logs in Render for any errors

## Troubleshooting

### Still getting 400 error?

1. **Verify all variables are set** - Check Render dashboard Environment tab
2. **Hard refresh browser** - Clear cache completely
3. **Check backend logs** - Render dashboard → Logs tab
4. **Wait for redeploy** - Sometimes takes 2-3 minutes
5. **Try incognito mode** - Bypass browser cache and extensions

### reCAPTCHA still blocked?

- See [ADBLOCK_TROUBLESHOOTING.md](ADBLOCK_TROUBLESHOOTING.md)
- Disable browser extensions temporarily
- Try a different browser

### Registration works but other features fail?

You may be missing other environment variables. Check that all Firebase and API keys are set correctly on Render.

## Environment Variable Reference

**Backend (.env in Render):**

- `VITE_RECAPTCHA_SECRET_KEY` - Backend verification key
- `FIREBASE_SERVICE_ACCOUNT_JSON` - Firebase admin credentials
- `GEMINI_API_KEY` - Translation API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID

**Frontend (.env in Render):**

- `VITE_BACKEND_URL` - Points to backend service
- All `VITE_FIREBASE_*` keys - Firebase configuration
- `VITE_RECAPTCHA_SITE_KEY` - Frontend reCAPTCHA key

## Important Notes

- Frontend variables must start with `VITE_` to be accessible in browser
- Backend variables are private and not exposed to clients
- Never commit `.env` file to Git (it's in `.gitignore`)
- Keep API keys and secrets confidential
- Rotate `FIREBASE_SERVICE_ACCOUNT_JSON` regularly for security

## Quick Summary

1. Set `VITE_RECAPTCHA_SECRET_KEY` on backend
2. Set `VITE_BACKEND_URL` on frontend
3. Set `FIREBASE_SERVICE_ACCOUNT_JSON` on backend
4. Wait for Render to redeploy
5. Hard refresh and test

That's it! Registration should work after these steps.
