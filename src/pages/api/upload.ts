import type { NextApiRequest, NextApiResponse } from 'next';
import { transcribeAudio, extractAudioFromVideo } from '@/services/speechToText';
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

const upload = multer({
  dest: './public/uploads/',
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadMiddleware = upload.single('video');

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check FFmpeg availability first
    const { execSync } = require('child_process');
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
    } catch (e) {
      return res.status(500).json({
        error: 'FFmpeg not installed',
        details: 'FFmpeg is required to extract audio from video. Please install FFmpeg from https://ffmpeg.org or run: choco install ffmpeg',
      });
    }

    // Check Google Cloud configuration
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID === 'your-project-id') {
      return res.status(500).json({
        error: 'Google Cloud not configured',
        details: 'Please set GOOGLE_CLOUD_PROJECT_ID in your .env file with your actual Google Cloud Project ID',
      });
    }

    if (!process.env.GOOGLE_CLOUD_BUCKET_NAME) {
      return res.status(500).json({
        error: 'Google Cloud Storage not configured',
        details: 'Please set GOOGLE_CLOUD_BUCKET_NAME in your .env file with your bucket name',
      });
    }

    await runMiddleware(req, res, uploadMiddleware);

    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const videoPath = file.path;
    const audioPath = path.join('./public/uploads/', `${file.filename}.mp3`);

    console.log('Extracting audio from video...');
    await extractAudioFromVideo(videoPath, audioPath);

    console.log('Transcribing audio...');
    const captions = await transcribeAudio(audioPath);

    await unlinkAsync(audioPath);

    res.status(200).json({
      success: true,
      videoPath: `/uploads/${file.filename}`,
      captions: captions,
    });
  } catch (error: any) {
    console.error('Error processing video:', error);
    res.status(500).json({
      error: 'Failed to process video',
      details: error.message,
    });
  }
}
