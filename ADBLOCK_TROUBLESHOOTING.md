# Ad Blocker Troubleshooting Guide

## Problem

When registering or using the app, you may see errors like:

- "reCAPTCHA failed, try again"
- `net::ERR_BLOCKED_BY_CLIENT` for Firestore
- Firebase connection issues

This is caused by ad blockers blocking Google services (reCAPTCHA, Firestore, etc.).

## Solutions

### Solution 1: Disable Ad Blocker (Quickest)

**Temporarily disable your ad blocker:**

1. Click the ad blocker extension icon in your browser
2. Select "Disable on this site" or "Turn off"
3. Refresh the page
4. Try registering again

**Common ad blockers:**

- uBlock Origin
- Adblock Plus
- AdGuard
- Brave Shield

### Solution 2: Add Exception to Ad Blocker (Recommended)

**For uBlock Origin:**

1. Click the uBlock Origin icon
2. Click the "settings" icon
3. Go to "My filters"
4. Add these exceptions:
   ```
   @@||www.google.com/recaptcha^$domain=vocabularymanga.onrender.com
   @@||www.gstatic.com^$domain=vocabularymanga.onrender.com
   @@||firestore.googleapis.com^$domain=vocabularymanga.onrender.com
   @@||recaptcha.net^$domain=vocabularymanga.onrender.com
   ```

**For Adblock Plus:**

1. Click Adblock Plus icon
2. Click "Options"
3. Go to "My Filters"
4. Add these rules:
   ```
   @@www.google.com/recaptcha||
   @@www.gstatic.com||
   @@firestore.googleapis.com||
   @@recaptcha.net||
   ```

**For AdGuard:**

1. Open AdGuard settings
2. Go to "Whitelist"
3. Add these domains:
   ```
   www.google.com
   www.gstatic.com
   firestore.googleapis.com
   recaptcha.net
   ```

### Solution 3: Use Incognito/Private Mode

Most browsers have incognito/private modes where extensions (including ad blockers) are disabled:

- **Chrome/Edge**: Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
- **Firefox**: Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- **Safari**: Press `Cmd+Shift+N` (Mac)

### Solution 4: Try a Different Browser

If the above doesn't work, try:

- Chrome
- Firefox
- Safari
- Edge

Different browsers have different extension compatibility.

### Solution 5: Browser Settings

**Check if Content Blocker is enabled:**

**Safari (Mac):**

1. Safari → Preferences
2. Security tab
3. Uncheck "Block pop-ups"

**Brave:**

1. Settings → Privacy and security
2. Disable "Shields" for the site

## Domains to Whitelist

If you want to be selective, these are the essential domains:

- `www.google.com/recaptcha` - reCAPTCHA verification
- `www.gstatic.com` - Google Static files
- `firestore.googleapis.com` - Firebase database
- `recaptcha.net` - reCAPTCHA requests
- `identitytoolkit.googleapis.com` - Firebase Auth

## Backend Configuration

The server has been configured with proper CSP headers to allow these domains:

- Content Security Policy (CSP) includes reCAPTCHA domains
- CORS headers allow Firebase communication
- All necessary headers are set

## Still Having Issues?

1. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Develop → Empty Web Caches

2. **Hard refresh**:
   - Chrome/Firefox/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Safari: Cmd+Option+R

3. **Try without extensions**:
   - Use incognito/private mode
   - Try a fresh browser

4. **Check browser console** (F12) for more specific errors

## For Developers

If you're deploying this app:

1. Communicate to users that ad blockers may interfere
2. Consider adding a warning banner when reCAPTCHA fails
3. Ensure proper CSP headers are configured (already done)
4. Test in incognito mode during development

## Technical Details

This app uses:

- **reCAPTCHA v3** for bot prevention during registration
- **Firebase** for database, auth, and storage
- **Google APIs** for these services

These are all legitimate services and safe to whitelist.
