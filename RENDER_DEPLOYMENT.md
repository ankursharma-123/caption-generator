# Render Deployment Guide - Complete Step-by-Step

**Render is MUCH BETTER for your video processing app than Vercel!**

## Why Render is Better for This Project

✅ **No timeout limits** - Video rendering can take as long as needed
✅ **Persistent disk storage** - Uploaded/rendered videos stay on disk
✅ **FFmpeg pre-installed** - No need for custom setup
✅ **More memory** - Better for video processing
✅ **Affordable** - Free tier available, paid starts at $7/mo
✅ **Real servers** - Not serverless, better for long-running tasks

---

## Prerequisites

- ✅ Render account (sign up at https://render.com)
- ✅ GitHub account
- ✅ Google Cloud Project with:
  - Speech-to-Text API enabled
  - Cloud Storage bucket created
  - Service account key (key.json)

---

## Step 1: Prepare Your Repository

### 1.1 Create Render-specific Configuration

Create `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: remotion-caption-app
    env: node
    plan: starter  # or 'free' for testing
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18
      - key: GOOGLE_CLOUD_PROJECT_ID
        sync: false
      - key: GOOGLE_CLOUD_BUCKET_NAME
        sync: false
      - key: GOOGLE_APPLICATION_CREDENTIALS
        value: ./key.json
    disk:
      name: uploads-disk
      mountPath: /opt/render/project/src/public
      sizeGB: 10
```

### 1.2 Update package.json Scripts

Ensure your `package.json` has:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint"
  }
}
```

Note: Render sets the `PORT` environment variable automatically.

### 1.3 Commit Changes

```bash
git add render.yaml package.json
git commit -m "Add Render deployment configuration"
git push origin master
```

---

## Step 2: Create Web Service on Render

### 2.1 Sign Up / Log In

1. Go to https://render.com
2. Sign up with GitHub (recommended for easy repo access)

### 2.2 Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account (if not already connected)
3. Select your repository: `remotion-caption-app`
4. Click **"Connect"**

### 2.3 Configure Service

**Basic Settings:**
- **Name**: `remotion-caption-app` (or your preferred name)
- **Region**: Choose closest to you
- **Branch**: `master` (or `main`)
- **Runtime**: `Node`

**Build & Start:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Instance Type:**
- **Free**: Good for testing (512MB RAM, spins down after inactivity)
- **Starter ($7/mo)**: Recommended (512MB RAM, always on)
- **Standard ($25/mo)**: Better for production (2GB RAM)

---

## Step 3: Add Environment Variables

In the Render dashboard, scroll to **"Environment Variables"** section and add:

### 3.1 Required Variables

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=project-234b2101-e620-448e-8cd
GOOGLE_CLOUD_BUCKET_NAME=captiongenerator

# Next.js Configuration
NEXT_PUBLIC_API_URL=https://remotion-caption-app.onrender.com
NODE_ENV=production
```

**Important:** Replace the URL with your actual Render URL (you'll get this after creating the service).

---

## Step 4: Upload Google Cloud Credentials

Render has a **Secret Files** feature perfect for `key.json`:

### 4.1 Add Secret File

1. In the Environment tab, scroll to **"Secret Files"**
2. Click **"Add Secret File"**
3. **Filename**: `key.json`
4. **Contents**: Paste your entire `key.json` contents
5. Click **"Save Changes"**

Render will create this file at `/etc/secrets/key.json` and set `GOOGLE_APPLICATION_CREDENTIALS` automatically.

### 4.2 Alternative: Manual Path Setup

If using a custom path, add this environment variable:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/opt/render/project/src/key.json
```

Then you'll need to upload key.json through the file system or build process.

---

## Step 5: Configure Persistent Disk (Important!)

For your uploaded and rendered videos to persist:

### 5.1 Add Disk

1. Scroll to **"Disks"** section
2. Click **"Add Disk"**
3. **Name**: `uploads-storage`
4. **Mount Path**: `/opt/render/project/src/public`
5. **Size**: `10 GB` (adjust as needed)
6. Click **"Save Changes"**

This ensures your `public/uploads/` and `public/renders/` folders persist across deployments!

---

## Step 6: Deploy!

### 6.1 Create Service

Click **"Create Web Service"** at the bottom of the page.

### 6.2 Monitor Deployment

- Watch the build logs in real-time
- First deployment takes 3-5 minutes
- Look for any errors in the logs

### 6.3 Get Your URL

Once deployed, your app will be available at:
```
https://remotion-caption-app.onrender.com
```

(Use your actual service name)

---

## Step 7: Update Environment Variables with Actual URL

### 7.1 Update NEXT_PUBLIC_API_URL

1. Go to Environment tab
2. Edit `NEXT_PUBLIC_API_URL`
3. Set to your actual Render URL: `https://your-app.onrender.com`
4. Save Changes

This will trigger an automatic redeployment.

---

## Step 8: Test Your Application

### 8.1 Basic Tests

1. ✅ Visit your Render URL
2. ✅ Check homepage loads
3. ✅ Upload a small video (<10MB)
4. ✅ Test caption generation
5. ✅ Test video preview
6. ✅ Export video with captions
7. ✅ Download rendered video

### 8.2 Check Logs

In Render Dashboard:
- Click **"Logs"** tab
- Monitor for any errors
- Check API response times

---

## Step 9: Post-Deployment Configuration

### 9.1 Enable Auto-Deploy

In Settings → **Auto-Deploy**:
- Toggle ON to automatically deploy when you push to GitHub
- Recommended for continuous deployment

### 9.2 Set Up Health Check

Add a health check endpoint if not already present.

Create `src/pages/api/health.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
```

In Render Settings:
- **Health Check Path**: `/api/health`

### 9.3 Configure Custom Domain (Optional)

1. Go to **Settings** → **Custom Domains**
2. Add your domain
3. Configure DNS records as instructed
4. SSL certificates are automatic!

---

## Troubleshooting

### Issue 1: Build Fails

**Error**: "Module not found" or dependency issues

**Solution**:
```bash
# Test locally first
npm install
npm run build
npm start

# If it works locally, check Render logs for specific error
```

### Issue 2: FFmpeg Not Found

**Error**: "FFmpeg command not found"

**Solution**:
Render should have FFmpeg pre-installed. If not, add to `render.yaml`:

```yaml
buildCommand: |
  apt-get update && apt-get install -y ffmpeg
  npm install && npm run build
```

### Issue 3: Google Cloud Auth Fails

**Error**: "Could not load credentials"

**Solution**:
- Verify Secret File is uploaded correctly
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Ensure key.json has proper permissions
- Test credentials locally first

### Issue 4: Service Spins Down (Free Tier)

**Symptom**: First request after inactivity is very slow

**Solution**:
- Upgrade to Starter plan ($7/mo) for always-on service
- Or accept the spin-down on free tier (wakes up in ~30 seconds)

### Issue 5: Disk Space Full

**Error**: "No space left on device"

**Solution**:
- Increase disk size in Settings → Disks
- Implement cleanup script for old files
- Use Google Cloud Storage instead of local disk

### Issue 6: Memory Errors

**Error**: "JavaScript heap out of memory"

**Solution**:
- Upgrade to Standard plan (2GB RAM)
- Optimize video processing
- Process videos in smaller chunks

---

## Performance Optimization

### 1. Enable Caching

Add to your Next.js config:

```javascript
// next.config.js
module.exports = {
  // ... existing config
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}
```

### 2. Implement Cleanup Script

Create a cron job to delete old files:

```bash
# Add to render.yaml
services:
  - type: cron
    name: cleanup-old-files
    schedule: "0 2 * * *"  # Run daily at 2 AM
    command: "node scripts/cleanup.js"
```

Create `scripts/cleanup.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Delete files older than 24 hours
const directories = ['public/uploads', 'public/renders'];
const maxAge = 24 * 60 * 60 * 1000; // 24 hours

directories.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (Date.now() - stats.mtime.getTime() > maxAge) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${filePath}`);
    }
  });
});
```

### 3. Add Request Rate Limiting

Install and configure rate limiting:

```bash
npm install express-rate-limit
```

---

## Monitoring & Maintenance

### 1. Set Up Alerts

In Render Dashboard → Settings:
- Enable email notifications for:
  - Deploy failures
  - Service health issues
  - High resource usage

### 2. Monitor Metrics

Check regularly:
- **CPU Usage** - Should stay under 80%
- **Memory Usage** - Upgrade if consistently near limit
- **Disk Usage** - Clean up or expand as needed
- **Response Times** - Monitor API endpoint performance

### 3. Review Logs

- Check logs weekly for errors
- Look for patterns in failures
- Monitor Google Cloud API usage

---

## Cost Breakdown

### Render Costs

**Free Tier:**
- ✅ 750 hours/month free
- ✅ Good for testing
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512MB RAM

**Starter ($7/mo):**
- ✅ Always on
- ✅ 512MB RAM
- ✅ Custom domains
- ✅ Better for production

**Standard ($25/mo):**
- ✅ 2GB RAM
- ✅ Better performance
- ✅ More concurrent requests

**Disk Storage:**
- $0.25/GB/month
- 10GB = $2.50/month

### Google Cloud Costs

- **Speech-to-Text**: ~$5-15/month
- **Cloud Storage**: ~$2-5/month

**Total Estimated Cost:**
- **Free Tier**: $7-20/month (GCP only)
- **Starter**: $16-32/month
- **Standard**: $34-47/month

---

## Render vs Vercel Comparison

| Feature | Render | Vercel |
|---------|--------|--------|
| **Timeout** | No limit ✅ | 10s (free) / 60s (pro) ❌ |
| **Disk Storage** | Persistent ✅ | Ephemeral ❌ |
| **FFmpeg** | Pre-installed ✅ | Need custom setup ❌ |
| **Video Processing** | Excellent ✅ | Poor ❌ |
| **Free Tier** | 750hrs/month ✅ | Limited functions ⚠️ |
| **Paid Tier** | $7/mo ✅ | $20/mo ❌ |
| **Memory** | 512MB-2GB ✅ | 1GB-3GB ⚠️ |
| **Best For** | Backend/Processing | Static/JAMstack |

**Winner for this project: Render** 🏆

---

## Advanced Configuration

### 1. Enable Redis for Caching

Add Redis service:

```yaml
services:
  - type: redis
    name: caption-cache
    plan: starter
```

Update environment variables:
```
REDIS_URL=<provided by Render>
```

### 2. Background Workers

For long-running tasks:

```yaml
services:
  - type: worker
    name: video-processor
    env: node
    buildCommand: npm install
    startCommand: node workers/video-processor.js
```

### 3. Database (Optional)

If you want to track users/videos:

```yaml
services:
  - type: pserv
    name: postgres-db
    plan: starter
```

---

## Migration from Vercel (if already deployed)

If you deployed to Vercel and want to move to Render:

1. ✅ Keep the same GitHub repo
2. ✅ Create new service on Render
3. ✅ Configure as described above
4. ✅ Test thoroughly
5. ✅ Update DNS to point to Render
6. ✅ Delete Vercel deployment

---

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Set up monitoring and alerts
3. ✅ Implement rate limiting
4. ✅ Add user authentication (if needed)
5. ✅ Optimize for production
6. ✅ Set up automated backups
7. ✅ Configure custom domain
8. ✅ Enable HTTPS (automatic on Render)

---

## Getting Help

**Render Support:**
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

**Project Issues:**
- Check deployment logs in Render dashboard
- Review error messages in browser console
- Test locally with `npm run build && npm start`

---

## Quick Reference Commands

```bash
# Local testing
npm install
npm run build
npm start

# Git deployment
git add .
git commit -m "Deploy to Render"
git push origin master

# View logs
# Go to Render Dashboard → Logs tab

# SSH into service (if needed)
# Available on Standard plan and above
```

---

**🎉 Your app is now deployed on Render with full video processing capabilities!**

Render is the perfect platform for your Remotion caption app. Enjoy the benefits of:
- ⚡ Fast deployments
- 🎬 Full video processing support
- 💾 Persistent storage
- 💰 Affordable pricing
- 🚀 No timeout worries!

Need help? Check the Render documentation or open an issue on GitHub!
