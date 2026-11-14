import React, { useState } from 'react';
import { RotationStrategy, FarmerFieldProfile, NasaClimateData, SoilProfile, AgroRegion } from '../types';
import { CROP_LOCALIZED_NAMES } from '../data/translations';
import { getCropImageUrl } from '../data/cropImages';
import { AGRO_REGIONS } from '../data/regions';
import { getDefaultFieldProfile } from '../services/fieldProfileService';
import { CropRotationCalendar } from './CropRotationCalendar';
import {
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Droplets,
  Sprout,
  Info,
  Clock,
  MapPin,
} from 'lucide-react';

interface TimelineGanttProps {
  strategy: RotationStrategy;
  onOpenCustomBuilder: () => void;
  activeField?: FarmerFieldProfile;
  climate?: NasaClimateData;
  soil?: SoilProfile;
  region?: AgroRegion;
}

export const TimelineGantt: React.FC<TimelineGanttProps> = ({
  strategy,
  onOpenCustomBuilder,
  activeField,
  climate,
  soil,
  region,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'sequence'>('calendar');

  const safeRegion = region || AGRO_REGIONS[0];
  const safeField = activeField || getDefaultFieldProfile(safeRegion);

  const nextSeasonSlot = strategy.seasons[0];
  const nextCrop = nextSeasonSlot?.crop;
  const nextCropLocName = nextCrop ? (CROP_LOCALIZED_NAMES[nextCrop.id]?.en || nextCrop.name) : 'Recommended Crop';
  const isNextLegume = nextCrop?.family === 'Fabaceae';

  // Practical agronomic rationale based on current standing crop and soil
  const standingCropLabel = safeField.currentCropHistory?.patternLabel?.split(' (')[0] || 'Current crop';
  let immediateAdviceRationale = '';
  if (isNextLegume) {
    immediateAdviceRationale = `Sowing ${nextCropLocName} immediately after ${standingCropLabel} introduces symbiotic Rhizobium bacteria. This fixes biological nitrogen directly in your root zone, cutting synthetic urea purchases for the following cereal crop.`;
  } else if (nextCrop?.family === 'Brassicaceae') {
    immediateAdviceRationale = `Indian Mustard produces bio-fumigating glucosinolates in the root zone. This sterilizes soil against cereal fungal pathogens (Take-all and Fusarium) accumulated during ${standingCropLabel}.`;
  } else if (nextCrop?.rootArchitecture === 'taproot_deep') {
    immediateAdviceRationale = `Deep taproots bio-drill through the plow pan formed by ${standingCropLabel}, opening natural subsoil aeration and water drainage channels.`;
  } else {
    immediateAdviceRationale = `Diversifies botanical family sequence, breaking nematode lifecycles and utilizing residual subsoil moisture calibrated against NASA Earth observations.`;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Immediate Next Season Action Callout Card (What to plant NEXT on this parcel) */}
      {nextCrop && (
        <div className="card-chai p-4 sm:p-5 border-l-4 border-l-emerald-600 dark:border-l-emerald-400">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              {/* Visual Crop Image Thumbnail */}
              <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border border-stone-200/90 dark:border-stone-700 shrink-0 shadow-xs mt-0.5">
                <img
                  src={getCropImageUrl(nextCrop.id)}
                  alt={nextCropLocName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                  <span className="font-montserrat text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Next season action: {nextSeasonSlot.seasonName}
                  </span>
                </div>
                <h3 className="mt-0.5 font-montserrat text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  Recommended next crop: {nextCropLocName}
                </h3>
                <p className="mt-0.5 text-xs text-stone-500 italic dark:text-stone-400">
                  {nextCrop.scientificName} • {nextCrop.family} Family • {nextCrop.growthDurationDays} days maturity
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    {climate ? `${climate.latitude.toFixed(2)}°, ${climate.longitude.toFixed(2)}°` : safeRegion.name}
                  </span>
                  <span>•</span>
                  <span className="capitalize">
                    Soil: {soil?.texture.replace('_', ' ') || safeField.soilTexture || 'loam'} (~{soil?.organicMatterPercent || safeField.soilOrganicMatter || 1.5}% OM)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badge Pill */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
                {nextCrop.waterRequirementMm} mm water
              </span>
              <span className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:text-emerald-400">
                {nextSeasonSlot.soilNitrogenBalanceKg > 0 ? `+${nextSeasonSlot.soilNitrogenBalanceKg} kg N` : `${nextSeasonSlot.soilNitrogenBalanceKg} kg N`}
              </span>
            </div>
          </div>

          {/* Actionable Advice Paragraph with ChaiUI Highlight Phrase */}
          <p className="mt-3 text-xs sm:text-sm text-stone-700 leading-relaxed dark:text-stone-300">
            {immediateAdviceRationale.split('biological nitrogen')[0]}
            <span className="highlight font-montserrat font-medium">biological nitrogen</span>
            {immediateAdviceRationale.split('biological nitrogen')[1] || ''}
          </p>

          {/* Practical Checklist Strip */}
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-stone-200/70 text-xs dark:border-stone-800">
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
              <Clock className="h-4 w-4 text-stone-500 shrink-0" />
              <span>
                <strong>Sowing window:</strong> Optimal start of {nextSeasonSlot.seasonName.split(' (')[0]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
              <Zap className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Urea offset:</strong> Saves ~{Math.max(1, Math.round(nextCrop.nitrogenFixationKgPerHa / 23))} synthetic bags
              </span>
            </div>
            <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
              <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Disease shield:</strong> Breaks cereal pathogen carryover
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Operational Crop Calendar & Multi-Year Succession */}
      <div className="card-chai p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/70 pb-3.5 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-montserrat text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-base">
                {strategy.title}: Schedule & calendar
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              Follow operational sowing windows and 10-day turn-around buffers for maximum soil regeneration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle: 12-Month Calendar vs 3-Year Succession Cards */}
            <div className="inline-flex rounded-xl border border-stone-200/80 bg-stone-100/80 p-1 dark:border-stone-800 dark:bg-stone-900/60">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`rounded-lg px-2.5 py-1 font-montserrat text-xs transition ${
                  viewMode === 'calendar'
                    ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-800 dark:text-stone-100'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 font-medium'
                }`}
              >
                12-Month Calendar
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sequence')}
                className={`rounded-lg px-2.5 py-1 font-montserrat text-xs transition ${
                  viewMode === 'sequence'
                    ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-800 dark:text-stone-100'
                    : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 font-medium'
                }`}
              >
                3-Year Succession
              </button>
            </div>

            <button
              onClick={onOpenCustomBuilder}
              className="btn-asym-mirror inline-flex min-h-[36px] items-center gap-1.5 border border-stone-300 bg-transparent px-3 py-1 font-montserrat text-xs font-semibold text-stone-900 transition hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800"
              title="Design a customized rotation plan in the interactive sandbox"
            >
              <Sprout className="h-3.5 w-3.5 text-stone-700 dark:text-stone-300" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* View Mode Content */}
        {viewMode === 'calendar' ? (
          <CropRotationCalendar
            activeField={safeField}
            strategy={strategy}
            region={safeRegion}
            climate={climate}
            soil={soil}
          />
        ) : (
          /* 6-Season Sequential Grid */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {strategy.seasons.map((slot, idx) => {
              const cropName = CROP_LOCALIZED_NAMES[slot.crop.id]?.en || slot.crop.name;
              const isPulse = slot.crop.family === 'Fabaceae';

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                    idx === 0
                      ? 'border-stone-900 bg-stone-100/80 dark:border-stone-200 dark:bg-stone-900/60 ring-1 ring-stone-900/10'
                      : 'border-stone-200/80 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/40 hover:border-stone-300'
                  }`}
                >
                  {/* Header Season Label */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                      <span className="font-montserrat">{slot.seasonName}</span>
                      <span className="font-mono text-stone-400 text-[10px]">#{idx + 1}</span>
                    </div>

                    {/* Crop Header with Visual Thumbnail */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 shrink-0">
                        <img
                          src={getCropImageUrl(slot.crop.id)}
                          alt={cropName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                          {cropName}
                        </h4>
                        <p className="italic text-[9px] text-stone-500 dark:text-stone-400">
                          {slot.crop.scientificName}
                        </p>
                      </div>
                    </div>

                    {/* Botanical Family & Root Tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span
                        className={`rounded px-1.5 py-0.5 font-montserrat text-[9px] font-semibold ${
                          isPulse
                            ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'border border-stone-200 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        {slot.crop.family}
                      </span>
                      <span className="rounded border border-stone-200 bg-stone-100 px-1.5 py-0.5 font-montserrat text-[9px] text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 capitalize">
                        {slot.crop.rootArchitecture.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Agronomic Invariants */}
                  <div className="mt-3.5 border-t border-stone-200/70 pt-2 text-[11px] space-y-1.5 dark:border-stone-800">
                    {/* Nitrogen Balance */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                        <Zap className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
                        Nitrogen:
                      </span>
                      <span
                        className={`font-montserrat font-bold ${
                          slot.soilNitrogenBalanceKg >= 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {slot.soilNitrogenBalanceKg > 0 ? `+${slot.soilNitrogenBalanceKg}` : slot.soilNitrogenBalanceKg} kg
                      </span>
                    </div>

                    {/* Water Deficit */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                        <Droplets className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                        Water balance:
                      </span>
                      <span
                        className={`font-montserrat font-bold ${
                          slot.waterBalanceMm >= 0 ? 'text-sky-700 dark:text-sky-400' : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {slot.waterBalanceMm} mm
                      </span>
                    </div>

                    {/* Disease Cycle Status */}
                    <div className="flex items-center justify-between pt-0.5 border-t border-stone-200/40 dark:border-stone-800/60">
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">Pest cycle:</span>
                      {slot.pestCycleBroken ? (
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
                          <ShieldCheck className="h-3 w-3" />
                          Broken
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-[10px]">
                          <AlertTriangle className="h-3 w-3" />
                          Repeated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Research-Backed Agronomic Science Breakdown */}
      <div className="card-chai p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-montserrat text-sm font-bold text-stone-900 dark:text-stone-100">
            Agronomic science and NASA satellite verification
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 dark:text-stone-300">
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
            <h4 className="font-montserrat font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              Biological Nitrogen Fixation (BNF)
            </h4>
            <p className="mt-1 leading-relaxed">
              Legumes form symbiotic nodules with <em>Rhizobium</em> bacteria, converting atmospheric N₂ into organic plant nitrogen. Every 23 kg of fixed nitrogen eliminates one 50kg bag of synthetic urea fertilizer.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
            <h4 className="font-montserrat font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              Break-Crop Disease Disruption
            </h4>
            <p className="mt-1 leading-relaxed">
              Continuous cereal monocropping multiplies root-rot fungi (<em>Take-all</em>, <em>Fusarium</em>) and root nematodes. Alternating to non-host Fabaceae or Brassicaceae starves pathogens and breaks the reproduction cycle.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
            <h4 className="font-montserrat font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              Subsoil Bio-Drilling & Aeration
            </h4>
            <p className="mt-1 leading-relaxed">
              Alternating fibrous shallow roots with deep taproots (pigeon pea, mustard) punctures compacted plow pans created by tractor traffic. This expands active root-zone depth and improves rain infiltration.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
            <h4 className="font-montserrat font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              NASA Satellite Hydrology Calibration
            </h4>
            <p className="mt-1 leading-relaxed">
              Water balance calculations use 40+ years of NASA MERRA-2 precipitation observations and FAO-56 crop coefficients (K_c) to ensure irrigation demands do not exceed local aquifer recharge limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineGantt;
