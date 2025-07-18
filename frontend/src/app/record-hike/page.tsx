'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    saveLocation,
    savePhoto,
    clearHikeData,
    getAllLocations,
    getAllPhotos,
} from '@/utils/hike_db';

export default function RecordingHikePage() {
    const [isRecording, setIsRecording] = useState(false);
    const [locationCount, setLocationCount] = useState(0);
    const [photoCount, setPhotoCount] = useState(0);
    const watchIdRef = useRef<number | null>(null);
    const router = useRouter();

    // Load counts on first render
    useEffect(() => {
        const load = async () => {
            const locs = await getAllLocations();
            const photos = await getAllPhotos();
            setLocationCount(locs.length);
            setPhotoCount(photos.length);
        };
        load();
    }, []);

    const startTracking = async () => {
        setIsRecording(true);
        await clearHikeData(); // Clear anything from previous run

        if (!navigator.geolocation) {
            alert('Geolocation not supported.');
            return;
        }

        const id = navigator.geolocation.watchPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                await saveLocation(latitude, longitude);
                setLocationCount((prev) => prev + 1);
            },
            (err) => {
                alert('Error retrieving location: ' + err.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000,
            }
        );

        watchIdRef.current = id;
    };

    const stopTracking = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
        router.push('/upload-hike');
    };

    const cancelRecording = async () => {
        const confirmCancel = confirm('Cancel hike and discard all data?');
        if (!confirmCancel) return;

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }

        await clearHikeData();
        setIsRecording(false);
        router.push('/map');
    };

    const handlePhotoCapture = async (type: 'regular' | 'food') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    await savePhoto(file, latitude, longitude, type);
                    setPhotoCount((prev) => prev + 1);
                },
                async (err) => {
                    console.warn("[Record-Hike] getCurrentPosition error:", err.message);
                    alert("Couldn't get your current location. Using last known location instead.");

                    const locations = await getAllLocations();
                    if (locations.length > 0) {
                        const last = locations[locations.length - 1];
                        await savePhoto(file, last.lat, last.lng, type);
                        setPhotoCount((prev) => prev + 1);
                    } else {
                        alert("No location available to attach to photo.");
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 15000,
                    timeout: 30000,
                }
            );

        };
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Recording Hike</h1>

            {!isRecording ? (
                <button
                    onClick={startTracking}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Start recording
                </button>
            ) : (
                <>
                    <div className="flex flex-col gap-4 w-full max-w-md">
                        <button
                            onClick={stopTracking}
                            className="bg-red-600 text-white py-3 rounded-md shadow hover:bg-red-700"
                        >
                            🟥 Stop recording
                        </button>
                        <button
                            onClick={() => handlePhotoCapture('regular')}
                            className="bg-green-600 text-white py-3 rounded-md shadow hover:bg-green-700"
                        >
                            📷 Take picture
                        </button>
                        <button
                            onClick={() => handlePhotoCapture('food')}
                            className="bg-yellow-500 text-white py-3 rounded-md shadow hover:bg-yellow-600"
                        >
                            🍔 Mark food stop
                        </button>
                        <button
                            onClick={cancelRecording}
                            className="bg-gray-500 text-white py-3 rounded-md shadow hover:bg-gray-600"
                        >
                            ❌ Cancel hike
                        </button>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                        {locationCount} location point{locationCount === 1 ? '' : 's'} tracked, {photoCount} photo{photoCount === 1 ? '' : 's'} taken
                    </div>
                </>
            )}
        </div>
    );
}
