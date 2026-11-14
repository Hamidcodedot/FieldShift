export type MapLayerType = 'clean' | 'satellite' | 'terrain';

const STORAGE_KEY = 'fieldshift_google_maps_key';

/**
 * Retrieves the active Google Maps API key from environment variables or localStorage.
 */
export function getGoogleMapsApiKey(): string {
  // Check Vite environment variable first
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || (import.meta as any).env?.VITE_MAP_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0) {
    return envKey.trim();
  }

  // Fallback to locally stored key configured by the user
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    return local ? local.trim() : '';
  } catch {
    return '';
  }
}

/**
 * Stores the user's custom Google Maps API key into localStorage.
 */
export function setGoogleMapsApiKey(key: string): void {
  try {
    if (!key || key.trim() === '') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  } catch (err) {
    console.warn('Failed to save Google Maps API key in localStorage', err);
  }
}

export interface TileLayerConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  maxNativeZoom: number;
  subdomains: string[];
}

/**
 * Returns the appropriate Tile Layer configuration based on active layer type and API key availability.
 * All default layers are 100% free, zero-config, with NO API key requirement and NO watermarks.
 * Note: Esri World Imagery is locked to maxZoom 18 / maxNativeZoom 18 to avoid 'Map data not yet available' missing tiles.
 */
export function getTileLayerConfig(layer: MapLayerType, apiKey?: string): TileLayerConfig {
  switch (layer) {
    case 'satellite':
      if (apiKey && apiKey.length > 5) {
        return {
          url: `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${apiKey}`,
          attribution: '&copy; Google Maps Satellite &copy; NASA Earth Data',
          maxZoom: 20,
          maxNativeZoom: 20,
          subdomains: [] as string[],
        };
      }
      // High-resolution satellite imagery (Esri World Imagery - 100% Free, Public, Sub-Meter Resolution)
      // Native tiles up to zoom 18, digitally scaled up to zoom 20 for maximum farm detail
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &copy; Maxar, Earthstar Geographics, CNES/Airbus DS, USDA FSA, USGS, Aerogrid, IGN, IGP',
        maxZoom: 20,
        maxNativeZoom: 18,
        subdomains: [] as string[],
      };

    case 'terrain':
      if (apiKey && apiKey.length > 5) {
        return {
          url: `https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${apiKey}`,
          attribution: '&copy; Google Maps Terrain',
          maxZoom: 20,
          maxNativeZoom: 20,
          subdomains: [] as string[],
        };
      }
      return {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors, SRTM',
        maxZoom: 20,
        maxNativeZoom: 17,
        subdomains: ['a', 'b', 'c'],
      };

    case 'clean':
    default:
      // Standard OpenStreetMap (100% Free, Public, Zero API Key, No Watermark)
      return {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 20,
        maxNativeZoom: 19,
        subdomains: [] as string[],
      };
  }
}

/**
 * Calculates the geodesic surface area of a polygon defined by [lat, lon] vertices.
 * Uses equirectangular projection centered at parcel latitude and the Shoelace formula.
 * Returns both acres and hectares.
 */
export function calculatePolygonAreaAcres(points: [number, number][]): { acres: number; hectares: number } {
  if (!points || points.length < 3) return { acres: 0, hectares: 0 };
  const R = 6378137; // Earth mean radius in meters
  const lat0 = points[0][0];
  const rad = Math.PI / 180;
  const cosLat0 = Math.cos(lat0 * rad);

  // Project spherical coords to planar meters relative to first point
  const xy = points.map(([lat, lon]) => [
    (lon - points[0][1]) * rad * R * cosLat0,
    (lat - points[0][0]) * rad * R,
  ]);

  // Shoelace formula
  let areaM2 = 0;
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length;
    areaM2 += xy[i][0] * xy[j][1] - xy[j][0] * xy[i][1];
  }
  areaM2 = Math.abs(areaM2) / 2;

  const hectares = areaM2 / 10000;
  const acres = areaM2 / 4046.8564224;

  return {
    acres: Number(acres.toFixed(2)),
    hectares: Number(hectares.toFixed(2)),
  };
}

/**
 * Calculates the arithmetic centroid [lat, lon] of a set of polygon vertices.
 */
export function calculatePolygonCentroid(points: [number, number][]): [number, number] {
  if (!points || points.length === 0) return [0, 0];
  const sumLat = points.reduce((acc, p) => acc + p[0], 0);
  const sumLon = points.reduce((acc, p) => acc + p[1], 0);
  return [sumLat / points.length, sumLon / points.length];
}
