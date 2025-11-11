# Environment Setup Guide

## ⚠️ CRITICAL: API Keys and Secrets Management

**NEVER commit `.env` files to git!** API keys in git history are visible forever and can be misused.

## Quick Setup (5 minutes)

### 1. Copy the Template File

```bash
# Create your local .env file from the template
cp .env.example .env
```

### 2. Add Your API Keys

Edit the `.env` file and replace placeholders with your actual keys:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... etc
```

### 3. Verify .gitignore

The following files are protected and will NOT be committed:

```
✅ .env (ignored)
✅ server/.env (ignored)
✅ .env.local (ignored)
✅ server/.env.local (ignored)
```

### 4. Start Development

```bash
npm run dev          # Frontend
npm run dev:server   # Backend
```

## Getting API Keys

### Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click "Project Settings" (gear icon)
4. Copy the Web App config
5. Paste values into `.env`

### Google Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Paste as `VITE_GEMINI_API_KEY` in `.env`

### Google reCAPTCHA v3

1. Go to [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Select your site
3. Copy **Site Key** → `VITE_RECAPTCHA_SITE_KEY`
4. Copy **Secret Key** → `VITE_RECAPTCHA_SECRET_KEY`

## Security Safeguards

### 🚫 Pre-Commit Hook (Automatic)

A pre-commit hook automatically prevents commits of sensitive files:

```bash
# If you try to commit .env, you'll see:
❌ ERROR: Attempting to commit sensitive file: .env
This file contains API keys and secrets and should NOT be committed!

✅ How to fix:
   1. Run: git reset HEAD .env
   2. Add .env to .gitignore
   3. Try committing again
```

### ✅ Protected Files

The following files are automatically rejected:

- `.env`
- `server/.env`
- `.env.local`
- `server/.env.local`
- Files containing: `GEMINI_API_KEY`, `RECAPTCHA_SECRET`, etc.

### 📋 Git Ignore Rules

```
# Local environment files
.env
.env.local
server/.env
server/.env.local
```

## Common Issues

### ❓ "Module not found" errors

**Cause**: Missing `.env` file
**Solution**:

```bash
cp .env.example .env
# Add your API keys
```

### ❓ "API key not configured" error

**Cause**: Empty API key in `.env`
**Solution**:

1. Check `.env` is not empty
2. Verify keys are correct
3. Restart dev server

### ❓ "Failed to commit"

**Cause**: Pre-commit hook detected sensitive file
**Solution**:

```bash
git reset HEAD .env
# The .env file stays locally, just not committed
```

## For New Team Members

1. Clone the repository
2. Copy the template: `cp .env.example .env`
3. Ask team lead for API keys (never share via email/chat)
4. Paste keys into `.env`
5. Start developing!

## Production Deployment

**On Render/Cloud Platform:**

1. ❌ DO NOT commit `.env` file
2. ✅ Set environment variables in platform dashboard:
   - Render Dashboard → Environment
   - Heroku Config Vars
   - AWS Secrets Manager
   - etc.

3. ✅ Use platform's secret management

## Verifying Setup

```bash
# Check that .env is ignored
git status .env
# Should show: "nothing to commit, working tree clean"

# Check pre-commit hook is active
ls -la .git/hooks/pre-commit
# Should show: -rwxr-xr-x (executable)

# Test the hook
echo "GEMINI_API_KEY=test" > .env
git add .env
git commit -m "test"
# Should show: ❌ ERROR: Attempting to commit sensitive file: .env
```

## Additional Resources

- [Gitignore Documentation](https://git-scm.com/docs/gitignore)
- [Pre-commit Hooks Guide](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [12 Factor App - Config](https://12factor.net/config)
- [OWASP - Secrets Management](https://owasp.org/www-project-top-10/)

---

**Questions?** Check the main README.md or contact the team lead.
