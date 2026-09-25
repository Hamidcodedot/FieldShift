import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { AgroRegion } from '../types';
import { snapCoordinateToGrid } from '../services/nasaService';
import { Globe, MapPin, Navigation } from 'lucide-react';

interface MapSelectorProps {
  currentRegion: AgroRegion;
  allRegions: AgroRegion[];
  onSelectCoordinates: (lat: number, lon: number) => void;
  onSelectRegion: (region: AgroRegion) => void;
  selectedLat: number;
  selectedLon: number;
}

export const MapSelector: React.FC<MapSelectorProps> = ({
  currentRegion,
  allRegions,
  onSelectCoordinates,
  onSelectRegion,
  selectedLat,
  selectedLon,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const gridCircleRef = useRef<L.Circle | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedLat, selectedLon],
      zoom: 4,
      minZoom: 2,
      maxZoom: 14,
      zoomControl: true,
    });

    // Dark high-contrast cartography suitable for geospatial data
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Click handler to pick any point on Earth
    map.on('click', (e: L.LeafletMouseEvent) => {
      onSelectCoordinates(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker and view when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Custom SVG Icon (strict zero-emoji)
    const customIcon = L.divIcon({
      className: 'custom-farm-marker',
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: #059669;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(5, 150, 105, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
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

    map.flyTo([selectedLat, selectedLon], Math.max(map.getZoom(), 4), {
      duration: 1.2,
    });
  }, [selectedLat, selectedLon]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
            Field Location & NASA Earth Footprint
          </h2>
        </div>

        {/* Readout */}
        <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
          <span>Lat: <strong className="text-zinc-200">{selectedLat.toFixed(4)}°</strong></span>
          <span>Lon: <strong className="text-zinc-200">{selectedLon.toFixed(4)}°</strong></span>
          <span className="hidden sm:inline">NASA Cell: <strong className="text-emerald-400">{snapCoordinateToGrid(selectedLat).toFixed(2)}°, {snapCoordinateToGrid(selectedLon).toFixed(2)}°</strong></span>
        </div>
      </div>

      {/* Preset Region Quick Pills */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {allRegions.map((reg) => (
          <button
            key={reg.id}
            onClick={() => onSelectRegion(reg)}
            className={`rounded-md border px-2.5 py-1 text-xs transition active:scale-95 ${
              currentRegion.id === reg.id
                ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300 font-medium'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            {reg.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-zinc-800 sm:h-72">
        <div ref={mapContainerRef} className="h-full w-full" />
        <div className="absolute bottom-2 right-2 z-1000 rounded bg-zinc-950/80 px-2 py-1 text-[10px] text-zinc-400 backdrop-blur-sm">
          Click anywhere on globe to evaluate coordinates
        </div>
      </div>
    </div>
  );
};
