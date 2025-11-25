import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CaptionedVideo } from './compositions/CaptionedVideo';

interface CaptionedVideoProps {
  videoSrc: string;
  captions: Array<{
    text: string;
    startTime: number;
    endTime: number;
    words?: Array<{
      word: string;
      startTime: number;
      endTime: number;
    }>;
  }>;
  style: 'bottom-centered' | 'top-bar' | 'karaoke';
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: "",
          captions: [],
          style: "bottom-centered" as 'bottom-centered' | 'top-bar' | 'karaoke',
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
