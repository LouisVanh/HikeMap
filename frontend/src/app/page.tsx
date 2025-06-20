'use client';
import Link from 'next/link';
import ParticlesWrapper from '../components/particles_wrapper';

export default function HomePage() {
  return (
    <>
    <ParticlesWrapper />
    <main
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        padding: '2rem',
        position: 'relative', // so your button content layers above the particles
        zIndex: 1,
      }}
    >
      <h1>Welcome to HikeMap</h1>
      <Link href="/map">
        <button>
          <img
            src="https://cdn-icons-png.flaticon.com/128/892/892917.png"
            alt="Leaf"
            style={{ width: '16px', height: '16px', marginRight: '0.5rem' }}
          />
          Go to Map
        </button>
      </Link>
    </main>
</>
  );
}
