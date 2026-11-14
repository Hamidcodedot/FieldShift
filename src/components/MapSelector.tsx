import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { AgroRegion } from '../types';
import { snapCoordinateToGrid } from '../services/nasaService';
import { getCurrentFarmLocation, findNearestAgroRegion } from '../services/geolocationService';
import { getHumanReadableLocation } from '../services/reverseGeocodeService';
import {
  getGoogleMapsApiKey,
  getTileLayerConfig,
  MapLayerType,
  calculatePolygonAreaAcres,
  calculatePolygonCentroid,
} from '../services/mapConfigService';
import {
  Navigation,
  Check,
  AlertCircle,
  X,
  Satellite,
  MapPin,
  Sparkles,
  Maximize2,
  ZoomIn,
  RotateCcw,
  Trash2,
  Lock,
  Map as MapIcon,
  Mountain,
} from 'lucide-react';

interface MapSelectorProps {
  currentRegion: AgroRegion;
  allRegions: AgroRegion[];
  onSelectCoordinates: (lat: number, lon: number) => void;
  onSelectRegion: (region: AgroRegion) => void;
  selectedLat: number;
  selectedLon: number;
  fieldBoundary?: [number, number][];
  onUpdateFieldBoundary?: (boundary: [number, number][], acres: number) => void;
  mapHeightClassName?: string;
  embedded?: boolean;
}

export const MapSelector: React.FC<MapSelectorProps> = ({
  currentRegion,
  allRegions,
  onSelectCoordinates,
  onSelectRegion,
  selectedLat,
  selectedLon,
  fieldBoundary,
  onUpdateFieldBoundary,
  mapHeightClassName,
  embedded = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const gridCircleRef = useRef<L.Circle | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const vertexMarkersRef = useRef<L.CircleMarker[]>([]);

  // Map layer state - default to high-resolution satellite imagery
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('satellite');
  const [apiKey] = useState<string>(() => getGoogleMapsApiKey());
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [placeName, setPlaceName] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Field Selection Mode: 'pin' (default center pin) or 'draw' (draw parcel polygon)
  const [interactMode, setInteractMode] = useState<'pin' | 'draw'>('pin');
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>(() => fieldBoundary || []);
  const [isMaxZoomLocked, setIsMaxZoomLocked] = useState<boolean>(true);

  // Refs to allow click handler to access latest state without map re-init
  const interactModeRef = useRef<'pin' | 'draw'>(interactMode);
  const drawnPointsRef = useRef<[number, number][]>(drawnPoints);

  useEffect(() => {
    interactModeRef.current = interactMode;
  }, [interactMode]);

  useEffect(() => {
    drawnPointsRef.current = drawnPoints;
  }, [drawnPoints]);

  // Calculate live acreage from drawn polygon
  const calculatedArea = useMemo(() => {
    return calculatePolygonAreaAcres(drawnPoints);
  }, [drawnPoints]);

  // Apply or Swap Tile Layer seamlessly without remounting map
  const applyTileLayer = (layerType: MapLayerType) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const config = getTileLayerConfig(layerType, apiKey);
    map.setMaxZoom(config.maxZoom);

    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains.length > 0 ? config.subdomains : 'abc',
      maxZoom: config.maxZoom,
      maxNativeZoom: config.maxNativeZoom,
    }).addTo(map);

    currentTileLayerRef.current = newTileLayer;
    setIsMaxZoomLocked(map.getZoom() >= config.maxZoom);
  };

  // Helper to enlarge map to fit field boundary or center pin (safely locked to max available zoom)
  const fitMapToField = (
    map: L.Map,
    points: [number, number][],
    lat: number,
    lon: number,
    animate = true
  ) => {
    const safeMax = map.getMaxZoom ? map.getMaxZoom() : 20;
    if (points && points.length >= 3) {
      const poly = L.polygon(points);
      const bounds = poly.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [35, 35],
          maxZoom: safeMax, // Maximize zoom safely locked to available satellite data
          animate,
          duration: animate ? 1.0 : 0,
        });
        return;
      }
    }
    if (lat !== 0 && lon !== 0) {
      if (animate) {
        map.flyTo([lat, lon], safeMax, { duration: 1.0 });
      } else {
        map.setView([lat, lon], safeMax);
      }
    }
  };

  // 1-Tap handler to maximize zoom directly to the field
  const handleMaxEnlargeField = () => {
    if (!mapInstanceRef.current) return;
    fitMapToField(mapInstanceRef.current, drawnPoints, selectedLat, selectedLon, true);
  };

  // Sync internal drawn points if fieldBoundary prop changes from parent, and auto-enlarge
  useEffect(() => {
    if (fieldBoundary && fieldBoundary.length > 0) {
      setDrawnPoints(fieldBoundary);
      if (mapInstanceRef.current && fieldBoundary.length >= 3) {
        fitMapToField(mapInstanceRef.current, fieldBoundary, selectedLat, selectedLon, true);
      }
    }
  }, [fieldBoundary, selectedLat, selectedLon]);

  // Initialize Leaflet Map at Field-Level Zoom (Zoom 19 or fit to boundary)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const hasBoundary = fieldBoundary && fieldBoundary.length >= 3;
    const initialConfig = getTileLayerConfig(activeLayer, apiKey);
    const initialZoom = selectedLat !== 0 && selectedLon !== 0 ? Math.min(19, initialConfig.maxZoom) : 14;

    const map = L.map(mapContainerRef.current, {
      center: [selectedLat, selectedLon],
      zoom: initialZoom,
      minZoom: 3,
      maxZoom: initialConfig.maxZoom,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Apply active tile layer
    applyTileLayer(activeLayer);

    const checkZoomLocked = () => {
      setIsMaxZoomLocked(map.getZoom() >= map.getMaxZoom());
    };
    map.on('zoomend', checkZoomLocked);
    checkZoomLocked();

    // Invalidate size after layout/mount and auto-fit to field
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
      if (hasBoundary && fieldBoundary) {
        fitMapToField(map, fieldBoundary, selectedLat, selectedLon, false);
      } else if (selectedLat !== 0 && selectedLon !== 0) {
        map.setView([selectedLat, selectedLon], Math.min(19, map.getMaxZoom()));
      }
      checkZoomLocked();
    }, 200);

    // Click handler: dispatches to either pin or drawing polygon
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (interactModeRef.current === 'draw') {
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        const next = [...drawnPointsRef.current, newPoint];
        setDrawnPoints(next);
      } else {
        onSelectCoordinates(e.latlng.lat, e.latlng.lng);
        setLocationMode('manual');
        setLocationStatus(null);
      }
    });

    return () => {
      clearTimeout(resizeTimer);
      map.off('zoomend', checkZoomLocked);
      if (markerRef.current) {
        try {
          map.removeLayer(markerRef.current);
        } catch {
          // ignore
        }
        markerRef.current = null;
      }
      if (gridCircleRef.current) {
        try {
          map.removeLayer(gridCircleRef.current);
        } catch {
          // ignore
        }
        gridCircleRef.current = null;
      }
      if (polygonLayerRef.current) {
        try {
          map.removeLayer(polygonLayerRef.current);
        } catch {
          // ignore
        }
        polygonLayerRef.current = null;
      }
      if (polylineLayerRef.current) {
        try {
          map.removeLayer(polylineLayerRef.current);
        } catch {
          // ignore
        }
        polylineLayerRef.current = null;
      }
      vertexMarkersRef.current.forEach((m) => {
        try {
          map.removeLayer(m);
        } catch {
          // ignore
        }
      });
      vertexMarkersRef.current = [];
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when activeLayer changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(activeLayer);
    }
  }, [activeLayer]);

  // Update place name whenever coordinates change
  useEffect(() => {
    let active = true;
    getHumanReadableLocation(selectedLat, selectedLon, allRegions).then((name) => {
      if (active) {
        setPlaceName(name);
      }
    });
    return () => {
      active = false;
    };
  }, [selectedLat, selectedLon, allRegions]);

  // Update marker and NASA 0.5° footprint circle when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Custom SVG Marker (High-visibility Emerald Drop Pin with Target Center & Ripple, strict zero-emoji)
    const customIcon = L.divIcon({
      className: 'custom-farm-marker',
      html: `
        <div style="
          width: 34px;
          height: 44px;
          position: relative;
          cursor: pointer;
        ">
          <!-- Pulse ripple behind pin point -->
          <div style="
            position: absolute;
            left: 50%;
            bottom: 0px;
            transform: translateX(-50%);
            width: 22px;
            height: 10px;
            background: rgba(16, 185, 129, 0.5);
            border-radius: 50%;
            filter: blur(2px);
          "></div>
          <!-- High-Contrast Drop Pin SVG -->
          <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));">
            <path d="M17 0C7.61 0 0 7.61 0 17C0 29.5 17 44 17 44C17 44 34 29.5 34 17C34 7.61 26.39 0 17 0Z" fill="#10b981"/>
            <path d="M17 1C8.16 1 1 8.16 1 17C1 28.5 17 42.5 17 42.5C17 42.5 33 28.5 33 17C33 8.16 25.84 1 17 1Z" stroke="#ffffff" stroke-width="2.5"/>
            <circle cx="17" cy="16" r="5.5" fill="#ffffff"/>
            <circle cx="17" cy="16" r="3" fill="#047857"/>
          </svg>
        </div>
      `,
      iconSize: [34, 44],
      iconAnchor: [17, 44],
    });

    if (markerRef.current && map.hasLayer(markerRef.current)) {
      markerRef.current.setLatLng([selectedLat, selectedLon]);
      markerRef.current.setIcon(customIcon);
    } else {
      if (markerRef.current) {
        try {
          map.removeLayer(markerRef.current);
        } catch {
          // ignore
        }
      }
      markerRef.current = L.marker([selectedLat, selectedLon], {
        icon: customIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }

    // Snapped NASA POWER 0.5° Grid footprint
    const snappedLat = snapCoordinateToGrid(selectedLat);
    const snappedLon = snapCoordinateToGrid(selectedLon);

    if (gridCircleRef.current && map.hasLayer(gridCircleRef.current)) {
      gridCircleRef.current.setLatLng([snappedLat, snappedLon]);
    } else {
      if (gridCircleRef.current) {
        try {
          map.removeLayer(gridCircleRef.current);
        } catch {
          // ignore
        }
      }
      gridCircleRef.current = L.circle([snappedLat, snappedLon], {
        radius: 27500, // ~55km diameter (approx 0.5 deg)
        color: '#10b981',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.1,
        dashArray: '4, 4',
      }).addTo(map);
    }

    // Fly to coordinates or auto-fit to field boundary
    if (drawnPointsRef.current && drawnPointsRef.current.length >= 3) {
      fitMapToField(map, drawnPointsRef.current, selectedLat, selectedLon, true);
    } else {
      map.flyTo([selectedLat, selectedLon], Math.min(19, map.getMaxZoom()), {
        duration: 1.0,
      });
    }
  }, [selectedLat, selectedLon]);

  // Render Polygon and Vertex Markers when drawnPoints change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clean up existing vertex markers
    vertexMarkersRef.current.forEach((m) => map.removeLayer(m));
    vertexMarkersRef.current = [];

    // Clean up existing polyline
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }

    // Clean up existing polygon
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }

    if (drawnPoints.length === 0) return;

    // Draw individual vertex corner dots
    drawnPoints.forEach(([lat, lon], idx) => {
      const dot = L.circleMarker([lat, lon], {
        radius: 5,
        color: '#ffffff',
        weight: 2,
        fillColor: '#059669',
        fillOpacity: 1,
      }).addTo(map);

      dot.bindTooltip(`Corner #${idx + 1}`, {
        permanent: false,
        direction: 'top',
        className: 'font-montserrat text-[10px]',
      });

      vertexMarkersRef.current.push(dot);
    });

    // If 2 points: draw connecting line
    if (drawnPoints.length === 2) {
      polylineLayerRef.current = L.polyline(drawnPoints, {
        color: '#059669',
        weight: 3,
        dashArray: '6, 6',
      }).addTo(map);
    }

    // If 3+ points: draw closed polygon and auto-fit to max enlarge
    if (drawnPoints.length >= 3) {
      const poly = L.polygon(drawnPoints, {
        color: '#059669',
        weight: 2.5,
        fillColor: '#10b981',
        fillOpacity: 0.25,
      }).addTo(map);
      polygonLayerRef.current = poly;

      fitMapToField(map, drawnPoints, selectedLat, selectedLon, true);
    }
  }, [drawnPoints, selectedLat, selectedLon]);

  // Handler for GPS / Device Location (Automatic / 1-Tap)
  const handleDetectLocation = async () => {
    setIsLocating(true);
    setLocationStatus(null);

    const result = await getCurrentFarmLocation();

    if (result.error || result.latitude === 0) {
      setLocationStatus({
        type: 'error',
        text: result.error || 'Unable to acquire GPS fix.',
      });
      setIsLocating(false);
      return;
    }

    // GPS coordinates retrieved - fly directly to field-level zoom (Zoom 18)
    onSelectCoordinates(result.latitude, result.longitude);
    setLocationMode('auto');
    if (mapInstanceRef.current) {
      fitMapToField(mapInstanceRef.current, drawnPointsRef.current, result.latitude, result.longitude, true);
    }

    // Auto-align nearest agro-ecological region in the background for season template
    const nearest = findNearestAgroRegion(result.latitude, result.longitude, allRegions);
    if (nearest && nearest.id !== currentRegion.id) {
      onSelectRegion(nearest);
    }

    const accuracyText = result.accuracy ? ` (±${Math.round(result.accuracy)}m)` : '';
    const regionName = nearest ? nearest.name.split(' (')[0] : '';

    setLocationStatus({
      type: 'success',
      text: `Farm located via GPS${accuracyText}: ${regionName}`,
    });

    setIsLocating(false);
  };

  // Drawing Handlers
  const handleUndoPoint = () => {
    setDrawnPoints((prev) => prev.slice(0, -1));
  };

  const handleClearDrawnBoundary = () => {
    setDrawnPoints([]);
    if (onUpdateFieldBoundary) {
      onUpdateFieldBoundary([], 0);
    }
  };

  const handleSaveDrawnBoundary = () => {
    if (drawnPoints.length < 3) return;

    const area = calculatePolygonAreaAcres(drawnPoints);
    const centroid = calculatePolygonCentroid(drawnPoints);

    // Update center coordinates to polygon centroid
    onSelectCoordinates(centroid[0], centroid[1]);

    // Save field boundary vertices and calculated acreage
    if (onUpdateFieldBoundary) {
      onUpdateFieldBoundary(drawnPoints, area.acres);
    }

    // Immediately maximize zoom and fit the newly saved boundary
    if (mapInstanceRef.current) {
      fitMapToField(mapInstanceRef.current, drawnPoints, centroid[0], centroid[1], true);
    }

    setLocationStatus({
      type: 'success',
      text: `Field boundary saved: ${area.acres} acres (${area.hectares} ha)`,
    });

    setInteractMode('pin');
  };

  return (
    <div
      className={
        embedded
          ? 'relative isolate z-0 sm:rounded-2xl sm:border sm:border-stone-200/80 sm:bg-white sm:p-3 dark:sm:border-stone-800 dark:sm:bg-stone-900/40'
          : 'card-chai p-2.5 sm:p-4 relative isolate z-0'
      }
    >
      {/* Top Banner: Farm Location & Live Detection Indicator */}
      <div className="mb-2 sm:mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h2 className="font-montserrat text-xs sm:text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100 truncate">
              Field location and NASA Earth footprint
            </h2>
          </div>
          {/* Human Readable Location Name */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs text-stone-600 dark:text-stone-300">
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {placeName || currentRegion.name.split(' (')[0]}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] text-stone-500 dark:text-stone-400">
              {locationMode === 'auto' ? (
                <>
                  <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Auto GPS</span>
                </>
              ) : (
                <span>Manual pin</span>
              )}
            </span>
            {calculatedArea.acres > 0 && (
              <>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="font-montserrat text-[10.5px] sm:text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {calculatedArea.acres} acres ({calculatedArea.hectares} ha)
                </span>
              </>
            )}
          </div>
        </div>

        {/* 1-Tap "Locate My Field" Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="btn-asym w-full sm:w-auto inline-flex min-h-[38px] sm:min-h-[42px] items-center justify-center gap-1.5 sm:gap-2 bg-stone-900 px-3.5 sm:px-4 py-1.5 sm:py-2 font-montserrat text-xs font-semibold text-white transition active:scale-95 disabled:opacity-60 hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
            title="Detect your current field automatically using GPS"
          >
            <Navigation className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating ? 'Detecting location...' : 'Locate my field (GPS)'}
            </span>
          </button>

          <div className="hidden sm:flex flex-col items-end font-mono text-[11px] text-stone-500 dark:text-stone-400">
            <span>Lat: {selectedLat.toFixed(4)}°</span>
            <span>Lon: {selectedLon.toFixed(4)}°</span>
          </div>
        </div>
      </div>

      {/* GPS Status Message Toast */}
      {locationStatus && (
        <div
          className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
            locationStatus.type === 'success'
              ? 'border border-stone-200 bg-stone-50/90 text-stone-800 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-200'
              : 'border border-rose-300 bg-rose-50/80 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {locationStatus.type === 'success' ? (
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{locationStatus.text}</span>
          </div>
          <button
            onClick={() => setLocationStatus(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Map Layer Switcher & Interaction Mode Toggles - Responsive 2-Row Layout */}
      <div className="mb-2 sm:mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 border-b border-stone-200/70 pb-2 sm:pb-3 dark:border-stone-800">
        {/* Layer Selector */}
        <div className="flex w-full sm:w-auto rounded-lg border border-stone-200/80 bg-stone-100/80 p-0.5 text-xs dark:border-stone-800 dark:bg-stone-900/80">
          <button
            type="button"
            onClick={() => setActiveLayer('clean')}
            className={`flex-1 sm:flex-none inline-flex min-h-[32px] sm:min-h-[34px] items-center justify-center gap-1 sm:gap-1.5 rounded px-2 sm:px-3 py-1 font-montserrat text-[10.5px] sm:text-[11px] font-medium transition text-center whitespace-nowrap ${
              activeLayer === 'clean'
                ? 'bg-white text-stone-900 font-semibold dark:bg-stone-800 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <MapIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span>Roads</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('satellite')}
            className={`flex-1 sm:flex-none inline-flex min-h-[32px] sm:min-h-[34px] items-center justify-center gap-1 sm:gap-1.5 rounded px-2 sm:px-3 py-1 font-montserrat text-[10.5px] sm:text-[11px] font-medium transition text-center whitespace-nowrap ${
              activeLayer === 'satellite'
                ? 'bg-white text-stone-900 font-semibold dark:bg-stone-800 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Satellite className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('terrain')}
            className={`flex-1 sm:flex-none inline-flex min-h-[32px] sm:min-h-[34px] items-center justify-center gap-1 sm:gap-1.5 rounded px-2 sm:px-3 py-1 font-montserrat text-[10.5px] sm:text-[11px] font-medium transition text-center whitespace-nowrap ${
              activeLayer === 'terrain'
                ? 'bg-white text-stone-900 font-semibold dark:bg-stone-800 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Mountain className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
            <span>Terrain</span>
          </button>
        </div>

        {/* Interaction Actions: Pin / Draw + Maximize */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
          {/* Mode Selector */}
          <div className="inline-flex min-w-0 rounded-lg border border-stone-200/80 bg-stone-100/80 p-0.5 text-xs dark:border-stone-800 dark:bg-stone-900/80 flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => setInteractMode('pin')}
              className={`flex-1 sm:flex-none inline-flex min-h-[32px] sm:min-h-[34px] items-center justify-center gap-1 sm:gap-1.5 rounded px-1.5 sm:px-3 py-1 font-montserrat text-[10.5px] sm:text-[11px] font-medium transition whitespace-nowrap ${
                interactMode === 'pin'
                  ? 'bg-white text-stone-900 font-semibold dark:bg-stone-800 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span>Pin field</span>
            </button>
            <button
              type="button"
              onClick={() => setInteractMode('draw')}
              className={`flex-1 sm:flex-none inline-flex min-h-[32px] sm:min-h-[34px] items-center justify-center gap-1 sm:gap-1.5 rounded px-1.5 sm:px-3 py-1 font-montserrat text-[10.5px] sm:text-[11px] font-medium transition whitespace-nowrap ${
                interactMode === 'draw'
                  ? 'bg-white text-stone-900 font-semibold dark:bg-stone-800 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span>Draw boundary</span>
            </button>
          </div>

          {/* 1-Tap Maximum Enlarge / Zoom to Field Button */}
          <button
            type="button"
            onClick={handleMaxEnlargeField}
            className={`btn-asym-mirror inline-flex min-h-[32px] sm:min-h-[34px] items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-3 py-1 font-montserrat text-[10.5px] sm:text-[11px] font-semibold transition active:scale-95 shadow-xs shrink-0 whitespace-nowrap ${
              isMaxZoomLocked
                ? 'border-emerald-400 bg-emerald-100/80 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-200'
                : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
            title={
              isMaxZoomLocked
                ? 'Max resolution reached (18x). Zoom is locked to available imagery to prevent missing data.'
                : 'Max enlarge: zooms map directly into field parcel at sub-meter resolution (Zoom 18)'
            }
          >
            {isMaxZoomLocked ? (
              <>
                <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Max locked</span>
              </>
            ) : (
              <>
                <ZoomIn className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Max enlarge</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Drawing Guidance & Action Controls Bar */}
      {interactMode === 'draw' && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/80 p-3 text-xs dark:border-emerald-500/20 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
            <div>
              <span className="font-montserrat font-semibold text-stone-900 dark:text-stone-100">
                {drawnPoints.length === 0
                  ? 'Tap corners on satellite map to draw field'
                  : drawnPoints.length === 1
                  ? 'Tap 2nd corner to trace boundary edge'
                  : drawnPoints.length === 2
                  ? 'Tap 3rd corner to enclose farm parcel'
                  : `Enclosed field: ${calculatedArea.acres} acres (${calculatedArea.hectares} ha)`}
              </span>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {drawnPoints.length >= 3
                  ? 'Tap more points to refine perimeter, or save boundary'
                  : 'Outlines your exact farm acreage for precision NASA calibration'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {drawnPoints.length > 0 && (
              <button
                onClick={handleUndoPoint}
                className="btn-asym-mirror inline-flex min-h-[32px] items-center gap-1 border border-stone-300 bg-white px-2.5 py-1 font-montserrat text-[11px] font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
                title="Undo last corner point"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Undo</span>
              </button>
            )}

            {drawnPoints.length > 0 && (
              <button
                onClick={handleClearDrawnBoundary}
                className="btn-asym-mirror inline-flex min-h-[32px] items-center gap-1 border border-rose-300 bg-white px-2.5 py-1 font-montserrat text-[11px] font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:bg-stone-900 dark:text-rose-300 dark:hover:bg-rose-950/50"
                title="Clear boundary and restart"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            )}

            {drawnPoints.length >= 3 && (
              <button
                onClick={handleSaveDrawnBoundary}
                className="btn-asym inline-flex min-h-[32px] items-center gap-1.5 bg-emerald-700 px-3 py-1 font-montserrat text-[11px] font-semibold text-white transition hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save boundary</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive Map Canvas (Enlarged High-Resolution Viewport) */}
      <div className={`relative isolate z-0 w-full overflow-hidden rounded-xl border border-stone-200/80 dark:border-stone-800 ${mapHeightClassName || 'h-96 sm:h-[480px]'}`}>
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>

      {/* Sleek Bottom Instruction Bar (outside map so it never covers the map or Leaflet attribution) */}
      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-stone-200/70 bg-stone-50/90 px-2.5 py-1 font-montserrat text-[10.5px] font-medium text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
        <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="truncate">
          {interactMode === 'draw'
            ? `Tap satellite map to place parcel corners (${drawnPoints.length} placed)`
            : calculatedArea.acres > 0
            ? `Field boundary active (${calculatedArea.acres} acres) • Tap to move center pin`
            : 'Tap anywhere on the map to place your farm pin'}
        </span>
      </div>
    </div>
  );
};
export default MapSelector;