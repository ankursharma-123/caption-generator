import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const PROGRESS_FILE = path.join(process.cwd(), 'public', '.render-progress.json');

export function setRenderProgress(progress: number) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ progress: clampedProgress, timestamp: Date.now() }));
  } catch (error) {
    console.error('Error writing progress:', error);
  }
}

export function resetRenderProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      fs.unlinkSync(PROGRESS_FILE);
    }
  } catch (error) {
    console.error('Error resetting progress:', error);
  }
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      const progressData = JSON.parse(data);
      res.status(200).json({ progress: progressData.progress });
    } else {
      res.status(200).json({ progress: 0 });
    }
  } catch (error) {
    console.error('Error reading progress:', error);
    res.status(200).json({ progress: 0 });
  }
}
