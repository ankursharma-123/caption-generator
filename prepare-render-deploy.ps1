# Render Deployment Helper Script
# This script helps you prepare for Render deployment

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Render Deployment Helper" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if key.json exists
if (-not (Test-Path "key.json")) {
    Write-Host "ERROR: key.json not found!" -ForegroundColor Red
    Write-Host "Please place your Google Cloud service account key as 'key.json' in the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/3] Checking configuration files..." -ForegroundColor Green

# Check render.yaml
if (Test-Path "render.yaml") {
    Write-Host "✓ render.yaml found" -ForegroundColor Green
} else {
    Write-Host "✗ render.yaml not found!" -ForegroundColor Red
    Write-Host "  This file should be in the project root." -ForegroundColor Yellow
}

# Read .env file for configuration
Write-Host ""
Write-Host "[2/3] Reading environment variables..." -ForegroundColor Green
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $projectId = ($envContent | Select-String "GOOGLE_CLOUD_PROJECT_ID=(.+)").Matches.Groups[1].Value
    $bucketName = ($envContent | Select-String "GOOGLE_CLOUD_BUCKET_NAME=(.+)").Matches.Groups[1].Value
    
    Write-Host "✓ Found project configuration" -ForegroundColor Green
    Write-Host "   Project ID: $projectId" -ForegroundColor Gray
    Write-Host "   Bucket Name: $bucketName" -ForegroundColor Gray
} else {
    Write-Host "⚠ .env file not found" -ForegroundColor Yellow
    $projectId = "your-project-id"
    $bucketName = "your-bucket-name"
}
Write-Host ""

# Read key.json to get a preview
$keyContent = Get-Content "key.json" | ConvertFrom-Json
$keyPreview = @"
Key Details:
  - Project: $($keyContent.project_id)
  - Client Email: $($keyContent.client_email)
  - Key ID: $($keyContent.private_key_id.Substring(0,8))...
"@

Write-Host "[3/3] Generating deployment instructions..." -ForegroundColor Green

$instructions = @"
=================================
RENDER DEPLOYMENT GUIDE
=================================

STEP 1: Push to GitHub
-----------------------
git add .
git commit -m "Prepare for Render deployment"
git push origin master


STEP 2: Create Web Service
---------------------------
1. Go to: https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select branch: master


STEP 3: Configure Service
--------------------------
Name: remotion-caption-app
Region: Choose closest to you
Branch: master
Runtime: Node

Build Command: npm install && npm run build
Start Command: npm start


STEP 4: Add Environment Variables
----------------------------------
In Render Dashboard → Environment tab, add:

Name: GOOGLE_CLOUD_PROJECT_ID
Value: $projectId

Name: GOOGLE_CLOUD_BUCKET_NAME
Value: $bucketName

Name: NEXT_PUBLIC_API_URL
Value: https://remotion-caption-app.onrender.com (update with your actual URL)

Name: NODE_ENV
Value: production


STEP 5: Add Secret File (Important!)
-------------------------------------
1. Scroll to "Secret Files" section
2. Click "Add Secret File"
3. Filename: key.json
4. Contents: (Paste entire key.json file contents)

$keyPreview


STEP 6: Configure Disk Storage
-------------------------------
1. Scroll to "Disk" section
2. Name: uploads-storage
3. Mount Path: /opt/render/project/src/public
4. Size: 10 GB
5. Click "Save Changes"


STEP 7: Select Instance Type
-----------------------------
Recommended: Starter (\$7/month)
- Always on
- 512MB RAM
- Good for production

Free tier also available for testing (spins down after 15 min)


STEP 8: Deploy!
----------------
Click "Create Web Service"
Wait 3-5 minutes for first deployment
Check logs for any errors


STEP 9: Update API URL
-----------------------
After deployment, update NEXT_PUBLIC_API_URL with actual Render URL
This will trigger automatic redeployment


STEP 10: Test Your App
-----------------------
Visit your Render URL and test:
✓ Video upload
✓ Caption generation  
✓ Video preview
✓ Video export
✓ Download


ADVANTAGES OF RENDER:
----------------------
✓ No timeout limits (unlike Vercel)
✓ Persistent disk storage
✓ FFmpeg pre-installed
✓ Better for video processing
✓ More affordable (\$7/mo vs Vercel \$20/mo)
✓ Real servers, not serverless


IMPORTANT NOTES:
----------------
📁 Persistent Storage:
  - Disk storage persists across deployments
  - Uploaded/rendered videos stay on server
  - 10GB = \$2.50/month additional

🔄 Auto-Deploy:
  - Enable in Settings → Auto-Deploy
  - Automatically deploys on git push

💰 Cost Estimate:
  - Free Tier: \$0 (testing only, spins down)
  - Starter: \$7/month
  - Disk (10GB): \$2.50/month
  - Google Cloud: \$7-20/month
  - Total: ~\$16-30/month


TROUBLESHOOTING:
----------------
If build fails:
  - Check logs in Render dashboard
  - Verify all dependencies in package.json
  - Test locally: npm run build

If FFmpeg not found:
  - Should be pre-installed on Render
  - Check build logs
  - Contact Render support if needed

If Google Cloud fails:
  - Verify Secret File is uploaded
  - Check environment variables
  - Ensure project has APIs enabled


NEED HELP?
----------
📖 Full Guide: RENDER_DEPLOYMENT.md
📖 Alternative: DEPLOYMENT.md
📧 Render Support: https://render.com/docs
📧 Community: https://community.render.com

=================================
"@

$instructions | Out-File "RENDER_DEPLOYMENT_INSTRUCTIONS.txt" -Encoding UTF8
Write-Host "✓ Instructions generated!" -ForegroundColor Green
Write-Host "   Saved to: RENDER_DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Gray
Write-Host ""

Write-Host "Summary" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files ready:" -ForegroundColor White
Write-Host "  ✓ render.yaml (configuration)" -ForegroundColor Gray
Write-Host "  ✓ key.json (Google credentials)" -ForegroundColor Gray
Write-Host "  ✓ RENDER_DEPLOYMENT_INSTRUCTIONS.txt (checklist)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Review RENDER_DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Yellow
Write-Host "  2. Read RENDER_DEPLOYMENT.md for complete guide" -ForegroundColor Yellow
Write-Host "  3. Push code to GitHub" -ForegroundColor Yellow
Write-Host "  4. Create service on Render" -ForegroundColor Yellow
Write-Host "  5. Upload key.json as Secret File" -ForegroundColor Yellow
Write-Host "  6. Configure disk storage" -ForegroundColor Yellow
Write-Host "  7. Deploy and test!" -ForegroundColor Yellow
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Render is PERFECT for your video app! 🎬" -ForegroundColor Green
Write-Host "No timeouts, persistent storage, FFmpeg included!" -ForegroundColor Green
Write-Host ""
Write-Host "Good luck with your deployment! 🚀" -ForegroundColor Cyan
