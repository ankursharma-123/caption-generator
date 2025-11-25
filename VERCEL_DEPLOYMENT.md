# Vercel Deployment Guide - Step by Step

This guide will walk you through deploying your Remotion Caption App to Vercel.

## ⚠️ Important Limitations on Vercel

**Before deploying, understand these Vercel constraints:**

1. **Serverless Function Timeout**: 
   - Free tier: 10 seconds max
   - Pro tier: 60 seconds max (upgrade needed for video rendering)
   
2. **File Size Limits**:
   - Request body: 4.5MB max (can cause issues with large video uploads)
   - Response body: 4.5MB max
   
3. **No Persistent File System**:
   - Uploaded files and rendered videos won't persist between requests
   - Need to use external storage (Google Cloud Storage)

4. **Memory Limits**:
   - 1GB RAM on free tier (may struggle with large videos)
   - 3GB RAM on Pro tier

**Recommendation**: For this app with video rendering, consider:
- **Option A**: Use Vercel for frontend + separate backend (Railway, Render, DigitalOcean)
- **Option B**: Deploy everything to Render/Railway (better for video processing)
- **Option C**: Use Vercel Pro ($20/mo) with external storage

---

## Prerequisites

✅ GitHub account
✅ Vercel account (sign up at https://vercel.com)
✅ Google Cloud Project with:
   - Speech-to-Text API enabled
   - Cloud Storage bucket created
   - Service account key (key.json)
✅ FFmpeg (for local development)

---

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
# If not already initialized
cd D:\videocaptiongenrator\remotion-caption-app

# Check current status
git status

# Push to GitHub (if not done already)
git push origin master
```

### 1.2 Verify .gitignore

Make sure these are in `.gitignore`:

```
# Sensitive files
.env
.env.local
key.json

# Build output
.next/
out/

# Dependencies
node_modules/

# Uploads and renders
public/uploads/
public/renders/
public/.render-progress.json
```

### 1.3 Create vercel.json (Optional but Recommended)

```bash
# Create vercel configuration
New-Item -Path "vercel.json" -ItemType File
```

Add this configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "memory": 3008,
      "maxDuration": 60
    }
  },
  "env": {
    "GOOGLE_CLOUD_PROJECT_ID": "@google_cloud_project_id",
    "GOOGLE_CLOUD_BUCKET_NAME": "@google_cloud_bucket_name"
  }
}
```

---

## Step 2: Configure Google Cloud Storage

Since Vercel's file system is ephemeral, we need to modify the code to use Google Cloud Storage for uploads and renders.

### 2.1 Update Upload Handler

The current upload saves to local disk. For Vercel, uploads should go directly to Google Cloud Storage.

**Files to modify:**
- `src/pages/api/upload.ts` - Save uploaded videos to GCS
- `src/pages/api/render.ts` - Save rendered videos to GCS

### 2.2 Update File Paths

Change from local paths to GCS URLs:
- Uploads: `gs://your-bucket/uploads/`
- Renders: `gs://your-bucket/renders/`

---

## Step 3: Encode Google Credentials

For Vercel, you can't upload `key.json` directly. Use base64 encoding:

### 3.1 Encode key.json (PowerShell)

```powershell
# Navigate to your project
cd D:\videocaptiongenrator\remotion-caption-app

# Encode key.json to base64
$bytes = [System.IO.File]::ReadAllBytes("key.json")
$base64 = [System.Convert]::ToBase64String($bytes)
$base64 | Out-File "google_credentials_base64.txt"

# The base64 string is now in google_credentials_base64.txt
# Copy this value - you'll need it for Vercel
```

### 3.2 Create Credential Handler

Create `src/lib/credentials.ts`:

```typescript
import fs from 'fs';
import path from 'path';

/**
 * Initializes Google Cloud credentials from environment variable
 * For Vercel deployment where key.json can't be uploaded
 */
export function initializeGoogleCredentials(): void {
  // If running locally with key.json, skip
  if (fs.existsSync(path.join(process.cwd(), 'key.json'))) {
    return;
  }

  // Decode base64 credentials and write to temporary file
  const base64Creds = process.env.GOOGLE_CREDENTIALS_BASE64;
  if (base64Creds) {
    const keyJson = Buffer.from(base64Creds, 'base64').toString('utf-8');
    const keyPath = '/tmp/google-credentials.json';
    fs.writeFileSync(keyPath, keyJson);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
  }
}
```

Call this in your API routes before using Google Cloud services.

---

## Step 4: Deploy to Vercel

### 4.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 4.2 Connect to Vercel via CLI

```bash
vercel login
```

### 4.3 Deploy via Dashboard (Easier)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New"** → "Project"
3. **Import Git Repository**: Select your GitHub repo
4. **Configure Project**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Environment Variables** (Critical!):
   Click "Environment Variables" and add:

   ```
   GOOGLE_CREDENTIALS_BASE64=<paste the base64 string from step 3>
   GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
   GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name
   NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
   ```

6. **Click "Deploy"**

### 4.4 Wait for Deployment

- First deployment takes 2-5 minutes
- Watch the build logs for any errors
- Note your deployment URL: `https://your-app-name.vercel.app`

---

## Step 5: Verify Deployment

### 5.1 Check Build Logs

- Look for any warnings or errors
- Verify all dependencies installed
- Check for TypeScript compilation issues

### 5.2 Test the Application

1. **Homepage loads**: Visit your Vercel URL
2. **Upload small video** (< 10MB for testing)
3. **Check console** for errors (F12 → Console)
4. **Test caption generation**
5. **Test video rendering** (may timeout on free tier!)

---

## Step 6: Troubleshooting Common Issues

### Issue 1: Function Timeout (Most Common)

**Error**: "FUNCTION_INVOCATION_TIMEOUT"

**Solution**:
- Upgrade to Vercel Pro ($20/mo) for 60s timeouts
- Or move video rendering to a background service
- Or use a different host for backend (Render, Railway)

### Issue 2: Build Fails

**Error**: "Module not found" or TypeScript errors

**Solution**:
```bash
# Ensure all dependencies are in package.json
npm install --save-dev @types/node @types/react

# Check for missing packages
npm install
```

### Issue 3: API Routes Return 404

**Solution**:
- Check file paths use correct casing
- Verify API routes are in `src/pages/api/`
- Check next.config.js for route configuration

### Issue 4: Google Cloud Authentication Fails

**Solution**:
- Verify base64 encoding is correct
- Check environment variables are set
- Test credentials locally first
- Ensure credentials.ts is being called

### Issue 5: File Uploads Fail

**Error**: "Request body too large"

**Solution**:
- Implement chunked uploads
- Use direct upload to Google Cloud Storage from frontend
- Reduce file size limits

---

## Step 7: Post-Deployment Configuration

### 7.1 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 7.2 Set Up Error Monitoring

Add error tracking to catch production issues:

```bash
npm install @sentry/nextjs
```

### 7.3 Enable Analytics

Vercel provides free analytics:
- Go to Analytics tab in dashboard
- Enable Web Analytics

### 7.4 Configure CORS (if needed)

In `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
      ],
    },
  ];
}
```

---

## Alternative: Hybrid Deployment (Recommended)

For better performance with video processing:

**Frontend on Vercel** (Fast, global CDN)
- Next.js UI
- Preview player
- Static assets

**Backend on Railway/Render** (Better for long-running tasks)
- Video upload handling
- Audio extraction
- Caption generation
- Video rendering

**Storage on Google Cloud**
- Uploaded videos
- Rendered videos
- Audio files

---

## Cost Estimates

### Vercel
- **Free Tier**: Limited (10s timeout, may not work for rendering)
- **Pro Tier**: $20/month (60s timeout, still limited)
- **Enterprise**: Custom pricing

### Google Cloud (Monthly)
- Speech-to-Text: ~$5-15 (depends on usage)
- Cloud Storage: ~$2-5
- **Total**: ~$7-20/month

### Recommendation
Start with Vercel Free + Google Cloud to test, then:
- Upgrade to Vercel Pro if you need it, OR
- Move backend to Railway ($5/mo) or Render (free tier available)

---

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Implement rate limiting
4. ✅ Add user authentication (if needed)
5. ✅ Optimize for production (caching, compression)
6. ✅ Document API endpoints
7. ✅ Create user guide

---

## Getting Help

**Vercel Issues:**
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

**Project Issues:**
- Check logs in Vercel Dashboard
- Enable debug mode: Add `DEBUG=*` to environment variables
- Review console errors in browser

---

**Need help?** Check the main DEPLOYMENT.md for alternative hosting options!
