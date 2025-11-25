import React from 'react';
import { AbsoluteFill, Video, staticFile, useVideoConfig } from 'remotion';
import { Captions, CaptionSegment } from './Captions';

interface CaptionedVideoProps {
  videoSrc: string;
  captions: CaptionSegment[];
  style: 'bottom-centered' | 'top-bar' | 'karaoke';
}

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  videoSrc,
  captions,
  style,
}) => {
  const { width, height } = useVideoConfig();
  
  // Handle video source - if it starts with /, it's already a public path
  const videoSource = videoSrc.startsWith('/') ? staticFile(videoSrc.slice(1)) : staticFile(videoSrc);
  
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Video src={videoSource} style={{ width, height }} />
      </AbsoluteFill>
      <Captions captions={captions} style={style} />
    </AbsoluteFill>
  );
};
