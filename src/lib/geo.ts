import type { LatLng } from '../data/types';

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres (haversine). */
export function distanceKm([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Centre point of a set of coordinates, used to centre the map on the stores shown. */
export function centroid(points: LatLng[]): LatLng {
  if (points.length === 0) throw new Error('centroid needs at least one point');
  const sum = points.reduce(([a, b], [lat, lng]) => [a + lat, b + lng], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
