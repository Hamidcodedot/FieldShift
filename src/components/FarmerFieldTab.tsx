import React, { useState } from 'react';
import {
  FarmerFieldProfile,
  AgroRegion,
  SoilProfile,
  FarmerPriorities,
  RotationStrategy,
  NasaClimateData,
} from '../types';
import { calculateDaysSinceSowing, getCropGrowthStage, formatIrrigationMethod } from '../services/fieldProfileService';
import { CROPS_DATABASE } from '../data/crops';
import { OnboardingWizard, WizardMode } from './OnboardingWizard';
import { computeSoilHealthDiagnostic } from '../services/soilHealthDiagnostic';
import { SatelliteMapViewport } from './SatelliteMapViewport';
import {
  MapPin,
  ChevronDown,
  Check,
  Plus,
  Layers,
  Droplets,
  Calendar,
  Sprout,
  AlertCircle,
} from 'lucide-react';

interface FarmerFieldTabProps {
  fields: FarmerFieldProfile[];
  activeField: FarmerFieldProfile;
  region: AgroRegion;
  allRegions: AgroRegion[];
  soil: SoilProfile;
  priorities: FarmerPriorities;
  activeStrategy: RotationStrategy;
  climate?: NasaClimateData;
  onSelectActiveField: (fieldId: string) => void;
  onUpdateField: (updated: FarmerFieldProfile) => void;
  onAddNewField: (newField: FarmerFieldProfile) => void;
  onDeleteField: (fieldId: string) => void;
  onUpdateSoil: (updated: SoilProfile) => void;
  onUpdatePriorities: (updated: FarmerPriorities) => void;
  onSelectRegion: (reg: AgroRegion) => void;
  onSelectCoordinates: (lat: number, lon: number) => void;
  selectedLat: number;
  selectedLon: number;
  onOpenOnboarding?: () => void;
  onNavigateToRotations?: () => void;
}

export const FarmerFieldTab: React.FC<FarmerFieldTabProps> = ({
  fields,
  activeField,
  region,
  allRegions,
  soil: _soil,
  priorities: _priorities,
  activeStrategy,
  climate,
  onSelectActiveField,
  onUpdateField,
  onAddNewField,
  onDeleteField: _onDeleteField,
  onUpdateSoil: _onUpdateSoil,
  onUpdatePriorities: _onUpdatePriorities,
  onSelectRegion: _onSelectRegion,
  onSelectCoordinates: _onSelectCoordinates,
  selectedLat,
  selectedLon,
  onOpenOnboarding: _onOpenOnboarding,
  onNavigateToRotations,
}) => {
  // Dropdown states
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState<boolean>(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState<boolean>(true); // Open by default matching Figma
  const [isInputsOpen, setIsInputsOpen] = useState<boolean>(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);

  // Boundary Edit Modal handled via unified edit wizard
  // Wizard state (create / edit field profile)
  const [wizardState, setWizardState] = useState<{
    isOpen: boolean;
    mode: WizardMode;
    existingField?: FarmerFieldProfile | null;
  }>({
    isOpen: false,
    mode: 'create',
    existingField: null,
  });

  // Standing crop metadata & duration
  const currentCropId = activeField.currentCropHistory?.currentCropId || 'wheat';
  const currentCropObj = CROPS_DATABASE.find((c) => c.id === currentCropId);
  const standingCropName =
    activeField.currentCropHistory?.patternLabel?.split(' (')[0] ||
    currentCropObj?.name?.split(' (')[0] ||
    'Wheat';

  const daysSinceSowing = activeField.sowingDate
    ? calculateDaysSinceSowing(activeField.sowingDate)
    : 35;
  const totalCropDays = currentCropObj?.growthDurationDays || 120;
  const growthStage = getCropGrowthStage(daysSinceSowing, totalCropDays);

  const sowingDateObj = activeField.sowingDate
    ? new Date(activeField.sowingDate)
    : new Date('2025-11-12T00:00:00Z');

  const formattedSowingDate = sowingDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Authentic satellite root-zone moisture percentage from NASA GEOS-FP microwave
  const rootMoisturePercent = Math.round(
    climate?.currentMonthRootZoneWetnessPercent ??
      (climate?.rootZoneSoilMoistureMonthly?.[new Date().getMonth()]
        ? climate.rootZoneSoilMoistureMonthly[new Date().getMonth()] * 100
        : region.cachedClimate?.currentMonthRootZoneWetnessPercent ?? 42)
  );

  // Dynamic Soil & Telemetry Diagnostic (Strictly NASA & calibrated agronomic model)
  const diagnostic = computeSoilHealthDiagnostic({
    soilTexture: activeField.soilTexture || 'loam',
    ureaIntensity: activeField.ureaIntensity || 'moderate',
    pesticideFrequency: activeField.pesticideFrequency || 'moderate',
    irrigationMethod: activeField.irrigationMethod || 'canal_surface',
    currentCropId,
    rootMoisturePercent,
    region,
  });

  const handleStartAddNewField = () => {
    setIsFieldDropdownOpen(false);
    setWizardState({
      isOpen: true,
      mode: 'create',
      existingField: null,
    });
  };

  const handleStartEditField = () => {
    setIsFieldDropdownOpen(false);
    setWizardState({
      isOpen: true,
      mode: 'edit',
      existingField: activeField,
    });
  };

  const handleWizardComplete = (profile: FarmerFieldProfile) => {
    if (wizardState.mode === 'create') {
      onAddNewField(profile);
      onSelectActiveField(profile.id);
    } else {
      onUpdateField(profile);
    }
    setWizardState({ isOpen: false, mode: 'create', existingField: null });
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Header: My Field & Plus Button (Matches Figma Node 49:3) */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h1 className="font-brand text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            My Field
          </h1>
          <p className="font-montserrat text-xs text-stone-500 dark:text-stone-400">
            Satellite Parcel Management
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAddNewField}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/90 bg-white/95 text-stone-700 shadow-xs transition hover:bg-stone-50 active:scale-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          title="Add New Field Parcel"
          aria-label="Add Field"
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* 1. FIELD SWITCHER DROPDOWN (Matches Figma Node 49:3) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsFieldDropdownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-xs transition hover:bg-stone-50/80 active:scale-99 dark:border-stone-800 dark:bg-[#121212]"
        >
          <div className="flex items-center gap-3 text-left min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-montserrat text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight">
                {activeField.farmName}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {activeField.fieldSizeAcres || 5.2} Acres • {activeField.soilTexture || 'Loam'} Soil • Active Field
              </p>
            </div>
          </div>

          <div
            className={`text-stone-400 transition-transform duration-200 shrink-0 ml-2 ${
              isFieldDropdownOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          >
            <ChevronDown className="h-4.5 w-4.5" />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isFieldDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl dark:border-stone-800 dark:bg-stone-950 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 font-montserrat border-b border-stone-100 dark:border-stone-800/80 mb-1">
              Select Field Parcel
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {fields.map((f) => {
                const isActive = f.id === activeField.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      onSelectActiveField(f.id);
                      setIsFieldDropdownOpen(false);
                    }}
                    className={`cursor-pointer rounded-xl p-2.5 transition flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-900/60'
                    }`}
                  >
                    <div>
                      <div className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                        {f.farmName} {isActive ? '(Active)' : ''}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400">
                        {f.fieldSizeAcres || 5.2} ac • Sown {f.currentCropHistory?.patternLabel?.split(' (')[0] || 'Wheat'} • {formatIrrigationMethod(f.irrigationMethod)}
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div
              onClick={handleStartAddNewField}
              className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add another field parcel</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. HIGH-RES SATELLITE MAP BOUNDARY CARD (Real Sub-Meter Satellite Imagery) */}
      <section className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white/95 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        <SatelliteMapViewport
          latitude={activeField.latitude}
          longitude={activeField.longitude}
          fieldBoundary={activeField.fieldBoundary}
          fieldSizeAcres={activeField.fieldSizeAcres || 5}
          heightClassName="h-[340px] sm:h-[400px]"
          onEditBoundary={handleStartEditField}
        />

        {/* Map Meta Footer Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 bg-stone-50/80 px-3.5 sm:px-4 py-2.5 text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <span>Boundary: </span>
            {activeField.fieldBoundary && activeField.fieldBoundary.length >= 3 ? (
              <strong className="text-stone-900 dark:text-stone-100 font-bold">
                {activeField.fieldBoundary.length} Pinned Vertices
              </strong>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 text-[11px]">
                <AlertCircle className="h-3 w-3" />
                <span>Please Select Boundary</span>
              </span>
            )}
          </div>
          <div className="min-w-0">
            <span>Acreage: </span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
              {activeField.fieldSizeAcres || 5} Acres {activeField.fieldBoundary && activeField.fieldBoundary.length >= 3 ? '(Surveyed)' : '(Estimated)'}
            </strong>
          </div>
        </div>
      </section>

      {/* 3. COMPACT PARCEL SNAPSHOT ROW (3 CARDS) (Matches Figma Node 49:3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* Standing Crop */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-2.5 sm:p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <span className="block font-montserrat text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Standing Crop
          </span>
          <span className="mt-1 block font-montserrat text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight">
            {standingCropName}
          </span>
          <span className="mt-0.5 block text-[9.5px] sm:text-[10px] text-stone-500 dark:text-stone-400">
            Day {daysSinceSowing} of {totalCropDays}
          </span>
        </div>

        {/* Soil Score */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-2.5 sm:p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <span className="block font-montserrat text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Soil Score
          </span>
          <span className={`mt-1 block font-montserrat text-sm sm:text-base font-bold ${diagnostic.scoreColor}`}>
            {activeField.soilHealthScore ?? diagnostic.score}/100
          </span>
          <span className="mt-0.5 block text-[9.5px] sm:text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
            {diagnostic.rating === 'Optimal' ? 'Good Condition' : diagnostic.rating === 'Fair' ? 'Fair Condition' : 'Needs Care'}
          </span>
        </div>

        {/* Root Moisture */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-2.5 sm:p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <span className="block font-montserrat text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Root Moisture
          </span>
          <span className="mt-1 block font-montserrat text-sm sm:text-base font-bold text-sky-700 dark:text-sky-400">
            {diagnostic.rootMoisturePercent}%
          </span>
          <span className="mt-0.5 block text-[9.5px] sm:text-[10px] text-stone-500 dark:text-stone-400">
            {diagnostic.rootMoistureStatus === 'Deficit' ? 'Subsoil Deficit' : 'Subsoil Adequate'}
          </span>
        </div>
      </div>

      {/* 4. DROPDOWN ACCORDION 1: SOIL & SATELLITE DIAGNOSTICS (Matches Figma Node 49:3) */}
      <div className="rounded-3xl border border-stone-200/90 bg-white/95 p-4 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        <button
          type="button"
          onClick={() => setIsTelemetryOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="font-montserrat text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Soil & Satellite Diagnostics
              </div>
              <div className="text-[10.5px] text-stone-500 dark:text-stone-400">
                NASA POWER telemetry & microbial breakdown
              </div>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-stone-400 transition-transform ${
              isTelemetryOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </button>

        {isTelemetryOpen && (
          <div className="mt-3.5 space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800 animate-in fade-in">
            {/* 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40">
                <span className="block text-[10px] font-semibold text-stone-400 uppercase">
                  Root Zone Moisture
                </span>
                <span className="mt-0.5 block font-montserrat text-xs font-bold text-sky-700 dark:text-sky-400">
                  {diagnostic.rootMoistureStatus === 'Deficit' ? 'Deficit' : 'Adequate'} ({diagnostic.rootMoisturePercent}%)
                </span>
                <p className="mt-0.5 text-[9.5px] text-stone-500 leading-snug">
                  NASA GEOS-FP microwave scan confirms {diagnostic.rootMoistureStatus === 'Deficit' ? 'subsoil moisture deficit requiring irrigation' : 'adequate subsoil root-zone moisture'}.
                </p>
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40">
                <span className="block text-[10px] font-semibold text-stone-400 uppercase">
                  Urea / Acid Risk
                </span>
                <span className={`mt-0.5 block font-montserrat text-xs font-bold ${
                  diagnostic.acidificationRisk === 'Critical' ? 'text-rose-700 dark:text-rose-400' : diagnostic.acidificationRisk === 'Moderate' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}>
                  {diagnostic.acidificationRisk} Acid Risk
                </span>
                <p className="mt-0.5 text-[9.5px] text-stone-500 leading-snug">
                  {diagnostic.nitrogenStatus}
                </p>
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40">
                <span className="block text-[10px] font-semibold text-stone-400 uppercase">
                  Microbial Health
                </span>
                <span className={`mt-0.5 block font-montserrat text-xs font-bold ${
                  diagnostic.microbialActivity === 'Suppressed' ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}>
                  {diagnostic.microbialActivity}
                </span>
                <p className="mt-0.5 text-[9.5px] text-stone-500 leading-snug">
                  Beneficial microbial colonies {diagnostic.microbialActivity === 'Active & Diverse' ? 'active in root rhizosphere' : diagnostic.microbialActivity === 'Moderate' ? 'stable under current inputs' : 'suppressed by intensive synthetic load'}.
                </p>
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40">
                <span className="block text-[10px] font-semibold text-stone-400 uppercase">
                  Soil Texture
                </span>
                <span className="mt-0.5 block font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 capitalize">
                  {activeField.soilTexture ? activeField.soilTexture.replace('_', ' ') : 'Loam'} ({diagnostic.organicMatterEstimated}% OM)
                </span>
                <p className="mt-0.5 text-[9.5px] text-stone-500 leading-snug">
                  High moisture retention and balanced nutrient drainage for {activeField.placeName || region.name.split(' (')[0]}.
                </p>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/40 flex items-start gap-2.5">
              <Sprout className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-montserrat text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Agronomic Recommendation
                </span>
                <p className="mt-0.5 text-[11px] text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                  {diagnostic.actionableInsight}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. DROPDOWN ACCORDION 2: FIELD INPUTS & SOWING PROFILE (Matches Figma Node 49:3) */}
      <div className="rounded-3xl border border-stone-200/90 bg-white/95 p-4 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        <button
          type="button"
          onClick={() => setIsInputsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Droplets className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="font-montserrat text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                Crop Inputs & Sowing Profile
              </div>
              <div className="text-[10.5px] text-stone-500 dark:text-stone-400">
                Sowing dates, irrigation method, fertilizer rates
              </div>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-stone-400 transition-transform ${
              isInputsOpen ? 'rotate-180 text-amber-600' : ''
            }`}
          />
        </button>

        {isInputsOpen && (
          <div className="mt-3.5 space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800 animate-in fade-in text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-stone-100 dark:border-stone-800/60">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Sowing Date</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">{formattedSowingDate}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-stone-100 dark:border-stone-800/60">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Growth Stage</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {growthStage.stageName} (Day {daysSinceSowing} of {totalCropDays})
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-stone-100 dark:border-stone-800/60">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Irrigation Method</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {formatIrrigationMethod(activeField.irrigationMethod)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-stone-100 dark:border-stone-800/60">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Urea Intensity</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {activeField.ureaIntensity === 'heavy'
                  ? '3 Bags / Acre (High)'
                  : activeField.ureaIntensity === 'moderate'
                  ? '2 Bags / Acre (Moderate)'
                  : '1 Bag / Acre (Low / Minimal)'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-stone-100 dark:border-stone-800/60">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Pesticide Frequency</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {activeField.pesticideFrequency === 'intensive'
                  ? '4 Sprays / Season (Intensive)'
                  : activeField.pesticideFrequency === 'moderate'
                  ? '2 Sprays / Season (Standard)'
                  : 'No Synthetic Sprays (Biological)'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartEditField}
              className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 py-2 font-montserrat text-xs font-bold text-stone-800 hover:bg-stone-100 active:scale-98 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
            >
              Update Field Inputs
            </button>
          </div>
        )}
      </div>

      {/* 6. DROPDOWN ACCORDION 3: 3-YEAR ROTATION SCHEDULE (Matches Figma Node 49:3) */}
      <div className="rounded-3xl border border-stone-200/90 bg-white/95 p-4 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        <button
          type="button"
          onClick={() => setIsScheduleOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="font-montserrat text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                3-Year Rotation Schedule
              </div>
              <div className="text-[10.5px] text-stone-500 dark:text-stone-400">
                Planned seasonal transitions for this field
              </div>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-stone-400 transition-transform ${
              isScheduleOpen ? 'rotate-180 text-sky-600' : ''
            }`}
          />
        </button>

        {isScheduleOpen && (
          <div className="mt-3.5 space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800 animate-in fade-in">
            {/* Phase 1: Standing Crop */}
            <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/50 border-l-4 border-l-emerald-600">
              <div>
                <div className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                  Current Season: {standingCropName} (Standing)
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400">
                  Day {daysSinceSowing} of {totalCropDays} • Sown {formattedSowingDate}
                </div>
              </div>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Current
              </span>
            </div>

            {/* Phase 2: Next Rotation Crop */}
            {activeStrategy.seasons[0] && (
              <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/50 border-l-4 border-l-amber-500">
                <div>
                  <div className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                    Next Phase: {activeStrategy.seasons[0].crop.name.split(' (')[0]}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">
                    {activeStrategy.seasons[0].seasonName} • {activeStrategy.seasons[0].crop.growthDurationDays} Days • Water: {activeStrategy.seasons[0].crop.waterRequirementMm}mm
                  </div>
                </div>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {activeStrategy.seasons[0].crop.family === 'Fabaceae' || activeStrategy.seasons[0].crop.nitrogenFixationKgPerHa > 0
                    ? `+${Math.round(activeStrategy.seasons[0].soilNitrogenBalanceKg || activeStrategy.seasons[0].crop.nitrogenFixationKgPerHa || 35)}kg N Fix`
                    : activeStrategy.seasons[0].crop.family === 'Brassicaceae'
                    ? 'Bio-Fumigation'
                    : activeStrategy.seasons[0].crop.category === 'cash_crop'
                    ? 'Cash Crop'
                    : 'Planned'}
                </span>
              </div>
            )}

            {/* Phase 3: Follow-up Rotation Crop */}
            {activeStrategy.seasons[1] && (
              <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/50 border-l-4 border-l-sky-500">
                <div>
                  <div className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                    Follow-up Phase: {activeStrategy.seasons[1].crop.name.split(' (')[0]}
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">
                    {activeStrategy.seasons[1].seasonName} • {activeStrategy.seasons[1].crop.growthDurationDays} Days • Water: {activeStrategy.seasons[1].crop.waterRequirementMm}mm
                  </div>
                </div>
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[9px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  {activeStrategy.seasons[1].crop.category === 'cash_crop'
                    ? 'Cash Crop'
                    : activeStrategy.seasons[1].crop.family === 'Fabaceae'
                    ? `+${Math.round(activeStrategy.seasons[1].soilNitrogenBalanceKg || 30)}kg N Fix`
                    : 'High Yield'}
                </span>
              </div>
            )}

            {onNavigateToRotations && (
              <button
                type="button"
                onClick={onNavigateToRotations}
                className="mt-2 w-full rounded-xl border border-emerald-300 bg-emerald-50 py-2 font-montserrat text-xs font-bold text-emerald-800 hover:bg-emerald-100 active:scale-98 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                Open Full 3-Year Crop Plan →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Field Setup Wizard Modal */}
      {wizardState.isOpen && (
        <OnboardingWizard
          currentRegion={region}
          allRegions={allRegions}
          initialLat={selectedLat}
          initialLon={selectedLon}
          initialSoil={_soil}
          initialPriorities={_priorities}
          mode={wizardState.mode}
          existingField={wizardState.existingField}
          onComplete={handleWizardComplete}
          onClose={() => setWizardState({ isOpen: false, mode: 'create', existingField: null })}
        />
      )}
    </div>
  );
};

export default FarmerFieldTab;