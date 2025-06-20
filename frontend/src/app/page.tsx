'use client';
import Link from 'next/link';
// import Image from "next/image";

// Home can be named anything, this just makes sense
export default function Home() {
  return (
    <main
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        padding: '2rem'
      }}
    >
      <h1>Welcome to HikeMap</h1>

      <Link href="/map">
        <button>
          Go to Map
        </button>
      </Link>
    </main>
  );
}
