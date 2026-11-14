import React, { useState, useEffect } from 'react';
import { AgroRegion, NasaClimateData, RotationStrategy, FarmerFieldProfile } from '../types';
import { CROP_LOCALIZED_NAMES } from '../data/translations';
import { AppTab } from './BottomNavigation';
import { stopSpeaking } from '../services/voiceAssistant';
import { calculateDaysSinceSowing, getCropGrowthStage } from '../services/fieldProfileService';
import { CROPS_DATABASE } from '../data/crops';
import { fetchField5DayWeather, Field5DayWeather } from '../services/weatherService';
import { SatelliteMapViewport } from './SatelliteMapViewport';
import { getCropThemeConfig } from './CropIcon';
import { NasaLogo } from './NasaLogo';
import { EVALUATION_SCENARIOS } from '../data/evaluationScenarios';
import {
  MapPin,
  ChevronDown,
  Check,
  Plus,
  Droplets,
  Sun,
  ArrowRight,
  Bot,
  Zap,
  TrendingUp,
  ShieldCheck,
  Navigation,
  Sparkles,
} from 'lucide-react';

interface FarmerHomeTabProps {
  fields: FarmerFieldProfile[];
  activeField: FarmerFieldProfile;
  onSelectActiveField: (fieldId: string) => void;
  onAddNewField?: () => void;
  region: AgroRegion;
  climate: NasaClimateData;
  activeStrategy: RotationStrategy;
  onNavigateTab: (tab: AppTab) => void;
  onOpenChatbot?: () => void;
  onOpenOnboarding?: () => void;
  onQuickGpsSetup?: () => void;
  isQuickLocating?: boolean;
  onLoadDemoFarm?: (scenarioId?: string) => void;
  onRefreshSatelliteData?: () => void;
  isRefreshingSatellite?: boolean;
}

export const FarmerHomeTab: React.FC<FarmerHomeTabProps> = ({
  fields,
  activeField,
  onSelectActiveField,
  onAddNewField,
  region: _region,
  climate,
  activeStrategy,
  onNavigateTab,
  onOpenChatbot,
  onOpenOnboarding,
  onQuickGpsSetup,
  isQuickLocating = false,
  onLoadDemoFarm,
  onRefreshSatelliteData,
  isRefreshingSatellite = false,
}) => {
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [weather, setWeather] = useState<Field5DayWeather | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  // Cancel any active speech if user navigates away or active field changes
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [activeField.id]);

  // Load real meteorological data for this parcel
  useEffect(() => {
    let isCancelled = false;
    if (activeField.latitude && activeField.longitude) {
      fetchField5DayWeather(activeField.latitude, activeField.longitude)
        .then((data) => {
          if (!isCancelled) setWeather(data);
        })
        .catch((err) => {
          console.warn('Failed to load weather for parcel:', err);
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [activeField.latitude, activeField.longitude]);

  const ureaBagsSaved = Math.max(0, Math.round(activeStrategy.total3YearNitrogenNetKgPerHa / 23));
  const fieldDisplayName = activeField.farmName || 'My Field';
  const fieldAcres = activeField.fieldSizeAcres || 5;

  // Sowing Date & Stage Calculations
  const daysSinceSowing = calculateDaysSinceSowing(activeField.sowingDate);
  const currentCropObj = CROPS_DATABASE.find(
    (c) => c.id === activeField.currentCropHistory?.currentCropId
  );
  const standingCropName =
    activeField.currentCropHistory?.patternLabel?.split(' (')[0] ||
    currentCropObj?.name ||
    'Wheat';
  const totalCropDays = currentCropObj?.growthDurationDays || 120;
  const growthStage = getCropGrowthStage(daysSinceSowing, totalCropDays);

  const formattedSowingDate = activeField.sowingDate
    ? new Date(activeField.sowingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Nov 12';

  // Authentic satellite root-zone moisture percentage from NASA GEOS-FP microwave
  const rootMoisturePercent = Math.round(
    climate.currentMonthRootZoneWetnessPercent ??
      (climate.rootZoneSoilMoistureMonthly?.[new Date().getMonth()]
        ? climate.rootZoneSoilMoistureMonthly[new Date().getMonth()] * 100
        : 42)
  );
  const isMoistureAdequate = rootMoisturePercent >= 35;

  // Authentic field temperature from weather or NASA climatology
  const fieldTemp =
    weather?.current.temperatureC ??
    Math.round(climate.currentMonthTempC ?? climate.temperatureMonthlyMeanC?.[new Date().getMonth()] ?? 28);
  const fieldCondition = weather?.current.conditionLabel ?? 'Clear';

  // Next Crop Advisory (Dynamic based on active rotation strategy)
  const nextSeasonSlot = activeStrategy.seasons[0];
  const nextCrop = nextSeasonSlot?.crop;
  const nextCropLocName = nextCrop
    ? CROP_LOCALIZED_NAMES[nextCrop.id]?.en || nextCrop.name.split(' (')[0]
    : 'Chickpea';
  const isNextLegume = nextCrop?.family === 'Fabaceae' || (nextSeasonSlot?.soilNitrogenBalanceKg ?? 0) > 0;
  const nextNFixKgHa = Math.round(nextSeasonSlot?.soilNitrogenBalanceKg ?? nextCrop?.nitrogenFixationKgPerHa ?? 38);
  const nextUreaBagsParcel = Math.max(1, Math.round((nextNFixKgHa * (fieldAcres / 2.471)) / 23));

  const standingCropTheme = getCropThemeConfig(
    currentCropObj?.id || activeField.currentCropHistory?.currentCropId || 'wheat',
    currentCropObj?.family,
    currentCropObj?.category,
    'h-6 w-6'
  );

  const nextCropTheme = getCropThemeConfig(
    nextCrop?.id,
    nextCrop?.family,
    nextCrop?.category,
    'h-5 w-5'
  );

  // Unconfigured field state (fallback)
  if (!activeField.isConfigured && !activeField.hasCompletedOnboarding) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-6">
        <div className="rounded-3xl border border-amber-300 bg-white p-6 text-center shadow-lg dark:border-amber-900/60 dark:bg-stone-900">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <Navigation className="h-6 w-6" />
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Setup Required
          </span>
          <h2 className="mt-3 font-montserrat text-lg font-bold text-stone-900 dark:text-stone-100">
            Connect your farm parcel
          </h2>
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            Calibrate NASA Sentinel-2 satellite passes, soil root-zone water balance, and crop schedules to your exact coordinates.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="btn-asym flex min-h-[44px] items-center justify-center gap-2 bg-stone-900 px-4 py-2.5 font-montserrat text-xs font-semibold text-white shadow-md transition hover:bg-stone-800 active:scale-95 dark:bg-white dark:text-stone-900"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch Field Setup Wizard</span>
              </button>
            )}

            {onQuickGpsSetup && (
              <button
                type="button"
                onClick={onQuickGpsSetup}
                disabled={isQuickLocating}
                className="btn-asym-mirror flex min-h-[44px] items-center justify-center gap-2 border border-stone-300 bg-white px-4 py-2.5 font-montserrat text-xs font-medium text-stone-800 transition hover:bg-stone-50 active:scale-95 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
              >
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>{isQuickLocating ? 'Detecting GPS...' : 'Use Current GPS Location'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Judge Evaluation Mode Strip */}
      {activeField.isEvaluationMode && (
        <div className="rounded-2xl border border-blue-200/90 bg-blue-50/85 px-3 py-2 space-y-1.5 dark:border-blue-900/60 dark:bg-blue-950/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <NasaLogo className="h-4 w-4" />
              <span className="font-montserrat text-[11px] font-bold text-blue-950 dark:text-blue-200 truncate">
                Evaluation Mode • {activeField.evaluationScenarioLabel || 'Demo'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {onLoadDemoFarm && (
                <select
                  aria-label="Switch Evaluation Scenario"
                  value={
                    EVALUATION_SCENARIOS.find(
                      (s) => s.profile.evaluationScenarioLabel === activeField.evaluationScenarioLabel
                    )?.id || EVALUATION_SCENARIOS[0].id
                  }
                  onChange={(e) => onLoadDemoFarm(e.target.value)}
                  className="rounded-lg border border-blue-300/80 bg-white px-2 py-1 font-montserrat text-[10px] font-semibold text-blue-950 outline-none dark:border-blue-800 dark:bg-stone-900 dark:text-blue-200"
                >
                  {EVALUATION_SCENARIOS.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.title}
                    </option>
                  ))}
                </select>
              )}
              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="rounded-lg bg-blue-900 px-2.5 py-1 font-montserrat text-[10px] font-bold text-white transition hover:bg-blue-800 dark:bg-blue-700"
                >
                  Real Setup
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] leading-snug text-blue-900/80 dark:text-blue-200/80">
            <strong>Demo Field &amp; Crop Selection:</strong> Parcel boundary, acreage, and standing crop are curated demo samples over real farmland. Climate, weather, and root-zone moisture are live NASA Earth observations.
          </p>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-full border border-stone-900/10 bg-stone-900/90 px-4 py-2 font-montserrat text-xs font-semibold text-white shadow-xl backdrop-blur-md dark:border-stone-100/10 dark:bg-stone-100/95 dark:text-stone-900 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* 1. TOP PARCEL SELECTOR STRIP (Matches Node 87:3) */}
      <div className="relative">
        <div
          onClick={() => setIsFieldDropdownOpen(!isFieldDropdownOpen)}
          className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200/90 bg-white/95 px-3.5 py-2.5 shadow-2xs transition hover:bg-stone-50 active:scale-99 dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
              {fieldDisplayName}
            </span>
            <span className="text-stone-300 dark:text-stone-700 shrink-0">•</span>
            <span className="shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {fieldAcres} ac
            </span>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-700 shrink-0">•</span>
            <span className="hidden sm:inline text-[11px] text-stone-500 dark:text-stone-400 truncate">
              Sown {standingCropName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Switch</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 transition-transform duration-200 ${
                isFieldDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {/* Field Switcher Dropdown Popover */}
        {isFieldDropdownOpen && (
          <div className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-800 dark:bg-stone-900 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-stone-100 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:border-stone-800">
              <span>Your Farm Parcels ({fields.length})</span>
              <span>Tap to switch</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 py-1">
              {fields.map((f) => {
                const isActive = f.id === activeField.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onSelectActiveField(f.id);
                      setIsFieldDropdownOpen(false);
                      showToast(`Switched to ${f.farmName}`);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl p-2.5 text-start transition ${
                      isActive
                        ? 'border border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/40'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                          {f.farmName}
                        </span>
                        {isActive && (
                          <span className="rounded-md bg-emerald-200/80 px-1.5 py-0.2 text-[9px] font-bold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-stone-500 dark:text-stone-400">
                        <span>{f.placeName || 'Farm parcel'}</span>
                        <span>•</span>
                        <span>{f.fieldSizeAcres || 5} ac</span>
                        <span>•</span>
                        <span className="capitalize">{f.soilTexture || 'Loam'}</span>
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1 flex items-center justify-between border-t border-stone-100 pt-2 px-1 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setIsFieldDropdownOpen(false);
                  if (onAddNewField) onAddNewField();
                  else onNavigateTab('field');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add new parcel</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFieldDropdownOpen(false);
                  onNavigateTab('field');
                }}
                className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
              >
                Manage all →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. PRIMARY HERO: SATELLITE FIELD OVERVIEW & STANDING CROP (Real Satellite Imagery) */}
      <section className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        {/* Real Leaflet Satellite Viewport (Esri World Imagery + Pinned Boundary) */}
        <SatelliteMapViewport
          latitude={activeField.latitude}
          longitude={activeField.longitude}
          fieldBoundary={activeField.fieldBoundary}
          fieldSizeAcres={fieldAcres}
          heightClassName="h-[340px] sm:h-[400px]"
          onRefresh={onRefreshSatelliteData}
          isRefreshing={isRefreshingSatellite}
          onEditBoundary={() => onNavigateTab('field')}
        />

        {/* Standing Crop Timeline & Sowing Bar */}
        <div className="p-3.5 sm:p-4 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-2xs ${standingCropTheme.boxClass}`}>
              {standingCropTheme.icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="font-montserrat text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {standingCropName}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 whitespace-nowrap">
                  Active Season
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-montserrat">
                <span>Sown {formattedSowingDate}</span>
                <span>•</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  Day {daysSinceSowing} of {totalCropDays}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${growthStage.progressPercent}%` }}
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[10.5px] text-stone-500 dark:text-stone-400 font-montserrat">
                <span>{growthStage.stageName}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {growthStage.progressPercent}% to Harvest
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REAL-TIME FIELD SENSING (Root Zone & Today's Weather from NASA API) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Root Zone Moisture Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-[#121212]">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400 font-montserrat">
            <span>Root Moisture</span>
            <Droplets className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="my-1 flex items-baseline gap-1.5">
            <span className="font-montserrat text-2xl font-black text-stone-900 dark:text-stone-100">
              {rootMoisturePercent}%
            </span>
            <span className={`text-xs font-bold ${isMoistureAdequate ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isMoistureAdequate ? 'Adequate' : 'Deficit'}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
            {isMoistureAdequate
              ? 'Subsoil moisture is sufficient. No immediate watering needed.'
              : 'Subsoil moisture is low. Plan irrigation within 48h.'}
          </p>
        </div>

        {/* Field Weather Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-[#121212]">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400 font-montserrat">
            <span>Field Weather</span>
            <Sun className="h-4 w-4 text-amber-500" />
          </div>
          <div className="my-1 flex items-baseline gap-1.5">
            <span className="font-montserrat text-2xl font-black text-stone-900 dark:text-stone-100">
              {fieldTemp}°C
            </span>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
              {fieldCondition}
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
            {weather?.current.windSpeedKmH && weather.current.windSpeedKmH < 12
              ? 'Calm wind. Safe window for foliar fertilizer spray.'
              : 'Optimal weather window for daily field operations.'}
          </p>
        </div>
      </div>

      {/* 4. RECOMMENDED NEXT CROP ADVISORY (Dynamic Strategy Integration) */}
      <section className="flex items-center justify-between rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-[#121212]">
        <div className="flex items-start gap-3 min-w-0 pr-2">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${nextCropTheme.boxClass}`}>
            {nextCropTheme.icon}
          </div>
          <div className="min-w-0">
            <h4 className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
              Next Crop Advisory: {nextCropLocName}
            </h4>
            <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
              {isNextLegume
                ? `Plant legume after ${standingCropName} harvest to naturally fix +${nextNFixKgHa} kg N/ha (saving ~${nextUreaBagsParcel} bags of urea on this ${fieldAcres} ac field).`
                : `Rotate in ${nextCropLocName} after ${standingCropName} harvest to break pest cycles and diversify field income.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('rotation')}
          className="inline-flex shrink-0 items-center gap-1 font-montserrat text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
        >
          <span>Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>

      {/* 5. 3-YEAR FIELD IMPACT LEDGER (Calibrated Rotation Math) */}
      <section className="rounded-2xl border border-stone-200/90 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2 dark:border-stone-800">
          <h3 className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
            3-Year Field Impact Projection
          </h3>
          <span className="font-montserrat text-[11px] font-semibold text-stone-500">
            {fieldAcres} Acres
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 xs:grid-cols-4 gap-2">
          {/* Metric 1: Urea Saved */}
          <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40">
            <div className="flex items-center justify-between text-stone-500">
              <span className="font-montserrat text-[9.5px] font-bold uppercase tracking-wider">
                Urea Saved
              </span>
              <Zap className="h-3 w-3 text-amber-600" />
            </div>
            <div className="mt-1 font-montserrat text-base font-bold text-amber-700 dark:text-amber-400">
              +{ureaBagsSaved} Bags
            </div>
            <p className="mt-0.5 text-[9.5px] text-stone-400">Bio-fixation</p>
          </div>

          {/* Metric 2: Water Conserved */}
          <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40">
            <div className="flex items-center justify-between text-stone-500">
              <span className="font-montserrat text-[9.5px] font-bold uppercase tracking-wider">
                Water Saved
              </span>
              <Droplets className="h-3 w-3 text-sky-600" />
            </div>
            <div className="mt-1 font-montserrat text-base font-bold text-sky-700 dark:text-sky-400">
              +{activeStrategy.total3YearWaterSavedM3PerHa.toLocaleString()} m³
            </div>
            <p className="mt-0.5 text-[9.5px] text-stone-400">Conserved</p>
          </div>

          {/* Metric 3: Soil Health */}
          <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40">
            <div className="flex items-center justify-between text-stone-500">
              <span className="font-montserrat text-[9.5px] font-bold uppercase tracking-wider">
                Soil Health
              </span>
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            </div>
            <div className="mt-1 font-montserrat text-base font-bold text-emerald-700 dark:text-emerald-400">
              {activeStrategy.soilHealthIndex}/100
            </div>
            <p className="mt-0.5 text-[9.5px] text-stone-400">
              +{activeStrategy.total3YearCarbonSequestrationTonPerHa.toFixed(1)}t Humus
            </p>
          </div>

          {/* Metric 4: Disease Shield */}
          <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40">
            <div className="flex items-center justify-between text-stone-500">
              <span className="font-montserrat text-[9.5px] font-bold uppercase tracking-wider">
                Disease
              </span>
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
            </div>
            <div className="mt-1 font-montserrat text-base font-bold text-indigo-600 dark:text-indigo-400">
              Shield
            </div>
            <p className="mt-0.5 text-[9.5px] text-stone-400">
              Disrupted
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FarmerHomeTab;