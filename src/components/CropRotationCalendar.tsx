import React, { useState, useMemo } from 'react';
import { RotationStrategy, FarmerFieldProfile, AgroRegion, NasaClimateData, SoilProfile } from '../types';
import { getCropImageUrl } from '../data/cropImages';
import {
  generateCropCalendar,
  formatCalendarDate,
  formatShortDate,
  CalendarCropPhase,
} from '../services/cropCalendarService';
import {
  Calendar,
  Clock,
  Sprout,
  ShieldCheck,
  Droplets,
  Zap,
  ArrowRight,
  MapPin,
  CheckCircle2,
  ChevronRight,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';

interface CropRotationCalendarProps {
  activeField: FarmerFieldProfile;
  strategy: RotationStrategy;
  region: AgroRegion;
  climate?: NasaClimateData;
  soil?: SoilProfile;
  className?: string;
  onNavigateToRotations?: () => void;
}

export const CropRotationCalendar: React.FC<CropRotationCalendarProps> = ({
  activeField,
  strategy,
  region,
  climate,
  soil,
  className = '',
  onNavigateToRotations,
}) => {
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);
  const [selectedPhaseCropId, setSelectedPhaseCropId] = useState<string | null>(null);

  // Generate dynamic calendar schedule
  const calendarSchedule = useMemo(() => {
    return generateCropCalendar(activeField, strategy, region, selectedYearIndex);
  }, [activeField, strategy, region, selectedYearIndex]);

  const { months, phases, nextUpcomingPhase } = calendarSchedule;

  // Selected phase details (defaults to next upcoming crop or standing crop)
  const activeDetailPhase = useMemo(() => {
    if (selectedPhaseCropId) {
      const found = phases.find((p) => p.cropId === selectedPhaseCropId);
      if (found) return found;
    }
    return nextUpcomingPhase || phases[0];
  }, [selectedPhaseCropId, phases, nextUpcomingPhase]);

  // Overall Year Date Range
  const yearStartLabel = months && months.length > 0 ? `${months[0].monthName} ${months[0].year}` : '';
  const yearEndLabel = months && months.length > 11 ? `${months[11].monthName} ${months[11].year}` : '';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* =========================================================================
          1. HEADER & YEAR SELECTOR
         ========================================================================= */}
      <div className="card-chai p-3.5 sm:p-5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200/70 pb-3 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <h2 className="font-montserrat text-xs sm:text-base font-bold text-stone-900 dark:text-stone-100">
                Operational Crop Schedule: {activeField.farmName}
              </h2>
            </div>
            <p className="mt-0.5 text-[11px] sm:text-xs text-stone-600 dark:text-stone-400">
              Chronological sowing, land preparation, and harvest windows calibrated to{' '}
              <span className="highlight">NASA climatology</span>.
            </p>
          </div>

          {/* 3-Year Segmented Selector */}
          <div className="inline-flex rounded-xl border border-stone-200/80 bg-stone-100/80 p-1 dark:border-stone-800 dark:bg-stone-900/60 self-start sm:self-auto shrink-0">
            {[0, 1, 2].map((idx) => {
              const isActive = selectedYearIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedYearIndex(idx);
                    setSelectedPhaseCropId(null);
                  }}
                  className={`rounded-lg px-2.5 py-1 font-montserrat text-xs transition active:scale-95 ${
                    isActive
                      ? 'bg-white font-bold text-stone-900 shadow-xs dark:bg-stone-800 dark:text-stone-100'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 font-medium'
                  }`}
                >
                  Year {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Annual Cycle Subheader */}
        <div className="mt-3 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-1.5 font-montserrat font-semibold text-stone-900 dark:text-stone-100">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>
              Year {selectedYearIndex + 1} Cycle: {yearStartLabel} – {yearEndLabel}
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">
            {phases.length} Seasonal Phases
          </span>
        </div>

        {/* =========================================================================
            2. CHRONOLOGICAL CROP ROTATION OVERVIEW (Proper Date Progression)
           ========================================================================= */}
        <div className="mt-3 space-y-2.5">
          {phases.map((phase, pIdx) => {
            const isSelected = activeDetailPhase.cropId === phase.cropId;
            const isStanding = phase.isStandingCrop;
            const cropImg = getCropImageUrl(phase.cropId);
            const isLegume = phase.family.toLowerCase().includes('fabaceae') || phase.name.toLowerCase().includes('pea') || phase.name.toLowerCase().includes('gram') || phase.name.toLowerCase().includes('bean');

            return (
              <div key={phase.cropId} className="space-y-2">
                {/* 10-day land preparation buffer between crops */}
                {phase.prepStartDate && phase.prepEndDate && (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-stone-300 bg-stone-50/90 px-3 py-2 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
                    <Clock className="h-3.5 w-3.5 text-stone-500 shrink-0" />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        10-Day Land Prep & Rauni Buffer:
                      </span>
                      <span className="font-mono text-stone-600 dark:text-stone-400">
                        {formatCalendarDate(phase.prepStartDate)} to {formatCalendarDate(phase.prepEndDate)}
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-500 dark:text-stone-400">
                        Residue management & pre-irrigation soaking
                      </span>
                    </div>
                  </div>
                )}

                {/* Main Crop Phase Card */}
                <button
                  type="button"
                  onClick={() => setSelectedPhaseCropId(phase.cropId)}
                  className={`w-full text-start rounded-xl border p-3 sm:p-4 transition-all active:scale-99 shadow-xs ${
                    isSelected
                      ? 'border-stone-900 bg-white ring-2 ring-stone-900 dark:border-stone-100 dark:bg-stone-900 dark:ring-stone-100'
                      : isStanding
                      ? 'border-amber-700/60 bg-amber-50/60 hover:border-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30'
                      : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-2.5 mb-2.5 dark:border-stone-800/80">
                    {/* Phase Identity & Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-stone-400 dark:text-stone-500">
                        Phase {pIdx + 1}
                      </span>
                      <span className="text-stone-300 dark:text-stone-700">•</span>
                      {isStanding ? (
                        <span className="rounded bg-amber-200/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                          Active In Field
                        </span>
                      ) : isLegume ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Recommended Legume Rotation
                        </span>
                      ) : (
                        <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                          Planned Rotation
                        </span>
                      )}
                    </div>

                    {/* Sowing to Harvest Date Range */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
                      <Calendar className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="font-montserrat">
                        {formatCalendarDate(phase.sowingStartDate)} to {formatCalendarDate(phase.harvestEndDate)}
                      </span>
                      <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                        ({phase.durationDays} days)
                      </span>
                    </div>
                  </div>

                  {/* Crop Content Body */}
                  <div className="flex items-center gap-3">
                    <img
                      src={cropImg}
                      alt={phase.name}
                      className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                      loading="lazy"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <h3 className="font-montserrat text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                          {phase.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 shrink-0">
                          <span>{isSelected ? 'Selected' : 'Tap for details'}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                        {phase.scientificName} • {phase.family}
                      </p>

                      {/* Key Agronomic Dates & Water Grid */}
                      <div className="mt-2 grid grid-cols-2 xs:grid-cols-3 gap-2 text-[11px] border-t border-stone-100 pt-2 dark:border-stone-800/60">
                        <div>
                          <span className="text-[10px] text-stone-400 block">Sowing Window</span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                            {formatShortDate(phase.sowingStartDate)} – {formatShortDate(phase.sowingEndDate)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400 block">Harvest Window</span>
                          <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                            {formatShortDate(phase.harvestStartDate)} – {formatShortDate(phase.harvestEndDate)}
                          </span>
                        </div>

                        <div className="col-span-2 xs:col-span-1">
                          <span className="text-[10px] text-stone-400 block">Water Demand</span>
                          <span className="font-semibold text-sky-700 dark:text-sky-400 block">
                            {phase.waterNeedMm || 280} mm total
                          </span>
                        </div>
                      </div>

                      {/* Standing Crop Progress Bar if Active */}
                      {isStanding && phase.percentCompleted !== undefined && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800/60">
                          <div className="flex items-center justify-between text-[10px] text-stone-600 dark:text-stone-400 mb-1">
                            <span>Field progress: Day {Math.round((phase.durationDays * phase.percentCompleted) / 100)} of {phase.durationDays}</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{phase.percentCompleted}% to harvest</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden dark:bg-stone-800">
                            <div
                              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500"
                              style={{ width: `${phase.percentCompleted}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          3. OPERATIONAL DATES & FIELD ACTIVITIES FOR SELECTED CROP
         ========================================================================= */}
      <div className="card-chai p-3.5 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-stone-200/70 pb-3 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-montserrat text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Operational Field Activities: {activeDetailPhase.name}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {activeDetailPhase.scientificName} • {activeDetailPhase.family} • {activeDetailPhase.durationDays} days field duration
              </p>
            </div>
          </div>

          <span className="rounded-lg border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs font-semibold text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 self-start sm:self-auto">
            {activeDetailPhase.isStandingCrop ? 'Standing in Field' : 'Planned Rotation'}
          </span>
        </div>

        {/* 4 Exact Operational Milestone Cards Grid */}
        <div className="mt-3.5 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Milestone 1: Land Prep */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
              1. Land Preparation
            </span>
            <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 block mt-1">
              {activeDetailPhase.prepStartDate
                ? `${formatShortDate(activeDetailPhase.prepStartDate)} – ${formatShortDate(activeDetailPhase.prepEndDate)}`
                : 'Seedbed ready'}
            </span>
            <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
              {activeDetailPhase.prepDays ? `${activeDetailPhase.prepDays}-day buffer for residue tillage & rauni.` : 'Basal tilth complete.'}
            </p>
          </div>

          {/* Milestone 2: Sowing Window */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              2. Sowing Window
            </span>
            <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 block mt-1">
              {formatCalendarDate(activeDetailPhase.sowingStartDate)} – {formatShortDate(activeDetailPhase.sowingEndDate)}
            </span>
            <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
              Optimal soil temperature for high germination rate.
            </p>
          </div>

          {/* Milestone 3: Peak Water */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 block">
              3. Water Need
            </span>
            <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 block mt-1">
              {activeDetailPhase.waterNeedMm || 280} mm total
            </span>
            <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
              Root-zone irrigation calibrated with NASA precipitation telemetry.
            </p>
          </div>

          {/* Milestone 4: Harvest Window */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              4. Harvest Window
            </span>
            <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 block mt-1">
              {formatCalendarDate(activeDetailPhase.harvestStartDate)} – {formatShortDate(activeDetailPhase.harvestEndDate)}
            </span>
            <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400 leading-snug">
              Timely harvest enables smooth turnaround for the next rotation.
            </p>
          </div>
        </div>

        {/* Practical Agronomic Action Checklist */}
        <div className="mt-3.5 rounded-xl border border-stone-200/80 bg-white p-3 dark:border-stone-800 dark:bg-stone-900/60">
          <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 block mb-1.5">
            Key Operational Steps for {activeDetailPhase.name}:
          </span>
          <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
            {activeDetailPhase.operationalNotes.map((note, nIdx) => (
              <div key={nIdx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Satellite Climate Grounding Callout */}
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>NASA Climate Safety Window:</strong> {activeDetailPhase.climateSafetyWindow}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CropRotationCalendar;
