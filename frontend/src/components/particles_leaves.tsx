'use client';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

export default function ParticlesBackgroundLeaves() {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -3 }}>
            <Particles
                id="leaves"
                init={particlesInit}
                options={{
                    fullScreen: { enable: false },
                    particles: {
                        number: { value: 30 },
                        shape: {
                            type: 'image',
                            image: {
                                src: 'https://cdn-icons-png.flaticon.com/128/892/892917.png',
                                width: 20,
                                height: 20,
                            },
                        },
                        opacity: { value: { min: 0.5, max: .9 } },
                        size: { value: { min: 5, max: 20 } },
                        move: {
                            enable: true,
                            speed: 0.2,
                            direction: 'bottomRight',
                            outModes: { default: 'out' },
                        },
                        rotate: {
                            value: { min: 0, max: 360 },
                            direction: 'random',
                            animation: {
                                enable: true,
                                speed: 1,
                                sync: false,
                            },
                        },
                    },
                }}
                style={{
                    width: '100vh',
                    minHeight: '100vh'
                }}
            />
        </div>
    );
}
