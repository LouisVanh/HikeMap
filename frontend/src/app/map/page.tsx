'use client';
import dynamic from 'next/dynamic';

// Dynamically import the MapClient component with SSR disabled
const Map = dynamic(() => import('./map_client'), {
  ssr: false,
});

export default function MapPage() {
  return <Map />;
}
