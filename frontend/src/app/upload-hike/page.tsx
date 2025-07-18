'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllLocations, getAllPhotos, clearHikeData } from '@/utils/hike_db';
import { createClient } from '@/utils/supabase/client';
import { toPostGISPoint, toPostGISLineString } from '@/utils/geo_helpers';


interface PhotoWithMeta {
  image: File;
  lat: number;
  lng: number;
  type: 'regular' | 'food';
  timestamp: number;
}

export default function UploadHikePage() {
  const [locations, setLocations] = useState<{ lat: number; lng: number }[]>([]);
  const [photos, setPhotos] = useState<PhotoWithMeta[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hikeName, setHikeName] = useState('');
  const router = useRouter();

   useEffect(() => {
    // Enable scroll on mount
    document.body.style.overflow = 'auto';

    // Clean up on unmount
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);
  
  useEffect(() => {
    const loadData = async () => {
      const locs = await getAllLocations();
      const imgs = await getAllPhotos();
      setLocations(locs);
      setPhotos(imgs);
    };
    loadData();
  }, []);

  const handleCancel = async () => {
    if (confirm('Are you sure you want to discard this hike?')) {
      await clearHikeData();
      router.push('/map');
    }
  };

  const handleConfirm = async () => {
    if (!hikeName.trim()) return alert('Please enter a name for your hike.');
    if (locations.length < 2) return alert('You need at least 2 location points to save a hike.');

    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('User not signed in.');

    try {
      const route_geometry = toPostGISLineString(locations);
      const start_location = toPostGISPoint(locations[0].lng, locations[0].lat);

      const { data: hike, error: hikeError } = await supabase
        .from('Hikes')
        .insert({
          user_id: user.id,
          hike_name: hikeName.trim(),
          route_geometry,
          start_location,
        })
        .select()
        .single();

      if (hikeError || !hike) throw hikeError;

      for (const [i, photo] of photos.entries()) {
        console.log(`Uploading photo ${i}`);

        const form = new FormData();
        form.append('file', photo.image);

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          console.error('Missing session token.');
          continue;
        }

        // Upload full-size (hike-large)
        const resLarge = await fetch(`/api/upload?type=hike-large`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: form,
        });

        if (!resLarge.ok) {
          console.error(`Large upload failed for photo ${i}`, await resLarge.text());
          continue;
        }

        const { url: urlLarge } = await resLarge.json();

        // Upload small preview (hike-small)
        const resSmall = await fetch(`/api/upload?type=hike-small`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: form,
        });

        if (!resSmall.ok) {
          console.error(`Small upload failed for photo ${i}`, await resSmall.text());
          continue;
        }

        const { url: urlSmall } = await resSmall.json();

        // Insert into Pictures table
        const { error: insertError } = await supabase.from('Pictures').insert({
          hike_id: hike.hike_id,
          user_id: user.id,
          pic_url: urlLarge,
          pic_url_preview: urlSmall,
          location: toPostGISPoint(photo.lng, photo.lat),
        });

        if (insertError) {
          console.error(`Failed to insert photo ${i}:`, insertError);
        }
      }

      await clearHikeData();
      router.push('/map');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload hike.');
    } finally {
      setUploading(false);
    }
  };

  // prevent memory leaks, I think
  useEffect(() => {
    return () => {
      // Cleanup object URLs on unmount
      photos.forEach(photo => {
        URL.revokeObjectURL(URL.createObjectURL(photo.image));
      });
    };
  }, [photos]);

  return (
    <div className="p-6 max-w-xl mx-auto h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Finalize Your Hike</h1>
      <p className="text-gray-600 mb-4">
        This hike will be <strong>public</strong> and visible to others on the map.
      </p>

      <input
        type="text"
        placeholder="Hike name (e.g. Sunset Ridge Trail)"
        value={hikeName}
        onChange={(e) => setHikeName(e.target.value)}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Route: {locations.length} points</h2>
        <p className="text-sm text-gray-500">This will be saved as a PostGIS LINESTRING.</p>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Photos:</h2>
        {photos.length === 0 ? (
          <p className="text-gray-500">No photos taken.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, i) => (
              <div key={i} className="text-sm">
                <img
                  src={URL.createObjectURL(photo.image)}
                  alt={`photo-${i}`}
                  className="rounded shadow w-full"
                />
                <div className="mt-1 text-gray-500">
                  📍 {photo.lat.toFixed(5)}, {photo.lng.toFixed(5)} <br />
                  {photo.type === 'food' ? '🍔 Food stop' : '📷 Picture'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleConfirm}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {uploading ? 'Uploading...' : '✅ Confirm'}
        </button>
        <button
          onClick={handleCancel}
          disabled={uploading}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}
