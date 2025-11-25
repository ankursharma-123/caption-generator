# Vercel Deployment Helper Script
# This script helps you prepare for Vercel deployment

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Vercel Deployment Helper" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if key.json exists
if (-not (Test-Path "key.json")) {
    Write-Host "ERROR: key.json not found!" -ForegroundColor Red
    Write-Host "Please place your Google Cloud service account key as 'key.json' in the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/4] Encoding Google Cloud credentials to base64..." -ForegroundColor Green
$bytes = [System.IO.File]::ReadAllBytes("key.json")
$base64 = [System.Convert]::ToBase64String($bytes)
$base64 | Out-File "google_credentials_base64.txt" -Encoding UTF8

Write-Host "✓ Credentials encoded successfully!" -ForegroundColor Green
Write-Host "   Saved to: google_credentials_base64.txt" -ForegroundColor Gray
Write-Host ""

# Read .env file for other variables
Write-Host "[2/4] Reading environment variables..." -ForegroundColor Green
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

# Generate deployment instructions
Write-Host "[3/4] Generating deployment checklist..." -ForegroundColor Green
$instructions = @"
=================================
VERCEL DEPLOYMENT CHECKLIST
=================================

STEP 1: Push to GitHub
-----------------------
git add .
git commit -m "Prepare for Vercel deployment"
git push origin master


STEP 2: Create Vercel Project
------------------------------
1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Framework: Next.js
4. Root Directory: ./
5. Build Command: npm run build


STEP 3: Add Environment Variables
----------------------------------
In Vercel Dashboard → Settings → Environment Variables, add:

Name: GOOGLE_CREDENTIALS_BASE64
Value: (Copy from google_credentials_base64.txt)

Name: GOOGLE_CLOUD_PROJECT_ID
Value: $projectId

Name: GOOGLE_CLOUD_BUCKET_NAME
Value: $bucketName

Name: NEXT_PUBLIC_API_URL
Value: https://your-app-name.vercel.app (update after deployment)


STEP 4: Deploy
--------------
Click "Deploy" button in Vercel dashboard


STEP 5: Post-Deployment
-----------------------
1. Update NEXT_PUBLIC_API_URL with your actual Vercel URL
2. Test all features:
   - Video upload
   - Caption generation
   - Video rendering
   - Download


IMPORTANT NOTES:
----------------
⚠ Vercel Free Tier Limitations:
  - 10 second function timeout (may not work for video rendering)
  - 4.5MB request/response limit
  - Consider upgrading to Pro (\$20/mo) or use alternative hosting

⚠ FFmpeg on Vercel:
  - Not available by default
  - May need ffmpeg-static package or custom layer
  - See VERCEL_DEPLOYMENT.md for details

📖 Full Guide: See VERCEL_DEPLOYMENT.md for complete instructions

=================================
"@

$instructions | Out-File "DEPLOYMENT_INSTRUCTIONS.txt" -Encoding UTF8
Write-Host "✓ Checklist generated!" -ForegroundColor Green
Write-Host "   Saved to: DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Gray
Write-Host ""

Write-Host "[4/4] Summary" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor White
Write-Host "  ✓ google_credentials_base64.txt" -ForegroundColor Gray
Write-Host "  ✓ DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Review DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Yellow
Write-Host "  2. Read VERCEL_DEPLOYMENT.md for detailed guide" -ForegroundColor Yellow
Write-Host "  3. Push code to GitHub" -ForegroundColor Yellow
Write-Host "  4. Deploy on Vercel" -ForegroundColor Yellow
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Good luck with your deployment! 🚀" -ForegroundColor Green
