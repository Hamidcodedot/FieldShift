import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AgroRegion } from '../types';
import { snapCoordinateToGrid } from '../services/nasaService';
import { getCurrentFarmLocation, findNearestAgroRegion } from '../services/geolocationService';
import {
  getGoogleMapsApiKey,
  setGoogleMapsApiKey,
  getTileLayerConfig,
  MapLayerType,
} from '../services/mapConfigService';
import {
  Globe,
  Navigation,
  Key,
  Layers,
  Check,
  AlertCircle,
  X,
  Satellite,
  Compass,
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
  const [apiKey, setApiKey] = useState<string>(() => getGoogleMapsApiKey());
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isUrdu = lang === 'ur';

  // Initialize or update Tile Layer
  const applyTileLayer = (layerType: MapLayerType, activeKey: string) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove old tile layer if exists
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const config = getTileLayerConfig(layerType, activeKey);
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

    // Apply initial layer
    applyTileLayer(activeLayer, apiKey);

    // Click handler to pick any point on Earth
    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectCoordinates(e.latlng.lat, e.latlng.lng);
      setLocationStatus(null);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer when activeLayer or apiKey changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(activeLayer, apiKey);
    }
  }, [activeLayer, apiKey]);

  // Update marker and view when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Custom SVG Marker (strict zero-emoji)
    const customIcon = L.divIcon({
      className: 'custom-farm-marker',
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background-color: #059669;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(5, 150, 105, 0.7);
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

  // Handler for GPS / Device Location
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

    // Coordinates retrieved
    onSelectCoordinates(result.latitude, result.longitude);

    // Find closest region
    const nearest = findNearestAgroRegion(result.latitude, result.longitude, allRegions);
    if (nearest && nearest.id !== currentRegion.id) {
      onSelectRegion(nearest);
    }

    const accuracyText = result.accuracy ? ` (±${Math.round(result.accuracy)}m)` : '';
    const regionName = nearest ? nearest.name.split(' (')[0] : '';

    setLocationStatus({
      type: 'success',
      text: isUrdu
        ? `مقام مل گیا${accuracyText}: ${regionName}`
        : `GPS Fixed${accuracyText}: ${regionName}`,
    });

    setIsLocating(false);
  };

  // Handler for Saving Google Maps API Key
  const handleSaveApiKey = () => {
    const trimmed = keyInput.trim();
    setGoogleMapsApiKey(trimmed);
    setApiKey(trimmed);
    setShowKeyModal(false);
  };

  const handleClearApiKey = () => {
    setGoogleMapsApiKey('');
    setApiKey('');
    setKeyInput('');
    setShowKeyModal(false);
  };

  return (
    <div className="rounded-xl border border-amber-900/15 bg-white p-4 shadow-none dark:border-stone-800 dark:bg-stone-900/60">
      {/* Top Header Row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <h2 className="font-montserrat text-sm font-bold tracking-wide text-stone-900 dark:text-stone-100">
            {isUrdu ? 'فارم کا مقام اور ناسا گریڈ' : 'Field Location & NASA Earth Footprint'}
          </h2>
        </div>

        {/* GPS Button & Coordinate Readout */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDetectLocation}
            disabled={isLocating}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/30 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition active:scale-95 disabled:opacity-60 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300 ${
              isLocating ? 'animate-pulse' : 'hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
            }`}
            title={isUrdu ? 'موبائل GPS کے ذریعے فارم کا مقام معلوم کریں' : 'Detect GPS farm location'}
          >
            <Navigation className={`h-3.5 w-3.5 shrink-0 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating
                ? isUrdu
                  ? 'تلاش جاری ہے...'
                  : 'Acquiring GPS...'
                : isUrdu
                ? 'موجودہ مقام (GPS)'
                : 'Locate Farm (GPS)'}
            </span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs text-stone-600 dark:text-stone-400">
            <span>
              Lat: <strong className="text-stone-900 dark:text-stone-200">{selectedLat.toFixed(4)}°</strong>
            </span>
            <span>
              Lon: <strong className="text-stone-900 dark:text-stone-200">{selectedLon.toFixed(4)}°</strong>
            </span>
          </div>
        </div>
      </div>

      {/* GPS Status Message Toast */}
      {locationStatus && (
        <div
          className={`mb-3 flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
            locationStatus.type === 'success'
              ? 'border border-emerald-600/30 bg-emerald-50/80 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'border border-rose-600/30 bg-rose-50/80 text-rose-800 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {locationStatus.type === 'success' ? (
              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            )}
            <span>{locationStatus.text}</span>
          </div>
          <button
            onClick={() => setLocationStatus(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Preset Region Pills & Layer Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
        <div className="flex flex-wrap gap-1.5">
          {allRegions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => onSelectRegion(reg)}
              className={`rounded-md border px-2 py-0.5 text-xs transition active:scale-95 ${
                currentRegion.id === reg.id
                  ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800 font-semibold dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:border-stone-300 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              {reg.name.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Map Layer Switcher & API Key Button */}
        <div className="flex items-center gap-1.5">
          {/* Layer Selector */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs dark:border-stone-800 dark:bg-stone-900">
            <button
              onClick={() => setActiveLayer('clean')}
              className={`rounded px-2 py-0.5 font-medium transition ${
                activeLayer === 'clean'
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
              title={isUrdu ? 'عام نقشہ' : 'Standard Map'}
            >
              {isUrdu ? 'نقشہ' : 'Clean'}
            </button>
            <button
              onClick={() => setActiveLayer('satellite')}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium transition ${
                activeLayer === 'satellite'
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
              title={isUrdu ? 'سیٹلائٹ منظر' : 'Satellite View'}
            >
              <Satellite className="h-3 w-3" />
              <span>{isUrdu ? 'سیٹلائٹ' : 'Satellite'}</span>
            </button>
            <button
              onClick={() => setActiveLayer('terrain')}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium transition ${
                activeLayer === 'terrain'
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
              title={isUrdu ? 'زمینی خدوخال' : 'Terrain View'}
            >
              <Compass className="h-3 w-3" />
              <span>{isUrdu ? 'زمین' : 'Terrain'}</span>
            </button>
          </div>

          {/* API Key Modal Button */}
          <button
            onClick={() => {
              setKeyInput(apiKey);
              setShowKeyModal(true);
            }}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition active:scale-95 ${
              apiKey
                ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400'
            }`}
            title={isUrdu ? 'گوگل میپس API کی سیٹنگز' : 'Configure Google Maps API Key'}
          >
            <Key className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">
              {apiKey ? (isUrdu ? 'API کی: فعال' : 'API Key: Active') : (isUrdu ? 'API کی' : 'Map Key')}
            </span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-stone-200 sm:h-72 dark:border-stone-800">
        <div ref={mapContainerRef} className="h-full w-full" />
        <div className="absolute bottom-2 right-2 z-1000 rounded bg-white/90 px-2 py-1 text-[10px] text-stone-600 backdrop-blur-sm border border-stone-200 dark:bg-stone-950/80 dark:border-stone-800 dark:text-stone-400">
          {isUrdu
            ? 'مقام منتخب کرنے کے لیے نقشے پر کہیں بھی کلک کریں'
            : 'Click anywhere on globe to evaluate coordinates'}
        </div>
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-amber-900/15 bg-white p-5 shadow-xl dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="font-montserrat text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isUrdu ? 'گوگل میپس API کی سیٹنگز' : 'Google Maps Platform API Key'}
                </h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-md p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              {isUrdu
                ? 'گوگل میپس کی API کی درج کرنے سے آپ کے فارم کی اعلیٰ معیار کی سیٹلائٹ اور ہائبرڈ تصاویر فعال ہو جاتی ہیں۔ اگر آپ کی درج نہ کریں تو ایپ مفت اوپن سیٹلائٹ ٹائلز استعمال کرے گی۔'
                : 'Adding your Google Maps Platform API key unlocks high-resolution Google Satellite Hybrid and Terrain tile layers directly over your field. Without a key, high-resolution open satellite imagery is used automatically.'}
            </p>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold text-stone-700 dark:text-stone-300">
                {isUrdu ? 'API کی درج کریں:' : 'API Key (or set in .env as VITE_GOOGLE_MAPS_API_KEY):'}
              </label>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono text-xs text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
              {apiKey && (
                <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                  {isUrdu
                    ? `موجودہ کی فعال ہے (اختتامی 4 حروف: ${apiKey.slice(-4)})`
                    : `Active key configured (ends in ...${apiKey.slice(-4)})`}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
              {apiKey && (
                <button
                  onClick={handleClearApiKey}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 dark:border-stone-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  {isUrdu ? 'کی ختم کریں' : 'Clear Key'}
                </button>
              )}
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                {isUrdu ? 'بند کریں' : 'Cancel'}
              </button>
              <button
                onClick={handleSaveApiKey}
                className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                {isUrdu ? 'محفوظ کریں' : 'Save & Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
