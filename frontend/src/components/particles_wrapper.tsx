// components/particles_wrapper.tsx
'use client';
import ParticlesFireflies from './particles_fireflies';
import ParticlesLeaves from './particles_leaves';

export default function ParticlesWrapper() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
                overflow: 'hidden',
            }}
        >
            <ParticlesLeaves />
            <ParticlesFireflies />
        </div>

    );
}
