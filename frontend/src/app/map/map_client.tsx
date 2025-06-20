'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { customRedMarkerIcon, customBlueMarkerIcon, customGreenMarkerIcon } from '@/utils/marker_icon';

const position: LatLngExpression = [43.7154, -79.3896];
const positionTestHike: LatLngExpression = [43.7, -79.3896];
const positionTestRestaurant: LatLngExpression = [43.7154, -80];

export default function MapClient() {
    return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={true}
                attributionControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={customBlueMarkerIcon}>
                    <Popup>🌍 You are here!</Popup>
                </Marker>
                <Marker position={positionTestHike} icon={customGreenMarkerIcon}>
                    <Popup>🌍 Hike over here!</Popup>
                </Marker>
                <Marker position={positionTestRestaurant} icon={customRedMarkerIcon}>
                    <Popup>🌍 Restaurant over here!</Popup>
                </Marker>
            </MapContainer>

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
