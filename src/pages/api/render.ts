import type { NextApiRequest, NextApiResponse } from 'next';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition, getVideoMetadata } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

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

    console.log('Render request received:', { videoPath, captionsCount: captions?.length, style });

    if (!videoPath || !captions) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Remove leading slash if present for file system path
    const cleanVideoPath = videoPath.startsWith('/') ? videoPath.slice(1) : videoPath;
    const fullVideoPath = path.join(process.cwd(), 'public', cleanVideoPath);
    
    console.log('Full video path:', fullVideoPath);
    
    if (!fs.existsSync(fullVideoPath)) {
      console.error('Video file not found at:', fullVideoPath);
      return res.status(404).json({ error: 'Video file not found', path: fullVideoPath });
    }
    
    // Get video metadata to determine duration
    const videoMetadata = await getVideoMetadata(fullVideoPath);
    const durationInSeconds = videoMetadata.durationInSeconds || 10;
    const fps = 30;
    const durationInFrames = Math.ceil(durationInSeconds * fps);

    console.log('Starting bundle...');
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'src/remotion/index.tsx'),
      webpackOverride: (config) => config,
    });
    console.log('Bundle complete:', bundleLocation);

    console.log('Selecting composition...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CaptionedVideo',
      inputProps: {
        videoSrc: videoPath,
        captions: captions,
        style: style || 'bottom-centered',
      },
    });
    console.log('Composition selected:', composition.id);

    const outputPath = path.join(
      process.cwd(),
      'public',
      'renders',
      `output-${Date.now()}.mp4`
    );

    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    console.log('Starting render...', { durationInFrames, fps, outputPath });
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
        console.log(`Render progress: ${(progress * 100).toFixed(1)}%`);
      },
    });
    console.log('Render complete!');

    const publicPath = outputPath.replace(path.join(process.cwd(), 'public'), '');

    res.status(200).json({
      success: true,
      outputPath: publicPath,
    });
  } catch (error: any) {
    console.error('Error rendering video:', error);
    res.status(500).json({
      error: 'Failed to render video',
      details: error.message,
    });
  }
}
