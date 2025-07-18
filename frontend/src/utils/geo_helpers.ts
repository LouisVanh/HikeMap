// Converts lat/lng to PostGIS POINT (with SRID=4326)
export function toPostGISPoint(lng: number, lat: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

// Converts an array of lat/lng pairs into PostGIS LINESTRING (SRID=4326)
export function toPostGISLineString(coords: { lat: number; lng: number }[]): string {
  if (coords.length === 0) throw new Error("No coordinates provided for LINESTRING");

  const pointStr = coords.map(({ lng, lat }) => `${lng} ${lat}`).join(', ');
  return `SRID=4326;LINESTRING(${pointStr})`;
}
