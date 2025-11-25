import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const status: any = {
    ffmpeg: false,
    googleCloudProjectId: false,
    googleCloudBucket: false,
    keyJson: false,
  };

  const messages: string[] = [];

  // Check FFmpeg
  try {
    const { execSync } = require('child_process');
    execSync('ffmpeg -version', { stdio: 'ignore' });
    status.ffmpeg = true;
    messages.push('✓ FFmpeg is installed');
  } catch (e) {
    messages.push('✗ FFmpeg is NOT installed - Install from https://ffmpeg.org');
  }

  // Check Google Cloud Project ID
  if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PROJECT_ID !== 'your-project-id') {
    status.googleCloudProjectId = true;
    messages.push(`✓ Google Cloud Project ID is set: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
  } else {
    messages.push('✗ Google Cloud Project ID is NOT configured in .env file');
  }

  // Check Google Cloud Bucket
  if (process.env.GOOGLE_CLOUD_BUCKET_NAME) {
    status.googleCloudBucket = true;
    messages.push(`✓ Google Cloud Bucket is set: ${process.env.GOOGLE_CLOUD_BUCKET_NAME}`);
  } else {
    messages.push('✗ Google Cloud Bucket Name is NOT configured in .env file');
  }

  // Check key.json
  const fs = require('fs');
  const path = require('path');
  const keyPath = path.join(process.cwd(), 'key.json');
  if (fs.existsSync(keyPath)) {
    status.keyJson = true;
    messages.push('✓ key.json file exists');
  } else {
    messages.push('✗ key.json file is MISSING');
  }

  const allReady = Object.values(status).every(v => v === true);

  res.status(200).json({
    ready: allReady,
    status,
    messages,
    instructions: {
      ffmpeg: 'Install FFmpeg: choco install ffmpeg (or download from ffmpeg.org)',
      googleCloud: 'Update .env file with your actual Google Cloud Project ID and Bucket Name',
      keyJson: 'Place your Google Cloud service account key.json in the project root',
    }
  });
}
