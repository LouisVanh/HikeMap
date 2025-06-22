import { useEffect, useState } from 'react';
import { LatLngExpression } from 'leaflet';

/**
 * Custom React hook to get the user's geolocation (if allowed).
 * Returns: [lat, lng] | null
 */
export function useUserLocation(): LatLngExpression | null {
  const [position, setPosition] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error('Geolocation error:', err);
        }
      );
    }
  }, []);

  return position;
}
