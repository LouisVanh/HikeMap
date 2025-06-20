'use client';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

export default function ParticlesBackgroundFireflies() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2 }}>
      <Particles
        id="fireflies"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          particles: {
            number: { value: 30 },
            color: { value: "#ffffaa" },
            shape: { type: "circle" },
            opacity: { value: 0.8 },
            size: { value: { min: 1, max: 3 } },
            move: {
              enable: true,
              speed: 0.6,
              direction: "none",
              outModes: { default: "bounce" }
            }
          },
        }}
        style={{
          minWidth: '100vh',
          minHeight: '100vh'
        }}
      />
    </div>
  );
}
