import React from 'react';
import { Composition } from 'remotion';
import { LaunchDemo } from './LaunchDemo';
import { OratorPortalDemo } from './OratorPortalDemo';
import { CoachPortalDemo } from './CoachPortalDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchDemo"
        component={LaunchDemo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="OratorPortalDemo"
        component={OratorPortalDemo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CoachPortalDemo"
        component={CoachPortalDemo}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
