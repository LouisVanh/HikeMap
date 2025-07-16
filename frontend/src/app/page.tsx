'use client';
import Link from 'next/link';
import ParticlesWrapper from '../components/particles_wrapper';
import { AuthButton } from '../components/auth_button';
import Image from 'next/image';
import { LEAF_PIC_URL } from '@/utils/constants';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function HomePage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session?.user);
    };
    checkSession();
  }, []);

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
          <button className="button-lg">
            <Image
              src={LEAF_PIC_URL}
              alt="Leaf"
              width={128}
              height={128}
              style={{ width: '1.25rem', height: '1.25rem', marginRight: '.75rem', alignSelf: 'center' }}
            />
            <strong>Go to Map</strong>
          </button>
        </Link>

        {/* 🔘 Top-left Complete Profile Button (if signed in) */}
        {isSignedIn && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              zIndex: 10,
            }}
          >
            <Link href="/complete-profile">
              <button className="button-sm">
                <strong>Profile</strong>
              </button>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
