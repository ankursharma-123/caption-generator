# Remotion Caption App - Start Script
# This script ensures FFmpeg is in PATH before starting the server

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "    Remotion Captioning Platform - Starting..." -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan

# Add FFmpeg to PATH
$ffmpegDir = "D:\videocaptiongenrator\ffmpeg\ffmpeg-master-latest-win64-gpl\bin"
if (Test-Path $ffmpegDir) {
    $env:Path = "$ffmpegDir;$env:Path"
    Write-Host "✓ FFmpeg added to PATH" -ForegroundColor Green
} else {
    Write-Host "✗ Warning: FFmpeg not found at $ffmpegDir" -ForegroundColor Yellow
    Write-Host "  Some features may not work properly." -ForegroundColor Yellow
}

# Navigate to project directory
Set-Location "D:\videocaptiongenrator\remotion-caption-app"

# Check if .env is configured
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "GOOGLE_CLOUD_PROJECT_ID=project-") {
        Write-Host "✓ Google Cloud configured" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: Google Cloud may not be configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Warning: .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npm run dev
