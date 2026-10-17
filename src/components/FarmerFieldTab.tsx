import React from 'react';
import { SoilProfile, FarmerPriorities, AgroRegion } from '../types';
import { Language, TRANSLATIONS } from '../data/translations';
import { MapSelector } from './MapSelector';
import { Sprout, Droplets, MapPin, Check } from 'lucide-react';

interface FarmerFieldTabProps {
  region: AgroRegion;
  allRegions: AgroRegion[];
  soil: SoilProfile;
  priorities: FarmerPriorities;
  onUpdateSoil: (updated: SoilProfile) => void;
  onUpdatePriorities: (updated: FarmerPriorities) => void;
  onSelectRegion: (reg: AgroRegion) => void;
  onSelectCoordinates: (lat: number, lon: number) => void;
  selectedLat: number;
  selectedLon: number;
  lang: Language;
}

export const FarmerFieldTab: React.FC<FarmerFieldTabProps> = ({
  region,
  allRegions,
  soil,
  priorities,
  onUpdateSoil,
  onUpdatePriorities,
  onSelectRegion,
  onSelectCoordinates,
  selectedLat,
  selectedLon,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6">
      {/* 1. Soil Selection (Visual Tap Cards) */}
      <div className="rounded-xl border border-amber-900/15 bg-white p-4 shadow-none dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex items-center gap-2 mb-3">
          <Sprout className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          <h2 className="font-montserrat text-sm font-bold text-stone-900 dark:text-stone-100">{t.soilType}</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Loam */}
          <button
            onClick={() => onUpdateSoil({ ...soil, texture: 'silt_loam' })}
            className={`flex flex-col text-start p-3 rounded-xl border transition-all active:scale-98 ${
              soil.texture === 'silt_loam'
                ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/40'
                : 'border-stone-200 bg-stone-50/70 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/60'
            }`}
          >
            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{t.soilLoam}</span>
            <span className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              {t.soilLoamDesc}
            </span>
          </button>

          {/* Clay */}
          <button
            onClick={() => onUpdateSoil({ ...soil, texture: 'clay' })}
            className={`flex flex-col text-start p-3 rounded-xl border transition-all active:scale-98 ${
              soil.texture === 'clay'
                ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/40'
                : 'border-stone-200 bg-stone-50/70 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/60'
            }`}
          >
            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{t.soilClay}</span>
            <span className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              {t.soilClayDesc}
            </span>
          </button>

          {/* Sandy Loam */}
          <button
            onClick={() => onUpdateSoil({ ...soil, texture: 'sandy_loam' })}
            className={`flex flex-col text-start p-3 rounded-xl border transition-all active:scale-98 ${
              soil.texture === 'sandy_loam'
                ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/40'
                : 'border-stone-200 bg-stone-50/70 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/60'
            }`}
          >
            <span className="font-bold text-xs text-stone-900 dark:text-stone-100">{t.soilSandy}</span>
            <span className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              {t.soilSandyDesc}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Water Availability (Visual Tap Cards) */}
      <div className="rounded-xl border border-amber-900/15 bg-white p-4 shadow-none dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          <h2 className="font-montserrat text-sm font-bold text-stone-900 dark:text-stone-100">{t.waterSource}</h2>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {/* Tubewell */}
          <button
            onClick={() =>
              onUpdatePriorities({
                ...priorities,
                waterAccessType: 'groundwater_borewell',
              })
            }
            className={`flex items-center justify-between p-3 rounded-xl border text-start transition-all active:scale-98 ${
              priorities.waterAccessType === 'groundwater_borewell'
                ? 'border-sky-600 bg-sky-50/80 ring-1 ring-sky-600/30 dark:border-sky-500 dark:bg-sky-950/40'
                : 'border-stone-200 bg-stone-50/70 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/60'
            }`}
          >
            <div>
              <p className="font-bold text-xs text-stone-900 dark:text-stone-100">{t.waterBorewell}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {lang === 'ur'
                  ? 'زیر زمین پانی نکالنا'
                  : lang === 'hi'
                  ? 'भूजल से सिंचाई'
                  : lang === 'pa'
                  ? 'ਧਰਤੀ ਹੇਠਲਾ ਟਿਊਬਵੈੱਲ ਪਾਣੀ'
                  : 'Groundwater extraction'}
              </p>
            </div>
            {priorities.waterAccessType === 'groundwater_borewell' && (
              <Check className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            )}
          </button>

          {/* Canal */}
          <button
            onClick={() =>
              onUpdatePriorities({
                ...priorities,
                waterAccessType: 'canal_surface',
              })
            }
            className={`flex items-center justify-between p-3 rounded-xl border text-start transition-all active:scale-98 ${
              priorities.waterAccessType === 'canal_surface'
                ? 'border-sky-600 bg-sky-50/80 ring-1 ring-sky-600/30 dark:border-sky-500 dark:bg-sky-950/40'
                : 'border-stone-200 bg-stone-50/70 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/60'
            }`}
          >
            <div>
              <p className="font-bold text-xs text-stone-900 dark:text-stone-100">{t.waterCanal}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {lang === 'ur'
                  ? 'سطحی نہری پانی کا نظام'
                  : lang === 'hi'
                  ? 'मौसमी नहरी पानी'
                  : lang === 'pa'
                  ? 'ਨਹਿਰੀ ਪਾਣੀ ਦਾ ਸਿਸਟਮ'
                  : 'Surface canal network'}
              </p>
            </div>
            {priorities.waterAccessType === 'canal_surface' && (
              <Check className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
            )}
          </button>

          {/* Rainfed */}
          <button
            onClick={() =>
              onUpdatePriorities({
                ...priorities,
                waterAccessType: 'rainfed',
              })
            }
            className={`flex items-center justify-between p-3 rounded-xl border text-start transition-all active:scale-98 ${
              priorities.waterAccessType === 'rainfed'
                ? 'border-amber-600 bg-amber-50/80 ring-1 ring-amber-600/30 dark:border-amber-500 dark:bg-amber-950/40'
                : 'border-stone-200 bg-stone-50/70 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/60'
            }`}
          >
            <div>
              <p className="font-bold text-xs text-stone-900 dark:text-stone-100">{t.waterRainfed}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {lang === 'ur'
                  ? 'صرف بارش اور بارانی رقبہ'
                  : lang === 'hi'
                  ? 'केवल मानसून / बारिश'
                  : lang === 'pa'
                  ? 'ਸਿਰਫ਼ ਮੀਂਹ ਤੇ ਨਿਰਭਰ (ਬਰਾਨੀ)'
                  : 'Dryland rainfed only'}
              </p>
            </div>
            {priorities.waterAccessType === 'rainfed' && (
              <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
          </button>

          {/* Drip */}
          <button
            onClick={() =>
              onUpdatePriorities({
                ...priorities,
                waterAccessType: 'drip_precision',
              })
            }
            className={`flex items-center justify-between p-3 rounded-xl border text-start transition-all active:scale-98 ${
              priorities.waterAccessType === 'drip_precision'
                ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/40'
                : 'border-stone-200 bg-stone-50/70 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/60'
            }`}
          >
            <div>
              <p className="font-bold text-xs text-stone-900 dark:text-stone-100">{t.waterDrip}</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {lang === 'ur'
                  ? 'ڈرپ یا فوارہ نظام (70% پانی کی بچت)'
                  : lang === 'hi'
                  ? 'पानी की 70% बचत'
                  : lang === 'pa'
                  ? 'ਪਾਣੀ ਦੀ 70% ਬੱਚਤ'
                  : 'Micro-irrigation'}
              </p>
            </div>
            {priorities.waterAccessType === 'drip_precision' && (
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Farm Location & NASA Map */}
      <MapSelector
        currentRegion={region}
        allRegions={allRegions}
        onSelectCoordinates={onSelectCoordinates}
        onSelectRegion={onSelectRegion}
        selectedLat={selectedLat}
        selectedLon={selectedLon}
      />
    </div>
  );
};
