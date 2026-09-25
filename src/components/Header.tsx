import React from 'react';
import { Satellite, Download, MapPin, Globe } from 'lucide-react';
import { AgroRegion } from '../types';
import { Language, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  currentRegion: AgroRegion;
  allRegions: AgroRegion[];
  onSelectRegion: (region: AgroRegion) => void;
  apiSource: 'live' | 'cached' | 'fallback';
  onOpenExportModal: () => void;
  lang: Language;
  onSelectLanguage: (lang: Language) => void;
  isAutoDetectedLang: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRegion,
  allRegions,
  onSelectRegion,
  apiSource,
  onOpenExportModal,
  lang,
  onSelectLanguage,
  isAutoDetectedLang,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shadow-sm shrink-0">
            <Satellite className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-zinc-100">
                {t.appName}
              </span>
              <span className="rounded border border-emerald-500/30 bg-emerald-950/60 px-1.5 py-0.2 text-[9px] font-bold tracking-wide text-emerald-400">
                NASA
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden xs:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Global Controls & Language Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Multilingual Selector Dropdown with Auto Badge */}
          <div className="relative flex items-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-xs text-emerald-300">
            <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0 me-1.5" />
            <select
              value={lang}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-emerald-200 focus:outline-none cursor-pointer pe-1"
            >
              {SUPPORTED_LANGUAGES.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                  className="bg-zinc-900 text-zinc-100"
                >
                  {item.nativeName}
                </option>
              ))}
            </select>
            {isAutoDetectedLang && (
              <span className="hidden md:inline-block ms-1 rounded bg-emerald-500/20 px-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                Auto
              </span>
            )}
          </div>

          {/* Region Dropdown (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <select
              value={currentRegion.id}
              onChange={(e) => {
                const found = allRegions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer max-w-[120px] md:max-w-[150px] truncate"
            >
              {allRegions.map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-zinc-900 text-zinc-200">
                  {reg.name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Print Field Plan / Parcha */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 sm:px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 active:scale-95"
            title={t.printParcha}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.printParcha.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
