import { AgroRegion } from '../types';

export interface LocationResult {
  latitude: number;
  longitude: number;
  accuracy?: number;
  error?: string;
}

/**
 * Obtain the device's current GPS coordinates using the standard Geolocation API.
 * In Android Capacitor WebViews, this maps directly to Android's LocationManager with
 * ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION permissions without requiring heavy
 * background compiler daemons.
 */
export async function getCurrentFarmLocation(): Promise<LocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      latitude: 0,
      longitude: 0,
      error: 'Geolocation is not supported by this device or browser.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        let msg = 'Unable to retrieve GPS location.';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Location permission denied. Please allow GPS access in settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'GPS fix unavailable. Please ensure location services are enabled.';
            break;
          case err.TIMEOUT:
            msg = 'GPS location request timed out. Please try again.';
            break;
        }
        resolve({
          latitude: 0,
          longitude: 0,
          error: msg,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

/**
 * Calculates the great-circle distance between two points in kilometers (Haversine formula).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest predefined AgroRegion based on GPS coordinates.
 */
export function findNearestAgroRegion(
  lat: number,
  lon: number,
  regions: AgroRegion[]
): AgroRegion | null {
  if (!regions || regions.length === 0) return null;

  let minDistance = Infinity;
  let closestRegion: AgroRegion = regions[0];

  for (const region of regions) {
    const dist = calculateDistanceKm(
      lat,
      lon,
      region.latitude,
      region.longitude
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestRegion = region;
    }
  }

  return closestRegion;
}
