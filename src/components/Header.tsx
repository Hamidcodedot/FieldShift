import React from 'react';
import { Satellite, Download, MapPin, Globe, Sun, Moon } from 'lucide-react';
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
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
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
  theme,
  onToggleTheme,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/90 bg-white/95 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-50 text-emerald-700 shadow-none shrink-0 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Satellite className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-brand text-base font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                {t.appName}
              </span>
              <span className="rounded border border-emerald-600/30 bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold tracking-wide text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400">
                NASA
              </span>
            </div>
            <p className="text-[10px] text-stone-500 hidden xs:block dark:text-stone-400">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Global Controls, Theme Switcher & Language Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* ChaiUI Theme Toggle Switch */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-700 transition hover:bg-stone-100 active:scale-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-stone-700" />
            )}
          </button>

          {/* Multilingual Selector Dropdown with Auto Badge */}
          <div className="relative flex items-center rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs text-stone-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Globe className="h-3.5 w-3.5 text-emerald-600 shrink-0 me-1.5 dark:text-emerald-400" />
            <select
              value={lang}
              onChange={(e) => onSelectLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer pe-1 dark:text-emerald-200"
            >
              {SUPPORTED_LANGUAGES.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                  className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100"
                >
                  {item.nativeName}
                </option>
              ))}
            </select>
            {isAutoDetectedLang && (
              <span className="hidden md:inline-block ms-1 rounded bg-emerald-100 px-1 text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                Auto
              </span>
            )}
          </div>

          {/* Region Dropdown (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 dark:text-emerald-400" />
            <select
              value={currentRegion.id}
              onChange={(e) => {
                const found = allRegions.find((r) => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className="bg-transparent text-xs text-stone-800 focus:outline-none cursor-pointer max-w-[120px] md:max-w-[150px] truncate dark:text-stone-200"
            >
              {allRegions.map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-200">
                  {reg.name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Print Field Plan / Parcha */}
          <button
            onClick={onOpenExportModal}
            className="btn-asym flex items-center gap-1 border border-stone-200 bg-stone-100 px-2 sm:px-2.5 py-1 text-xs font-medium text-stone-800 transition hover:bg-stone-200 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
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
