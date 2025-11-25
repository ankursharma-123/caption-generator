import React, { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { Player } from '@remotion/player';
import { CaptionedVideo } from '@/remotion/compositions/CaptionedVideo';
import styles from '@/styles/Home.module.css';

interface CaptionSegment {
  text: string;
  startTime: number;
  endTime: number;
  words?: Array<{
    word: string;
    startTime: number;
    endTime: number;
  }>;
}

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPath, setVideoPath] = useState<string>('');
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<'bottom-centered' | 'top-bar' | 'karaoke'>('bottom-centered');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [renderLoading, setRenderLoading] = useState(false);
  const [renderedVideoPath, setRenderedVideoPath] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setError('');
      setCaptions([]);
      setVideoPath('');
      setRenderedVideoPath('');
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    setLoading(true);
    setStatus('Uploading video...');
    setError('');

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      setStatus('Processing video and extracting audio...');
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setVideoPath(response.data.videoPath);
      setCaptions(response.data.captions);
      setStatus('Captions generated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.details || 'Failed to process video');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleRender = async () => {
    if (!videoPath || !captions || captions.length === 0) {
      setError('Please generate captions first');
      return;
    }

    setRenderLoading(true);
    setStatus('Rendering video with captions...');
    setError('');

    try {
      const response = await axios.post('/api/render', {
        videoPath,
        captions,
        style: selectedStyle,
      });

      setRenderedVideoPath(response.data.outputPath);
      setStatus('Video rendered successfully!');
    } catch (err: any) {
      setError(err.response?.data?.details || 'Failed to render video');
      setStatus('');
    } finally {
      setRenderLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Remotion Captioning Platform</title>
        <meta name="description" content="Auto-generate and render captions on videos" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className={styles.container}>

      <main className={styles.main}>
        <h1 className={styles.title}>Remotion Captioning Platform</h1>
        <p className={styles.description}>
          Upload a video, auto-generate captions, and render them with custom styles
        </p>

        <div className={styles.uploadSection}>
          <input
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            className={styles.fileInput}
            id="video-upload"
          />
          <label htmlFor="video-upload" className={styles.fileLabel}>
            {videoFile ? videoFile.name : 'Choose Video File'}
          </label>

          <button
            onClick={handleUpload}
            disabled={!videoFile || loading}
            className={styles.button}
          >
            {loading ? 'Processing...' : 'Auto-generate Captions'}
          </button>
        </div>

        {status && <p className={styles.status}>{status}</p>}
        {error && <p className={styles.error}>{error}</p>}

        {captions.length > 0 && (
          <div className={styles.captionsSection}>
            <h2>Generated Captions</h2>
            <div className={styles.captionsList}>
              {captions.map((caption, index) => (
                <div key={index} className={styles.captionItem}>
                  <span className={styles.timestamp}>
                    {caption.startTime.toFixed(2)}s - {caption.endTime.toFixed(2)}s
                  </span>
                  <span className={styles.captionText}>{caption.text}</span>
                </div>
              ))}
            </div>

            <div className={styles.styleSelector}>
              <h3>Select Caption Style:</h3>
              <div className={styles.styleButtons}>
                <button
                  onClick={() => setSelectedStyle('bottom-centered')}
                  className={`${styles.styleButton} ${selectedStyle === 'bottom-centered' ? styles.active : ''}`}
                >
                  Bottom Centered
                </button>
                <button
                  onClick={() => setSelectedStyle('top-bar')}
                  className={`${styles.styleButton} ${selectedStyle === 'top-bar' ? styles.active : ''}`}
                >
                  Top Bar
                </button>
                <button
                  onClick={() => setSelectedStyle('karaoke')}
                  className={`${styles.styleButton} ${selectedStyle === 'karaoke' ? styles.active : ''}`}
                >
                  Karaoke Style
                </button>
              </div>
            </div>

            {videoPath && (
              <div className={styles.previewSection}>
                <h3>Preview</h3>
                <Player
                  component={CaptionedVideo}
                  inputProps={{
                    videoSrc: videoPath,
                    captions: captions,
                    style: selectedStyle,
                  }}
                  durationInFrames={300}
                  fps={30}
                  compositionWidth={1920}
                  compositionHeight={1080}
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    aspectRatio: '16/9',
                  }}
                  controls
                />
              </div>
            )}

            <button
              onClick={handleRender}
              disabled={renderLoading}
              className={`${styles.button} ${styles.renderButton}`}
            >
              {renderLoading ? 'Rendering...' : 'Export Video'}
            </button>

            {renderedVideoPath && (
              <div className={styles.downloadSection}>
                <h3>Download Rendered Video</h3>
                <a
                  href={renderedVideoPath}
                  download
                  className={styles.downloadButton}
                >
                  Download MP4
                </a>
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </>
  );
}
