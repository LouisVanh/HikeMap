'use client';
// For map
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
// For markers on the map
import { customRedMarkerIcon, customBlueMarkerIcon, customGreenMarkerIcon } from '@/utils/marker_icon';
// For getting player pos
import { useUserLocation } from '@/hooks/useUserLocation';
// For zooming
import { useMap } from 'react-leaflet';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { HOME_PIC_URL } from '@/utils/constants';
import RecordHikeButton from '@/components/record_hike_button';
import PictureThumbnailMarkers, { PictureWithData } from '@/components/picture_thumbnail_marker';
import { createClient } from '@/utils/supabase/client';




const position: LatLngExpression = [43.7154, -79.3896];
const positionTestHike: LatLngExpression = [43.7, -79.3896];
const positionTestRestaurant: LatLngExpression = [43.7154, -80];

function FlyToUserOnClick({
    shouldFly,
    position,
    onDone,
}: {
    shouldFly: boolean;
    position: LatLngExpression;
    onDone: () => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (shouldFly) {
            map.flyTo(position, 15);
            onDone(); // Reset trigger flag
        }
    }, [shouldFly, position, map, onDone]);

    return null;
}

// Need to abstract into a method or JSX throws a fit.
function FlyToUserWhenReady({ position }: { position: LatLngExpression }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(position, 15);
    },
        // Update whenever pos or map changes
        [position, map]);

    return null;
}

export default function MapClient() {
    const userPosition = useUserLocation();
    const [flyToUserRequested, setFlyToUserRequested] = useState(false);
    const [pictures, setPictures] = useState<PictureWithData[]>([]);

    useEffect(() => {
        const fetchPictures = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("Pictures")
                .select("pic_id, pic_url_preview, location")
                .not("location", "is", null)
                .not("pic_url_preview", "is", null);

            if (error) {
                console.error("Error fetching pictures", error);
            } else if (data) {
                setPictures(data);
            }
        };

        fetchPictures();
    }, []);

    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <MapContainer
                center={userPosition ? userPosition : position}
                zoom={10}
                scrollWheelZoom={true}
                attributionControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={positionTestHike} icon={customGreenMarkerIcon}>
                    <Popup>🌍 Hike over here!</Popup>
                </Marker>
                <Marker position={positionTestRestaurant} icon={customRedMarkerIcon}>
                    <Popup>🌍 Restaurant over here!</Popup>
                </Marker>

                {/* Thumbnail markers fetched from supabase */}
                {pictures.length > 0 && <PictureThumbnailMarkers pictures={pictures} />}


                {/* if user pos exists */}
                {userPosition && (
                    <>
                        <Marker position={userPosition} icon={customBlueMarkerIcon}>
                            <Popup>📍 You are here!</Popup>
                        </Marker>
                        <FlyToUserWhenReady position={userPosition} />
                    </>
                )}

                {/* If the user clicks the home button */}
                {userPosition && (
                    <FlyToUserOnClick
                        shouldFly={flyToUserRequested}
                        position={userPosition}
                        onDone={() => setFlyToUserRequested(false)}
                    />
                )}

                <div
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '10px',
                        zIndex: 1000, // Make sure it floats above the map
                    }}
                >
                    <button
                        style={{
                            width: '4rem',
                            height: '4rem',
                            backgroundColor: '#2563eb',
                            border: 'none',
                            borderRadius: '50%', // ← makes it perfectly round
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        }}
                        onClick={() => {
                            console.log("Clicked button home icon")
                            {/* For some reason, this won't work - apparently JSX cant be created like this, need a normal func */ }
                            {/*userPosition && <FlyToUserWhenReady position={userPosition} /> */ }
                            setFlyToUserRequested(true)
                        }}
                    >
                        <Image
                            src={HOME_PIC_URL}
                            alt="Home"
                            width={240}
                            height={240}
                            style={{ width: '3rem', height: '3rem' }}
                        />
                    </button>
                </div>
            </MapContainer>
            <RecordHikeButton />



            <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: 'rgba(255,255,255,0.25)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.6rem',
                zIndex: 1000  // make sure it's above the map
            }}>
                © <a href="https://www.openstreetmap.org/copyright" className="attribution-link" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
            </div>

        </div>
    );
}
