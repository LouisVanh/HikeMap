import { MarkerIconPaths } from '@/lib/markerPaths';
import L from 'leaflet';

export const customRedMarkerIcon = new L.Icon({
  iconUrl: MarkerIconPaths.red,
  shadowUrl: MarkerIconPaths.shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const customBlueMarkerIcon = new L.Icon({
  iconUrl: MarkerIconPaths.blue,
  shadowUrl: MarkerIconPaths.shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const customGreenMarkerIcon = new L.Icon({
  iconUrl: MarkerIconPaths.green,
  shadowUrl: MarkerIconPaths.shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
