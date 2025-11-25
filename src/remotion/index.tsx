import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { CaptionedVideo, CaptionedVideoProps } from './compositions/CaptionedVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<CaptionedVideoProps>
        id="CaptionedVideo"
        component={CaptionedVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: "",
          captions: [],
          style: "bottom-centered",
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
