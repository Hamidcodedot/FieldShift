import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AgroRegion } from '../types';
import { snapCoordinateToGrid } from '../services/nasaService';
import { getCurrentFarmLocation, findNearestAgroRegion } from '../services/geolocationService';
import { getHumanReadableLocation } from '../services/reverseGeocodeService';
import {
  getGoogleMapsApiKey,
  getTileLayerConfig,
  MapLayerType,
} from '../services/mapConfigService';
import {
  Globe,
  Navigation,
  Check,
  AlertCircle,
  X,
  Satellite,
  Compass,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface MapSelectorProps {
  currentRegion: AgroRegion;
  allRegions: AgroRegion[];
  onSelectCoordinates: (lat: number, lon: number) => void;
  onSelectRegion: (region: AgroRegion) => void;
  selectedLat: number;
  selectedLon: number;
  lang?: string;
}

export const MapSelector: React.FC<MapSelectorProps> = ({
  currentRegion,
  allRegions,
  onSelectCoordinates,
  onSelectRegion,
  selectedLat,
  selectedLon,
  lang = 'en',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const gridCircleRef = useRef<L.Circle | null>(null);

  // Map state
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('clean');
  const [apiKey] = useState<string>(() => getGoogleMapsApiKey());
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [placeName, setPlaceName] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isUrdu = lang === 'ur';

  // Apply or Swap Tile Layer seamlessly without remounting map
  const applyTileLayer = (layerType: MapLayerType) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const config = getTileLayerConfig(layerType, apiKey);
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains.length > 0 ? config.subdomains : 'abc',
      maxZoom: config.maxZoom,
    }).addTo(map);

    currentTileLayerRef.current = newTileLayer;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedLat, selectedLon],
      zoom: 6,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: true,
    });

    mapInstanceRef.current = map;

    // Apply active tile layer
    applyTileLayer(activeLayer);

    // Click handler for manual field selection
    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectCoordinates(e.latlng.lat, e.latlng.lng);
      setLocationMode('manual');
      setLocationStatus(null);
    });

    return () => {
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

  // Update marker and circle view when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Custom SVG Marker (strict zero-emoji)
    const customIcon = L.divIcon({
      className: 'custom-farm-marker',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background-color: #059669;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([selectedLat, selectedLon]);
    } else {
      markerRef.current = L.marker([selectedLat, selectedLon], { icon: customIcon }).addTo(map);
    }

    // Snapped NASA POWER 0.5° Grid footprint
    const snappedLat = snapCoordinateToGrid(selectedLat);
    const snappedLon = snapCoordinateToGrid(selectedLon);

    if (gridCircleRef.current) {
      gridCircleRef.current.setLatLng([snappedLat, snappedLon]);
    } else {
      gridCircleRef.current = L.circle([snappedLat, snappedLon], {
        radius: 27500, // ~55km diameter (approx 0.5 deg)
        color: '#10b981',
        weight: 1.5,
        fillColor: '#10b981',
        fillOpacity: 0.12,
        dashArray: '4, 4',
      }).addTo(map);
    }

    map.flyTo([selectedLat, selectedLon], Math.max(map.getZoom(), 6), {
      duration: 1.2,
    });
  }, [selectedLat, selectedLon]);

  // Handler for GPS / Device Location (Automatic / 1-Tap)
  const handleDetectLocation = async () => {
    setIsLocating(true);
    setLocationStatus(null);

    const result = await getCurrentFarmLocation();

    if (result.error || result.latitude === 0) {
      setLocationStatus({
        type: 'error',
        text: result.error || (isUrdu ? 'مقام معلوم نہ ہو سکا' : 'Unable to acquire GPS fix.'),
      });
      setIsLocating(false);
      return;
    }

    // GPS coordinates retrieved
    onSelectCoordinates(result.latitude, result.longitude);
    setLocationMode('auto');

    // Auto-align nearest agro-ecological region
    const nearest = findNearestAgroRegion(result.latitude, result.longitude, allRegions);
    if (nearest && nearest.id !== currentRegion.id) {
      onSelectRegion(nearest);
    }

    const accuracyText = result.accuracy ? ` (±${Math.round(result.accuracy)}m)` : '';
    const regionName = nearest ? nearest.name.split(' (')[0] : '';

    setLocationStatus({
      type: 'success',
      text: isUrdu
        ? `آپ کا فارم کامیابی سے لوکیٹ ہو گیا${accuracyText}: ${regionName}`
        : `Farm located via GPS${accuracyText}: ${regionName}`,
    });

    setIsLocating(false);
  };

  return (
    <div className="rounded-xl border border-amber-900/15 bg-white p-4 shadow-none dark:border-stone-800 dark:bg-stone-900/60">
      {/* Top Banner: Farm Location & Live Detection Indicator */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h2 className="font-montserrat text-sm font-bold tracking-wide text-stone-900 dark:text-stone-100">
              {isUrdu ? 'فارم کا مقام اور نقشہ' : 'Field Location & NASA Earth Footprint'}
            </h2>
          </div>
          {/* Human Readable Location Name */}
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {placeName || currentRegion.name.split(' (')[0]}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
              {locationMode === 'auto' ? (
                <>
                  <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{isUrdu ? 'خودکار GPS' : 'Auto GPS'}</span>
                </>
              ) : (
                <span>{isUrdu ? 'نقشے پر منتخب کردہ' : 'Manual Pin'}</span>
              )}
            </span>
          </div>
        </div>

        {/* 1-Tap "Locate My Field" Button */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-emerald-700/30 bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-60 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700`}
            title={isUrdu ? 'موبائل GPS کے ذریعے فارم تلاش کریں' : 'Detect your current field automatically using GPS'}
          >
            <Navigation className={`h-4 w-4 shrink-0 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating
                ? isUrdu
                  ? 'مقام تلاش ہو رہا ہے...'
                  : 'Detecting Location...'
                : isUrdu
                ? 'میرا فارم لوکیٹ کریں (GPS)'
                : 'Locate My Field (GPS)'}
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
              ? 'border border-emerald-600/30 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-rose-600/30 bg-rose-50/80 text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {locationStatus.type === 'success' ? (
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
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

      {/* Map Layer Switcher & Preset Region Selector */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
        {/* Layer Selector */}
        <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs dark:border-stone-800 dark:bg-stone-900">
          <button
            onClick={() => setActiveLayer('clean')}
            className={`min-h-[36px] rounded px-3 py-1 font-medium transition ${
              activeLayer === 'clean'
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            {isUrdu ? 'عام نقشہ' : 'Standard'}
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded px-3 py-1 font-medium transition ${
              activeLayer === 'satellite'
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Satellite className="h-3.5 w-3.5" />
            <span>{isUrdu ? 'سیٹلائٹ منظر' : 'Satellite View'}</span>
          </button>
          <button
            onClick={() => setActiveLayer('terrain')}
            className={`inline-flex min-h-[36px] items-center gap-1.5 rounded px-3 py-1 font-medium transition ${
              activeLayer === 'terrain'
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>{isUrdu ? 'زمینی خدوخال' : 'Terrain'}</span>
          </button>
        </div>

        {/* Region Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {isUrdu ? 'زرعی خطے:' : 'Regions:'}
          </span>
          {allRegions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => {
                onSelectRegion(reg);
                setLocationMode('manual');
              }}
              className={`rounded-md border px-2 py-1 text-xs transition active:scale-95 ${
                currentRegion.id === reg.id
                  ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800 font-semibold dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              {reg.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative h-72 w-full overflow-hidden rounded-xl border border-stone-200 sm:h-80 dark:border-stone-800">
        <div ref={mapContainerRef} className="h-full w-full" />
        <div className="absolute bottom-2 right-2 z-1000 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-medium text-stone-700 backdrop-blur-sm border border-stone-200 shadow-sm dark:bg-stone-950/90 dark:border-stone-800 dark:text-stone-300">
          {isUrdu
            ? 'فارم تبدیل کرنے کے لیے نقشے پر کہیں بھی کلک کریں'
            : 'Tap anywhere on the map to place your farm pin'}
        </div>
      </div>
    </div>
  );
};
