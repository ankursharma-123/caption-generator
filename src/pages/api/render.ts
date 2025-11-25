import type { NextApiRequest, NextApiResponse } from 'next';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, getVideoMetadata } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { setRenderProgress, resetRenderProgress } from './render-progress';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
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
    const { videoPath, captions, style } = req.body;

    if (!videoPath || !captions) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    resetRenderProgress();

    // Remove leading slash if present for file system path
    const cleanVideoPath = videoPath.startsWith('/') ? videoPath.slice(1) : videoPath;
    const fullVideoPath = path.join(process.cwd(), 'public', cleanVideoPath);
    
    if (!fs.existsSync(fullVideoPath)) {
      return res.status(404).json({ error: 'Video file not found', path: fullVideoPath });
    }
    
    // Get video metadata to determine duration
    setRenderProgress(5);
    const videoMetadata = await getVideoMetadata(fullVideoPath);
    const durationInSeconds = videoMetadata.durationInSeconds || 10;
    const fps = 30;
    const durationInFrames = Math.ceil(durationInSeconds * fps);

    setRenderProgress(10);
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'src/remotion/index.tsx'),
      webpackOverride: (config) => config,
    });

    setRenderProgress(20);
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CaptionedVideo',
      inputProps: {
        videoSrc: videoPath,
        captions: captions,
        style: style || 'bottom-centered',
      },
    });

    const outputPath = path.join(
      process.cwd(),
      'public',
      'renders',
      `output-${Date.now()}.mp4`
    );

    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames,
        fps,
      },
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        videoSrc: videoPath,
        captions: captions,
        style: style || 'bottom-centered',
      },
      onProgress: ({ progress }) => {
        // Convert progress from 0-1 to percentage and map from 20% to 100%
        const mappedProgress = 20 + (progress * 100 * 0.8);
        setRenderProgress(mappedProgress);
      },
    });

    setRenderProgress(100);

    // Small delay to ensure frontend gets the 100% update
    await new Promise(resolve => setTimeout(resolve, 500));

    const publicPath = outputPath.replace(path.join(process.cwd(), 'public'), '');

    res.status(200).json({
      success: true,
      outputPath: publicPath,
    });
    
    // Clean up progress file after response is sent
    setTimeout(() => resetRenderProgress(), 1000);
  } catch (error: any) {
    console.error('Error rendering video:', error);
    resetRenderProgress();
    res.status(500).json({
      error: 'Failed to render video',
      details: error.message,
    });
  }
}
