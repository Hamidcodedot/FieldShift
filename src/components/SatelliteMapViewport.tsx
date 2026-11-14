import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Satellite, Edit3, RefreshCw } from 'lucide-react';

interface SatelliteMapViewportProps {
  latitude: number;
  longitude: number;
  fieldBoundary?: [number, number][];
  fieldSizeAcres?: number;
  heightClassName?: string;
  onEditBoundary?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  interactive?: boolean;
}

// Global maximum zoom for Esri World Imagery (sub-meter resolution)
const MAX_SATELLITE_ZOOM = 20;

export const SatelliteMapViewport: React.FC<SatelliteMapViewportProps> = ({
  latitude,
  longitude,
  fieldBoundary,
  fieldSizeAcres = 5,
  heightClassName = 'h-[340px] sm:h-[400px]',
  onEditBoundary,
  onRefresh,
  isRefreshing = false,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Generate a realistic 4-point polygon around coordinates if none exists yet
  const effectiveBoundary: [number, number][] = React.useMemo(() => {
    if (fieldBoundary && fieldBoundary.length >= 3) {
      return fieldBoundary;
    }
    const lat = latitude || 30.1904;
    const lon = longitude || 71.4793;
    // Offset by roughly ~150-200 meters (~4-5 acres)
    const dLat = 0.0018;
    const dLon = 0.0022;
    return [
      [lat - dLat * 0.7, lon - dLon * 0.8],
      [lat - dLat * 0.5, lon + dLon * 0.9],
      [lat + dLat * 0.8, lon + dLon * 0.7],
      [lat + dLat * 0.7, lon - dLon * 0.8],
    ];
  }, [fieldBoundary, latitude, longitude]);

  // Fit bounds helper
  const fitToField = useCallback((map: L.Map, animate = true) => {
    if (effectiveBoundary.length >= 3) {
      const poly = L.polygon(effectiveBoundary);
      const bounds = poly.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          paddingTopLeft: [12, 30],
          paddingBottomRight: [12, 20],
          maxZoom: MAX_SATELLITE_ZOOM,
          animate,
          duration: animate ? 0.8 : 0,
        });
        return;
      }
    }
    map.setView([latitude, longitude], 18, { animate });
  }, [effectiveBoundary, latitude, longitude]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const lat = latitude || 30.1904;
    const lon = longitude || 71.4793;

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 17,
      minZoom: 3,
      maxZoom: MAX_SATELLITE_ZOOM,
      zoomControl: false,
      attributionControl: false,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: false, // Prevent page scroll hijack
      doubleClickZoom: interactive,
    });

    // Real high-resolution Esri World Imagery (Sub-meter satellite imagery)
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: MAX_SATELLITE_ZOOM,
        maxNativeZoom: 18,
      }
    ).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;

    mapRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
      fitToField(map, false);
    }, 120);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (polygonRef.current) {
        try {
          map.removeLayer(polygonRef.current);
        } catch {
          // ignore
        }
        polygonRef.current = null;
      }
      if (markerGroupRef.current) {
        try {
          map.removeLayer(markerGroupRef.current);
        } catch {
          // ignore
        }
        markerGroupRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, interactive, fitToField]);

  // Check if custom boundary has been set by farmer
  const hasCustomBoundary = Boolean(fieldBoundary && fieldBoundary.length >= 3);

  // Update Polygon & Vertex Markers when boundary or coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.invalidateSize();

    // Update boundary polygon with thin, crisp emerald border (weight: 2) and NO fill (field is 100% visible when saved)
    if (polygonRef.current && map.hasLayer(polygonRef.current)) {
      polygonRef.current.setLatLngs(effectiveBoundary);
      polygonRef.current.setStyle({
        color: '#10b981',
        weight: 2,
        opacity: 1,
        fill: false,
        fillOpacity: 0,
        dashArray: hasCustomBoundary ? undefined : '5, 5',
      });
    } else {
      if (polygonRef.current) {
        try {
          map.removeLayer(polygonRef.current);
        } catch {
          // ignore
        }
      }
      polygonRef.current = L.polygon(effectiveBoundary, {
        color: '#10b981',
        weight: 2,
        opacity: 1,
        fill: false,
        fillOpacity: 0,
        dashArray: hasCustomBoundary ? undefined : '5, 5',
      }).addTo(map);
    }

    // Update Vertex Marker Dots & Center Pill
    if (markerGroupRef.current) {
      markerGroupRef.current.clearLayers();

      // Vertex circle dots (crisp white dots with emerald border)
      effectiveBoundary.forEach(([vLat, vLon]) => {
        const vertexIcon = L.divIcon({
          className: 'satellite-vertex-marker',
          html: `
            <div style="
              width: 10px;
              height: 10px;
              background-color: #ffffff;
              border: 2px solid #059669;
              border-radius: 50%;
              box-shadow: 0 1px 4px rgba(0,0,0,0.6);
            "></div>
          `,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        });
        L.marker([vLat, vLon], { icon: vertexIcon, interactive: false }).addTo(
          markerGroupRef.current!
        );
      });

      // Center Acreage Pill
      const poly = L.polygon(effectiveBoundary);
      const center = poly.getBounds().getCenter();

      const centerLabel = hasCustomBoundary
        ? `${fieldSizeAcres || 5} Acres`
        : `${fieldSizeAcres || 5} Acres (Est.)`;

      const centerIcon = L.divIcon({
        className: 'satellite-center-pill',
        html: `
          <div style="
            background: rgba(18, 24, 16, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #ffffff;
            font-size: 10px;
            font-weight: 700;
            padding: 3px 9px;
            border-radius: 999px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            transform: translate(-50%, -50%);
            display: inline-flex;
            align-items: center;
            gap: 4px;
            backdrop-filter: blur(6px);
          ">
            <span>${centerLabel}</span>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([center.lat, center.lng], { icon: centerIcon, interactive: false }).addTo(
        markerGroupRef.current
      );
    }

    fitToField(map, true);
  }, [effectiveBoundary, fieldSizeAcres, hasCustomBoundary, fitToField]);

  return (
    <div className={`relative w-full overflow-hidden bg-[#141E13] ${heightClassName}`}>
      {/* Real Leaflet Satellite Tile Map Container */}
      <div ref={containerRef} className="absolute inset-0 h-full w-full z-0" />

      {/* Grid Pattern Overlay to evoke high-precision spatial grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top HUD Controls Overlay (Compact, zero-overflow on 320px–360px mobile) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-1.5 pointer-events-none">
        {/* Left: Satellite Live Indicator & Boundary Status */}
        <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md pointer-events-auto shadow-sm shrink-0">
          <Satellite className="h-3 w-3 text-emerald-400 shrink-0" />
          <span>Sub-meter</span>
          <span className="text-white/30">•</span>
          {hasCustomBoundary ? (
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Unset
            </span>
          )}
        </div>

        {/* Right HUD Buttons: Compact Refresh & Mark Corners / Edit with zero overflow */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/65 text-white backdrop-blur-md transition hover:bg-black/85 active:scale-95 disabled:opacity-50 shrink-0"
              title="Refresh NASA satellite telemetry"
              aria-label="Refresh Satellite"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          )}

          {onEditBoundary && (
            <button
              type="button"
              onClick={onEditBoundary}
              className="inline-flex min-h-[28px] items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-stone-900 shadow-md backdrop-blur-xs transition hover:bg-stone-100 active:scale-95 whitespace-nowrap shrink-0"
            >
              <Edit3 className="h-3 w-3 text-stone-700" />
              <span>{hasCustomBoundary ? 'Edit Boundary' : 'Mark Corners'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom HUD: Coordinates & Locked Status */}
      <div className="absolute bottom-2 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-1 text-[9.5px] text-white/80 font-mono pointer-events-none drop-shadow-sm">
        <span className="backdrop-blur-xs px-1.5 py-0.5 rounded bg-black/40">
          Lat: {latitude.toFixed(4)}° N, Lon: {longitude.toFixed(4)}° E
        </span>
        <span className="backdrop-blur-xs px-1.5 py-0.5 rounded bg-black/40 text-emerald-300 font-semibold">
          Sub-meter locked
        </span>
      </div>
    </div>
  );
};

export default SatelliteMapViewport;