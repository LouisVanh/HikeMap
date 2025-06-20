'use client';

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        particles: {
          number: { value: 60 },
          color: { value: '#ffffff' },
          shape: { type: 'circle' },
          opacity: { value: 0.3 },
          size: { value: { min: 1, max: 4 } },
          move: { enable: true, speed: 1 },
          links: { enable: true, distance: 150, color: '#ffffff', opacity: 0.2 },
        },
        background: {
          color: '#0d47a1',
        },
      }}
    />
  );
}