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

/**
 * Returns the appropriate Tile Layer configuration based on active layer type and API key availability.
 */
export function getTileLayerConfig(layer: MapLayerType, apiKey: string) {
  switch (layer) {
    case 'satellite':
      if (apiKey && apiKey.length > 5) {
        return {
          url: `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${apiKey}`,
          attribution: '&copy; Google Maps Satellite &copy; NASA Earth Data',
          maxZoom: 20,
          subdomains: [] as string[],
        };
      }
      // High-resolution satellite fallback (Esri World Imagery)
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &copy; Earthstar Geographics &copy; NASA',
        maxZoom: 19,
        subdomains: [] as string[],
      };

    case 'terrain':
      if (apiKey && apiKey.length > 5) {
        return {
          url: `https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${apiKey}`,
          attribution: '&copy; Google Maps Terrain',
          maxZoom: 20,
          subdomains: [] as string[],
        };
      }
      return {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors, SRTM',
        maxZoom: 17,
        subdomains: ['a', 'b', 'c'],
      };

    case 'clean':
    default:
      return {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c', 'd'],
      };
  }
}
