import React from 'react';
import { Satellite, ShieldCheck, Download, MapPin, Sparkles } from 'lucide-react';
import { AgroRegion } from '../types';

interface HeaderProps {
  currentRegion: AgroRegion;
  allRegions: AgroRegion[];
  onSelectRegion: (region: AgroRegion) => void;
  apiSource: 'live' | 'cached' | 'fallback';
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRegion,
  allRegions,
  onSelectRegion,
  apiSource,
  onOpenExportModal,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shadow-sm">
            <Satellite className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-zinc-100">
                FieldShift
              </span>
              <span className="rounded border border-emerald-500/30 bg-emerald-950/50 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-emerald-400">
                NASA POWER + SMAP
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Climate-Resilient Agro-Ecological Decision Support
            </p>
          </div>
        </div>

        {/* Global Region Switcher & Status */}
        <div className="flex items-center gap-3">
          {/* Live Data Badge */}
          <div className="hidden items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs text-zinc-300 md:flex">
            <span
              className={`h-2 w-2 rounded-full ${
                apiSource === 'live'
                  ? 'bg-emerald-500 animate-pulse'
                  : apiSource === 'cached'
                  ? 'bg-blue-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[11px]">
              {apiSource === 'live'
                ? 'NASA POWER Live'
                : apiSource === 'cached'
                ? 'NASA POWER Cached'
                : 'NASA MERRA-2 Climatology'}
            </span>
          </div>

          {/* Region Dropdown */}
          <div className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <select
              value={currentRegion.id}
              onChange={(e) => {
                const found = allRegions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer pr-1"
            >
              {allRegions.map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-zinc-900 text-zinc-200">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export Action Plan Button */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
