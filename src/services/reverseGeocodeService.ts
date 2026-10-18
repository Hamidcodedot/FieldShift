import { AgroRegion } from '../types';
import { findNearestAgroRegion } from './geolocationService';

const locationCache = new Map<string, string>();

/**
 * Reverse geocodes coordinates to a human-readable location name.
 * Uses client-side caching, local agro-region heuristics for instant offline display,
 * and background OpenStreetMap Nominatim for precise town/district naming when online.
 */
export async function getHumanReadableLocation(
  lat: number,
  lon: number,
  regions: AgroRegion[]
): Promise<string> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey)!;
  }

  // 1. Instant fallback based on nearest agricultural region
  const nearest = findNearestAgroRegion(lat, lon, regions);
  const fallbackName = nearest
    ? `${nearest.name.split(' (')[0]}, ${nearest.country}`
    : `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;

  // 2. Try online reverse geocoding asynchronously
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'FieldShift-AgroApp/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      if (addr) {
        const place =
          addr.county ||
          addr.district ||
          addr.city ||
          addr.town ||
          addr.village ||
          addr.state_district ||
          addr.state;
        const regionOrCountry = addr.state || addr.country;

        let formatted = '';
        if (place && regionOrCountry && place !== regionOrCountry) {
          formatted = `${place}, ${regionOrCountry}`;
        } else if (place || regionOrCountry) {
          formatted = `${place || regionOrCountry}`;
        }

        if (formatted) {
          locationCache.set(cacheKey, formatted);
          return formatted;
        }
      }
    }
  } catch {
    // Network unavailable or timed out; use fallback
  }

  locationCache.set(cacheKey, fallbackName);
  return fallbackName;
}
