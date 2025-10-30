# Firebase Service Account Setup Guide

This guide will help you configure Firebase Admin SDK credentials to eliminate OAuth popups and enable full server-side functionality.

## Why Do You Need This?

Without service account credentials:
- ❌ OAuth popup appears in development: "Grant access to Google Cloud resources"
- ❌ Cannot save driver details or user profile data
- ❌ Limited Firebase Admin functionality
- ❌ Errors like "Could not save your driver details"

With service account credentials:
- ✅ No OAuth popups in any environment
- ✅ Full admin privileges (save reports, update profiles, etc.)
- ✅ Works seamlessly in development and production
- ✅ All features function properly

## Step-by-Step Setup

### Step 1: Download Service Account JSON from Firebase

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select your project: **studio-3233859570-d7bfa**

2. **Navigate to Service Accounts:**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Click **"Project settings"**
   - Go to the **"Service accounts"** tab

3. **Generate New Private Key:**
   - Scroll down to **"Firebase Admin SDK"**
   - Click the **"Generate new private key"** button
   - Click **"Generate key"** in the confirmation dialog
   - A JSON file will be downloaded (e.g., `studio-3233859570-d7bfa-firebase-adminsdk-xxxxx.json`)

4. **Save the file securely** (you'll need it in the next step)

### Step 2: Configure Environment Variables

#### Option A: Use the Setup Script (Recommended)

```bash
# Run the helper script with the path to your downloaded JSON file
./setup-service-account.sh ~/Downloads/studio-3233859570-d7bfa-firebase-adminsdk-xxxxx.json
```

The script will:
- Validate the JSON file
- Minify it to a single line
- Add it to your `.env` file automatically

#### Option B: Manual Configuration

1. **Open the downloaded JSON file** in a text editor

2. **Minify the JSON** (remove all line breaks and spaces):
   ```bash
   # Using jq (recommended)
   cat your-service-account.json | jq -c .

   # Or using Node.js
   node -e "console.log(JSON.stringify(require('./your-service-account.json')))"
   ```

3. **Add to .env file:**
   - Open `/home/user/studio/.env`
   - Find the line that says `# FIREBASE_SERVICE_ACCOUNT_KEY=...`
   - Replace it with (keep the entire JSON on ONE line):
   ```bash
   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"studio-3233859570-d7bfa",...}'
   ```

### Step 3: Restart Your Development Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 4: Test the App

1. Go to the **Driver** section (enneagram configuration page)
2. Fill in your enneagram details:
   - Dominant Enneagram Type
   - Strongest Wing
   - Subtype
   - Instinctual Stacking
   - Trifix/Tritype
3. Click to save or navigate to generate a report
4. ✅ **You should NOT see any OAuth popups**
5. ✅ **The error "Could not save your driver details" should be gone**

## Troubleshooting

### Error: "Could not save your driver details"

**Cause:** Service account credentials not configured or invalid

**Fix:**
1. Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is in your `.env` file
2. Ensure it's valid JSON (no syntax errors)
3. Restart your development server

### Error: "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY"

**Cause:** Invalid JSON format

**Fix:**
1. Re-download the service account JSON from Firebase Console
2. Use the setup script or minify properly
3. Ensure no line breaks in the .env file value
4. Wrap the value in single quotes: `FIREBASE_SERVICE_ACCOUNT_KEY='...'`

### OAuth Popup Still Appears

**Cause:** Environment variable not loaded

**Fix:**
1. Verify the `.env` file has the `FIREBASE_SERVICE_ACCOUNT_KEY` line
2. Restart your development server completely
3. Check the terminal logs for: "Firebase Admin initialized with service account credentials."

### Checking if Service Account is Working

Look at your development server terminal output. You should see:
```
✓ Ready in X.Xs
Firebase Admin initialized with service account credentials.
```

If you see this instead, credentials are NOT configured:
```
Firebase Admin initialized with application default credentials.
```

## Production Deployment (Firebase App Hosting)

For production environments, set the environment variable in Firebase App Hosting:

### Via Firebase Console:
1. Go to Firebase Console → App Hosting
2. Select your backend
3. Go to **Environment variables**
4. Add variable:
   - Name: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Value: (paste the minified JSON)

### Via Firebase CLI:
```bash
# Set the environment variable
firebase apphosting:secrets:set FIREBASE_SERVICE_ACCOUNT_KEY

# When prompted, paste the entire minified JSON
```

## Security Best Practices

### ⚠️ CRITICAL SECURITY WARNINGS

1. **NEVER commit .env files to git**
   - Verify `.env` is in `.gitignore`
   - Service account credentials grant full admin access to your Firebase project

2. **Rotate keys regularly**
   - Generate new keys periodically
   - Delete old keys from Firebase Console

3. **Use environment-specific keys**
   - Different keys for development, staging, and production
   - This limits damage if a key is compromised

4. **Monitor service account usage**
   - Check Firebase Console → IAM & Admin → Service Accounts
   - Review activity logs regularly

### Checking .gitignore

Verify `.env` is excluded from git:
```bash
cat .gitignore | grep ".env"
```

Should show:
```
.env
.env.local
.env.*.local
```

## What This Fixes

✅ **No more OAuth popups** - Service account authenticates automatically
✅ **Save driver details** - Full Firestore write permissions
✅ **Generate reports** - Can create and store reports
✅ **Update user profiles** - Can modify Firebase Auth user properties
✅ **Works in all environments** - Development, prototyper, and production

## Files Modified

- `src/firebase/admin.ts` - Now supports service account credentials
- `.env` - Contains the service account JSON (after setup)

## Need Help?

If you continue to experience issues:
1. Check the troubleshooting section above
2. Verify your Firebase project ID matches: `studio-3233859570-d7bfa`
3. Ensure you downloaded the correct service account for this project
4. Check the browser console and server logs for specific error messages

---

**Last Updated:** October 29, 2025
**Firebase Project:** studio-3233859570-d7bfa
