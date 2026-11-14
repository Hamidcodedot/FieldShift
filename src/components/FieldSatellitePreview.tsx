import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Satellite, MapPin, ZoomIn, ArrowRight, Lock } from 'lucide-react';
import { FarmerFieldProfile } from '../types';

// Safe maximum zoom for Esri World Imagery. Zoom 18 provides crisp sub-meter resolution globally.
// Zoom 19 triggers 'Map data not yet available' placeholder tiles in rural/agricultural regions.
const SAFE_MAX_SATELLITE_ZOOM = 18;

interface FieldSatellitePreviewProps {
  activeField: FarmerFieldProfile;
  onNavigateToField: () => void;
  className?: string;
}

export const FieldSatellitePreview: React.FC<FieldSatellitePreviewProps> = ({
  activeField,
  onNavigateToField,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const [isMaxZoomLocked, setIsMaxZoomLocked] = useState<boolean>(true);

  const { latitude, longitude, fieldBoundary, farmName, placeName, fieldSizeAcres } = activeField;
  const hasBoundary = Boolean(fieldBoundary && fieldBoundary.length >= 3);

  // Helper to zoom and fit field parcel safely locked to max available resolution
  const fitMap = (map: L.Map, animate = true) => {
    if (fieldBoundary && fieldBoundary.length >= 3) {
      const poly = L.polygon(fieldBoundary);
      const bounds = poly.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: SAFE_MAX_SATELLITE_ZOOM,
          animate,
          duration: animate ? 1.0 : 0,
        });
        return;
      }
    }
    if (latitude !== 0 && longitude !== 0) {
      if (animate) {
        map.flyTo([latitude, longitude], SAFE_MAX_SATELLITE_ZOOM, { duration: 1.0 });
      } else {
        map.setView([latitude, longitude], SAFE_MAX_SATELLITE_ZOOM);
      }
    }
  };

  // 1-Tap max enlarge handler (locks to safe sub-meter resolution)
  const handleMaxEnlarge = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mapInstanceRef.current) return;
    fitMap(mapInstanceRef.current, true);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialZoom = latitude !== 0 && longitude !== 0 ? SAFE_MAX_SATELLITE_ZOOM : 14;
    const map = L.map(mapContainerRef.current, {
      center: [latitude || 30.1904, longitude || 71.4793],
      zoom: initialZoom,
      minZoom: 3,
      maxZoom: SAFE_MAX_SATELLITE_ZOOM, // Rigid lock: Leaflet disables '+' and disallows zooming past safe limit
      zoomControl: true,
      attributionControl: false,
    });

    // Sub-meter Esri World Imagery (locked to maxNativeZoom 18 so Leaflet never requests zoom 19 from server)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: SAFE_MAX_SATELLITE_ZOOM,
        maxNativeZoom: SAFE_MAX_SATELLITE_ZOOM,
      }
    ).addTo(map);

    // Track zoom level to reflect maximize lock status
    const updateZoomStatus = () => {
      setIsMaxZoomLocked(map.getZoom() >= SAFE_MAX_SATELLITE_ZOOM);
    };

    map.on('zoomend', updateZoomStatus);
    updateZoomStatus();

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
      fitMap(map, false);
      updateZoomStatus();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.off('zoomend', updateZoomStatus);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync coordinates, marker, and polygon when activeField updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Custom Farm Center Pin (Zero-emoji SVG)
    const customIcon = L.divIcon({
      className: 'custom-home-farm-marker',
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background-color: #059669;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    // Update or add marker
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    }

    // Update or add boundary polygon with no fill (field remains 100% visible)
    if (fieldBoundary && fieldBoundary.length >= 3) {
      if (polygonRef.current) {
        polygonRef.current.setLatLngs(fieldBoundary);
        polygonRef.current.setStyle({
          color: '#10b981',
          weight: 2,
          opacity: 1,
          fill: false,
          fillOpacity: 0,
        });
      } else {
        polygonRef.current = L.polygon(fieldBoundary, {
          color: '#10b981',
          weight: 2,
          opacity: 1,
          fill: false,
          fillOpacity: 0,
        }).addTo(map);
      }
    } else if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    // Auto-fit to active field boundary or pin
    fitMap(map, true);
  }, [activeField.id, latitude, longitude, fieldBoundary]);

  return (
    <div className={`card-chai overflow-hidden p-4 sm:p-5 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-200/70 pb-3 mb-3 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h2 className="font-montserrat text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
              Selected field satellite view
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            {farmName} • {placeName || 'Farm parcel'} ({fieldSizeAcres || 5} acres)
          </p>
        </div>

        {/* Action Button: Edit or re-draw in My Field */}
        <button
          type="button"
          onClick={onNavigateToField}
          className="btn-asym-mirror inline-flex min-h-[34px] items-center gap-1.5 border border-stone-300 bg-white/90 px-3 py-1 font-montserrat text-[11px] font-semibold text-stone-800 transition hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 self-start sm:self-auto shadow-xs"
          title="Open interactive field editor with drawing tools in My Field tab"
        >
          <span>Edit in My Field</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Map Canvas Container */}
      <div className="relative isolate z-0 h-64 sm:h-80 w-full overflow-hidden rounded-xl border border-stone-200/80 dark:border-stone-800">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Floating Quick Action: Max Enlarge & Maximize Lock */}
        <button
          type="button"
          onClick={handleMaxEnlarge}
          className={`absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-montserrat text-[11px] font-semibold shadow-md backdrop-blur-md transition active:scale-95 ${
            isMaxZoomLocked
              ? 'border-emerald-500/40 bg-emerald-50/95 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-600/40 dark:bg-emerald-950/90 dark:text-emerald-200'
              : 'border-stone-200/90 bg-white/95 text-stone-900 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900/95 dark:text-stone-100 dark:hover:bg-stone-800'
          }`}
          title={
            isMaxZoomLocked
              ? 'Max resolution reached (18x sub-meter). Further zoom is locked to prevent missing map tiles.'
              : 'Max enlarge: zooms map directly into field parcel at sub-meter resolution (Zoom 18)'
          }
        >
          {isMaxZoomLocked ? (
            <>
              <Lock className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Max zoom locked</span>
            </>
          ) : (
            <>
              <ZoomIn className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Max enlarge</span>
            </>
          )}
        </button>

        {/* Floating Coordinates & Boundary Status Tag */}
        <div className="absolute bottom-2.5 left-2.5 z-10 flex max-w-[calc(100%-1.25rem)] items-center gap-1.5 sm:gap-2 rounded-lg border border-stone-200/80 bg-white/95 px-2.5 py-1.5 font-montserrat text-[10px] sm:text-[11px] font-medium text-stone-800 shadow-sm backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90 dark:text-stone-200 pointer-events-none truncate">
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-mono text-[9px] sm:text-[10px] truncate">
            {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
          </span>
          <span className="text-stone-300 dark:text-stone-700 shrink-0">•</span>
          <span className="truncate">
            {hasBoundary
              ? `Boundary active (${fieldSizeAcres || 5} ac)`
              : 'Center pin active'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FieldSatellitePreview;
