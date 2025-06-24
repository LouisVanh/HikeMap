'use client';
import Link from 'next/link';
import ParticlesWrapper from '../components/particles_wrapper';
import { AuthButton } from '../components/auth_button';

export default function HomePage() {
  return (
    <>
      <ParticlesWrapper />

      {/* 🔘 Top-right Auth Button */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 10, // above particles
        }}
      >
        <AuthButton />
      </div>

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
