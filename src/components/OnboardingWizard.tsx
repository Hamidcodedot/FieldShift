import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  X,
  Sprout,
  Mic,
  Droplets,
  FlaskConical,
  Shield,
  Layers,
  ChevronDown,
  Globe,
  Play,
} from 'lucide-react';
import {
  AgroRegion,
  SoilProfile,
  FarmerPriorities,
  FarmerFieldProfile,
} from '../types';
import { generateFieldId } from '../services/fieldProfileService';
import { CROPS_DATABASE } from '../data/crops';
import { EVALUATION_SCENARIOS } from '../data/evaluationScenarios';
import { getHumanReadableLocation } from '../services/reverseGeocodeService';
import { findNearestAgroRegion } from '../services/geolocationService';
import { computeSoilHealthDiagnostic } from '../services/soilHealthDiagnostic';
import { MapSelector } from './MapSelector';
import { CropIcon } from './CropIcon';
import { NasaLogo } from './NasaLogo';

export type WizardMode = 'onboarding' | 'create' | 'edit';

export interface OnboardingWizardProps {
  mode?: WizardMode;
  existingField?: FarmerFieldProfile | null;
  currentRegion: AgroRegion;
  allRegions: AgroRegion[];
  initialLat: number;
  initialLon: number;
  initialSoil: SoilProfile;
  initialPriorities: FarmerPriorities;
  onComplete: (profile: FarmerFieldProfile) => void;
  onSkipToDemo?: (scenarioId?: string) => void;
  onClose: () => void;
}

const POPULAR_CROPS = [
  { id: 'wheat', name: 'Wheat (Gandum)', family: 'Poaceae (Cereal)' },
  { id: 'puddle_rice', name: 'Rice (Paddy / Munji)', family: 'Poaceae (Cereal)' },
  { id: 'cotton', name: 'Cotton (Kapas)', family: 'Malvaceae (Fiber)' },
  { id: 'corn_maize', name: 'Maize (Corn / Makki)', family: 'Poaceae (Cereal)' },
  { id: 'chickpea', name: 'Chickpea (Gram / Chana)', family: 'Fabaceae (Legume)' },
  { id: 'mustard', name: 'Mustard (Raya / Sarson)', family: 'Brassicaceae (Oilseed)' },
  { id: 'barley', name: 'Barley (Jau)', family: 'Poaceae (Cereal)' },
  { id: 'pearl_millet', name: 'Pearl Millet (Bajra)', family: 'Poaceae (Millet)' },
  { id: 'sorghum', name: 'Sorghum (Jowar)', family: 'Poaceae (Sorghum)' },
];

const GROWTH_STAGES = [
  { id: 'germination', label: 'Early Emergence (0 to 30 days)', days: 15 },
  { id: 'vegetative', label: 'Growing Green (30 to 60 days)', days: 45 },
  { id: 'flowering', label: 'Flowering & Heading (60 to 90 days)', days: 75 },
  { id: 'maturing', label: 'Grain Filling & Maturity (90+ days)', days: 105 },
];

const IRRIGATION_MODES = [
  { id: 'groundwater_borewell', label: 'Tubewell (Borewell Motor)' },
  { id: 'canal_surface', label: 'Canal (Nehri Pani)' },
  { id: 'hybrid_conjunctive', label: 'Hybrid (Canal + Tubewell)' },
  { id: 'rainfed', label: 'Rainfed (Barani)' },
  { id: 'drip_precision', label: 'Drip Precision' },
];

const UREA_OPTIONS = [
  { id: 'low', label: '1 Bag (Minimal)' },
  { id: 'moderate', label: '2-3 Bags (Moderate)' },
  { id: 'heavy', label: '4+ Bags (Heavy / Acid)' },
];

const PESTICIDE_OPTIONS = [
  { id: 'none', label: 'No Sprays (Bio)' },
  { id: 'moderate', label: '1-2 Sprays (Standard)' },
  { id: 'intensive', label: '3+ Sprays (Intensive)' },
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  mode = 'onboarding',
  existingField = null,
  currentRegion,
  allRegions,
  initialLat,
  initialLon,
  initialSoil,
  initialPriorities,
  onComplete,
  onSkipToDemo,
  onClose,
}) => {
  const isEditing = mode === 'edit';
  const isCreate = mode === 'create';

  // Step state:
  // Step 0: Welcome & Name (Shown only in onboarding mode)
  // Step 1: Field Location & Map (Step 1 of 3)
  // Step 2: Crop & Farm Inputs (Step 2 of 3)
  // Step 3: Soil Health Report (Step 3 of 3 • Complete)
  const [step, setStep] = useState<number>(mode === 'onboarding' ? 0 : 1);
  const [showEvalScenarios, setShowEvalScenarios] = useState<boolean>(false);

  // Field parameters draft
  const [selectedLat, setSelectedLat] = useState<number>(existingField ? existingField.latitude : initialLat);
  const [selectedLon, setSelectedLon] = useState<number>(existingField ? existingField.longitude : initialLon);
  const [farmerName, setFarmerName] = useState<string>(
    existingField?.farmerName || 'Hamid Shahid'
  );
  const [farmName, setFarmName] = useState<string>(() => {
    if (existingField?.farmName) return existingField.farmName;
    if (isCreate) return 'Field 2';
    return `${currentRegion.name.split(' (')[0]} Farm`;
  });
  const [placeName, setPlaceName] = useState<string>(
    existingField?.placeName || currentRegion.name.split(' (')[0]
  );
  const [activeRegion, setActiveRegion] = useState<AgroRegion>(() => {
    if (existingField) {
      return findNearestAgroRegion(existingField.latitude, existingField.longitude, allRegions) || currentRegion;
    }
    return currentRegion;
  });
  const [fieldBoundary, setFieldBoundary] = useState<[number, number][] | undefined>(
    existingField?.fieldBoundary
  );
  const [fieldSizeAcres, setFieldSizeAcres] = useState<number>(
    existingField?.fieldSizeAcres || 5.2
  );

  // Crop & Growth Stage
  const [currentCropId, setCurrentCropId] = useState<string>(
    existingField?.currentCropHistory?.currentCropId || 'wheat'
  );
  const [sowingStage, setSowingStage] = useState<'germination' | 'vegetative' | 'flowering' | 'maturing'>(
    existingField?.sowingStage || 'vegetative'
  );
  const [sowingDate, setSowingDate] = useState<string>(() => {
    if (existingField?.sowingDate) return existingField.sowingDate;
    const d = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });

  // Inputs & Irrigation
  const [ureaIntensity, setUreaIntensity] = useState<'low' | 'moderate' | 'heavy'>(
    existingField?.ureaIntensity || 'moderate'
  );
  const [pesticideFrequency, setPesticideFrequency] = useState<'none' | 'moderate' | 'intensive'>(
    existingField?.pesticideFrequency || 'moderate'
  );
  const [irrigation, setIrrigation] = useState<FarmerFieldProfile['irrigationMethod']>(
    existingField?.irrigationMethod || initialPriorities.waterAccessType || 'groundwater_borewell'
  );
  const [soilTexture, setSoilTexture] = useState<'loam' | 'clay' | 'sandy_loam'>(
    existingField?.soilTexture ||
      (initialSoil.texture === 'clay' ? 'clay' : initialSoil.texture === 'sandy_loam' ? 'sandy_loam' : 'loam')
  );

  // Update reverse geocoded place name when coordinates change (in create or initial onboarding)
  useEffect(() => {
    if (isEditing) return; // preserve existing place name in edit mode
    let isSubscribed = true;
    getHumanReadableLocation(selectedLat, selectedLon, allRegions).then((name) => {
      if (isSubscribed) {
        setPlaceName(name);
        setFarmName((current) =>
          !current || current === '' || current.startsWith('Plot') || current === 'Field 2'
            ? `${name.split(',')[0]} Farm`
            : current
        );
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [selectedLat, selectedLon, allRegions, isEditing]);

  // Lock body scroll while wizard is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Live computed diagnostic from NASA telemetry & farmer inputs
  const diagnostic = useMemo(() => {
    return computeSoilHealthDiagnostic({
      soilTexture,
      ureaIntensity,
      pesticideFrequency,
      irrigationMethod: irrigation,
      currentCropId,
      region: activeRegion,
    });
  }, [soilTexture, ureaIntensity, pesticideFrequency, irrigation, currentCropId, activeRegion]);

  const selectedCropObj = useMemo(() => {
    return (
      CROPS_DATABASE.find((c) => c.id === currentCropId) ||
      POPULAR_CROPS.find((c) => c.id === currentCropId) || {
        id: currentCropId,
        name: 'Wheat (Gandum)',
        family: 'Poaceae (Cereal)',
      }
    );
  }, [currentCropId]);

  const standingCropName = selectedCropObj.name.split(' (')[0];

  // Stage change helper
  const handleStageChange = (stageId: 'germination' | 'vegetative' | 'flowering' | 'maturing') => {
    setSowingStage(stageId);
    const found = GROWTH_STAGES.find((s) => s.id === stageId);
    const offsetDays = found?.days || 45;
    const d = new Date(Date.now() - offsetDays * 24 * 60 * 60 * 1000);
    setSowingDate(d.toISOString().split('T')[0]);
  };

  // Compile final profile and complete
  const handleFinalActivation = () => {
    const cropName = selectedCropObj.name;
    const prevCropId = currentCropId === 'wheat' ? 'puddle_rice' : 'wheat';
    const prevCropName = CROPS_DATABASE.find((c) => c.id === prevCropId)?.name || prevCropId;

    const finalFarmName = farmName.trim() || `${placeName.split(',')[0]} Farm`;

    const profile: FarmerFieldProfile = {
      id: existingField?.id || generateFieldId(),
      isConfigured: true,
      hasCompletedOnboarding: true,
      farmName: finalFarmName,
      farmerName: farmerName.trim() || 'Hamid Shahid',
      placeName: placeName,
      latitude: selectedLat,
      longitude: selectedLon,
      fieldBoundary: fieldBoundary && fieldBoundary.length >= 3 ? fieldBoundary : existingField?.fieldBoundary,
      currentCropHistory: {
        previousCropId: prevCropId,
        currentCropId: currentCropId,
        patternLabel: `${prevCropName} ➔ ${cropName}`,
      },
      irrigationMethod: irrigation,
      soilTexture,
      soilOrganicMatter: diagnostic.organicMatterEstimated,
      fieldSizeAcres: fieldSizeAcres > 0 ? fieldSizeAcres : (existingField?.fieldSizeAcres || 5.2),
      createdAt: existingField?.createdAt || new Date().toISOString(),
      sowingDate,
      ureaIntensity,
      pesticideFrequency,
      sowingStage,
      soilHealthScore: diagnostic.score,
    };

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-md overflow-hidden animate-in fade-in">
      <div className="card-chai relative z-10 flex h-[100dvh] sm:h-[94dvh] sm:max-h-[740px] w-full max-w-2xl flex-col p-2.5 sm:p-5 bg-white border-0 sm:border dark:border-stone-800 dark:bg-stone-950 shadow-2xl overflow-hidden rounded-none sm:rounded-3xl">
        {/* Top-Right Dedicated Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-30 flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 active:scale-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 shadow-2xs"
          title="Close"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Top Header Badge & Stepper Bar (Step 1, 2, 3) */}
        {step > 0 && (
          <div className="mb-2 sm:mb-3 shrink-0 border-b border-stone-200/70 pb-2 sm:pb-2.5 dark:border-stone-800">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between pr-9">
              <span className="inline-flex items-center whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-0.5 font-montserrat text-[10.5px] sm:text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {isEditing ? `Edit Field • Step ${step} of 3` : isCreate ? `Add New Field • Step ${step} of 3` : step === 3 ? 'Step 3 of 3 • Complete' : `Step ${step} of 3`}
              </span>
              <span className="font-montserrat text-[11px] font-semibold text-stone-500 dark:text-stone-400 whitespace-nowrap">
                {step === 1 && 'Location & Boundary'}
                {step === 2 && 'Crop & Farm Inputs'}
                {step === 3 && 'Soil Health Report'}
              </span>
            </div>

            {/* 3-Step Progress Indicator */}
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s <= step ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-stone-200 dark:bg-stone-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 0: WELCOME & FARMER NAME (Only for first-time app onboarding)
           ========================================================================= */}
        {step === 0 && (
          <div className="flex flex-1 min-h-0 flex-col justify-between overflow-y-auto pr-0.5">
            {/* Top Chip with Official NASA Insignia */}
            <div className="flex items-center justify-between shrink-0 mb-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-2.5 py-1 font-montserrat text-[11px] font-bold text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-200">
                <NasaLogo className="h-5 w-5" />
                <span>NASA Farm Advisor</span>
              </span>
              <span className="font-mono text-[10px] font-semibold text-stone-400 dark:text-stone-500">
                Space Apps 2026
              </span>
            </div>

            <div className="space-y-4 my-auto py-2">
              {/* Sprout Icon & Title */}
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">
                  <Sprout className="h-7 w-7" />
                </div>
                <h2 className="font-brand text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-900 dark:text-emerald-100">
                  Welcome to FieldShift
                </h2>
                <p className="mx-auto max-w-md text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-montserrat">
                  Protect your soil, cut fertilizer costs, and plan the best next crop using NASA satellite checks.
                </p>
              </div>

              {/* Farmer Name Input Card */}
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/80 p-3.5 dark:border-stone-800 dark:bg-stone-900/50 space-y-2">
                <div>
                  <h3 className="font-montserrat text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    What should we call you, Farmer?
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Personalizes your voice briefings & field advisories
                  </p>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="Enter your name (e.g. Hamid Shahid)"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm font-montserrat font-bold text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                  />
                  <div className="absolute right-3 text-stone-400 hover:text-emerald-600 transition">
                    <Mic className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-stone-400 dark:text-stone-500 pt-0.5">
                  <span>100% On-Device • Your records stay completely private</span>
                </div>
              </div>

              {/* 2 Value Pillars (Matching Screen 0) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-stone-200/80 bg-white p-3 dark:border-stone-800 dark:bg-stone-900/40">
                  <div className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                    Check Root Water from Space
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                    Track subsoil moisture from SMAP satellite before spending on tubewell diesel.
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200/80 bg-white p-3 dark:border-stone-800 dark:bg-stone-900/40">
                  <div className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                    Save 6 to 8 Bags of Urea
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                    Grow bio-fixing legumes that naturally add nitrogen back to your land.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-2 border-t border-stone-200/70 dark:border-stone-800 shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-asym w-full inline-flex min-h-[44px] items-center justify-center gap-2 bg-emerald-800 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-900 active:scale-95 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <span>Set Up My Field (3 Quick Steps)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {onSkipToDemo && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowEvalScenarios((prev) => !prev)}
                    className="btn-asym-mirror w-full inline-flex min-h-[40px] items-center justify-between border border-blue-200/90 bg-blue-50/70 px-3.5 text-xs font-semibold text-blue-950 transition hover:bg-blue-100/80 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-950/70"
                  >
                    <span className="inline-flex items-center gap-2">
                      <NasaLogo className="h-4 w-4" />
                      <span>Evaluation Mode (Judges & Reviewers)</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      {showEvalScenarios ? 'Hide' : '3 Presets'}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showEvalScenarios ? 'rotate-180' : ''}`} />
                    </span>
                  </button>

                  {showEvalScenarios && (
                    <div className="rounded-2xl border border-blue-200/80 bg-white/95 p-2.5 space-y-1.5 shadow-sm dark:border-blue-900/50 dark:bg-stone-900/90 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-1 pb-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Demo Field & Crop Presets
                          </span>
                          <span className="text-[10px] text-stone-400">No GPS needed</span>
                        </div>
                        <p className="text-[10px] leading-snug text-stone-500 dark:text-stone-400">
                          Field boundaries and standing crops below are sample demo selections over real croplands; NASA POWER &amp; weather telemetry load live for each coordinate.
                        </p>
                      </div>
                      {EVALUATION_SCENARIOS.map((scenario) => (
                        <button
                          key={scenario.id}
                          type="button"
                          onClick={() => onSkipToDemo(scenario.id)}
                          className="w-full flex items-center justify-between gap-2 rounded-xl border border-stone-200/80 bg-stone-50/70 px-3 py-2 text-left transition hover:border-emerald-500 hover:bg-emerald-50/60 active:scale-[0.99] dark:border-stone-800 dark:bg-stone-800/50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30"
                        >
                          <div className="min-w-0">
                            <div className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                              {scenario.title}
                            </div>
                            <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                              {scenario.subtitle} • {scenario.highlightMetric}
                            </div>
                          </div>
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 1: FIELD LOCATION & MAP (Step 1 of 3)
           ========================================================================= */}
        {step === 1 && (
          <div className="flex flex-1 min-h-0 flex-col justify-between gap-2 overflow-y-auto overflow-x-hidden">
            <div className="space-y-2">
              {/* Screen Title */}
              <div>
                <h3 className="font-brand text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  Where is your field?
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                  Tap your farm on the map to mark its corners
                </p>
              </div>

              {/* Field Name Input Card with Acreage Pill */}
              <div className="flex items-center justify-between gap-2.5 rounded-xl sm:rounded-2xl border border-stone-200/90 bg-stone-50/80 p-2 sm:p-2.5 dark:border-stone-800 dark:bg-stone-900/50 shrink-0">
                <div className="min-w-0 flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 font-montserrat">
                    FIELD NAME
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Multan North Plot"
                    className="w-full bg-transparent text-xs sm:text-sm font-montserrat font-bold text-stone-900 outline-none dark:text-stone-100"
                  />
                </div>
                {fieldSizeAcres > 0 && (
                  <div className="rounded-lg sm:rounded-xl bg-emerald-100 px-2.5 py-1 text-center dark:bg-emerald-950 shrink-0 border border-emerald-200 dark:border-emerald-800">
                    <span className="font-montserrat text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 block whitespace-nowrap">
                      {fieldSizeAcres} Acres
                    </span>
                    <span className="text-[9.5px] text-emerald-700 dark:text-emerald-400 block font-medium whitespace-nowrap">
                      {fieldBoundary && fieldBoundary.length >= 3 ? 'Boundary Set' : 'Estimated'}
                    </span>
                  </div>
                )}
              </div>

              {/* High-Resolution Satellite Map (flattened on mobile for maximum map width) */}
              <MapSelector
                embedded
                currentRegion={activeRegion}
                allRegions={allRegions}
                onSelectCoordinates={(lat, lon) => {
                  setSelectedLat(lat);
                  setSelectedLon(lon);
                  const nearest = findNearestAgroRegion(lat, lon, allRegions);
                  if (nearest && nearest.id !== activeRegion.id) {
                    setActiveRegion(nearest);
                    setSoilTexture(
                      nearest.typicalSoil.texture === 'clay'
                        ? 'clay'
                        : nearest.typicalSoil.texture === 'sandy_loam'
                        ? 'sandy_loam'
                        : 'loam'
                    );
                  }
                }}
                onSelectRegion={(reg) => {
                  setActiveRegion(reg);
                  setSoilTexture(
                    reg.typicalSoil.texture === 'clay'
                      ? 'clay'
                      : reg.typicalSoil.texture === 'sandy_loam'
                      ? 'sandy_loam'
                      : 'loam'
                  );
                }}
                selectedLat={selectedLat}
                selectedLon={selectedLon}
                fieldBoundary={fieldBoundary}
                onUpdateFieldBoundary={(boundary, acres) => {
                  setFieldBoundary(boundary);
                  setFieldSizeAcres(acres > 0 ? Number(acres.toFixed(1)) : 5.2);
                }}
                mapHeightClassName="h-64 sm:h-72"
              />
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 dark:border-stone-800 shrink-0">
              {mode === 'onboarding' ? (
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="btn-asym-mirror inline-flex min-h-[38px] items-center gap-1 border border-stone-300 bg-transparent px-3 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-asym-mirror inline-flex min-h-[38px] items-center gap-1 border border-stone-300 bg-transparent px-3 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <span>Cancel</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-asym inline-flex min-h-[40px] items-center gap-1.5 bg-emerald-800 px-5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 active:scale-95 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <span>Next: Crop & Water</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 2: CROP & FARM INPUTS (Step 2 of 3 - All 5 Inputs Combined)
           ========================================================================= */}
        {step === 2 && (
          <div className="flex flex-1 min-h-0 flex-col justify-between gap-2 overflow-y-auto overflow-x-hidden">
            <div className="space-y-2.5 sm:space-y-3">
              {/* Screen Title */}
              <div>
                <h3 className="font-brand text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  Crop & Farm Inputs
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                  All 5 inputs combined in one simple screen
                </p>
              </div>

              {/* 1. Standing Crop in Field */}
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-montserrat font-bold text-stone-900 dark:text-stone-100">
                    <CropIcon cropId={currentCropId} className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    <span>1. Standing Crop in Field</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">Current crop</span>
                </div>

                <div className="relative">
                  <select
                    value={currentCropId}
                    onChange={(e) => setCurrentCropId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-stone-300/90 bg-white px-3 py-2 text-xs font-montserrat font-bold text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 cursor-pointer"
                  >
                    {POPULAR_CROPS.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                </div>
              </div>

              {/* 2. Crop Growth Stage */}
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-montserrat font-bold text-stone-900 dark:text-stone-100">
                    <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>2. Crop Growth Stage</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">Age</span>
                </div>

                <div className="relative">
                  <select
                    value={sowingStage}
                    onChange={(e) => handleStageChange(e.target.value as any)}
                    className="w-full appearance-none rounded-xl border border-stone-300/90 bg-white px-3 py-2 text-xs font-montserrat font-bold text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 cursor-pointer"
                  >
                    {GROWTH_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                </div>
              </div>

              {/* 3. Irrigation Water Source */}
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-montserrat font-bold text-stone-900 dark:text-stone-100">
                    <Droplets className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    <span>3. Irrigation Water Source</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">Water regime</span>
                </div>

                <div className="relative">
                  <select
                    value={irrigation}
                    onChange={(e) => setIrrigation(e.target.value as any)}
                    className="w-full appearance-none rounded-xl border border-stone-300/90 bg-white px-3 py-2 text-xs font-montserrat font-bold text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 cursor-pointer"
                  >
                    {IRRIGATION_MODES.map((modeItem) => (
                      <option key={modeItem.id} value={modeItem.id}>
                        {modeItem.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                </div>
              </div>

              {/* Row of 2: Urea & Sprays */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5">
                {/* 4. Urea */}
                <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-montserrat font-bold text-stone-900 dark:text-stone-100 text-xs">
                    <FlaskConical className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>4. Urea</span>
                  </div>

                  <div className="relative">
                    <select
                      value={ureaIntensity}
                      onChange={(e) => setUreaIntensity(e.target.value as any)}
                      className="w-full appearance-none rounded-xl border border-stone-300/90 bg-white px-3 pr-8 py-2 text-xs font-montserrat font-bold text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 cursor-pointer"
                    >
                      {UREA_OPTIONS.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  </div>
                </div>

                {/* 5. Sprays */}
                <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-montserrat font-bold text-stone-900 dark:text-stone-100 text-xs">
                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>5. Sprays</span>
                  </div>

                  <div className="relative">
                    <select
                      value={pesticideFrequency}
                      onChange={(e) => setPesticideFrequency(e.target.value as any)}
                      className="w-full appearance-none rounded-xl border border-stone-300/90 bg-white px-3 pr-8 py-2 text-xs font-montserrat font-bold text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 cursor-pointer"
                    >
                      {PESTICIDE_OPTIONS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  </div>
                </div>
              </div>

              {/* Status Bar: Ready for NASA Check & Est. Health */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                <span className="font-montserrat font-semibold flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Ready for NASA satellite check</span>
                </span>
                <span className="font-montserrat font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                  Est. Health: {diagnostic.score}/100
                </span>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 dark:border-stone-800 shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-asym-mirror inline-flex min-h-[38px] items-center gap-1 border border-stone-300 bg-transparent px-3 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-asym inline-flex min-h-[40px] items-center gap-1.5 bg-emerald-800 px-5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-900 active:scale-95 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <span>Check Soil Health</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            SCREEN 3: YOUR FIELD SOIL REPORT (Step 3 of 3 • Complete)
           ========================================================================= */}
        {step === 3 && (
          <div className="flex flex-1 min-h-0 flex-col justify-between gap-2 overflow-y-auto overflow-x-hidden">
            <div className="space-y-2.5 sm:space-y-3">
              {/* Screen Title */}
              <div>
                <h3 className="font-brand text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  Your Field Soil Report
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                  Combined from NASA satellite & your inputs
                </p>
              </div>

              {/* Main Overall Soil Health Hero Card */}
              <div className="rounded-2xl bg-[#0f3822] text-white p-3.5 sm:p-4 shadow-md space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="shrink-0">
                    <span className="font-montserrat text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-emerald-200 block">
                      OVERALL SOIL HEALTH
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-montserrat text-3xl sm:text-4xl font-black text-white">
                        {diagnostic.score}
                      </span>
                      <span className="text-sm font-semibold text-emerald-300">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right min-w-0">
                    <span className="text-[11px] font-medium text-emerald-100 block">
                      Natural Fertility
                    </span>
                    <span className="font-montserrat text-xs font-bold text-white block">
                      {diagnostic.organicMatterEstimated}% Humus
                    </span>
                    <span className="text-[10.5px] text-emerald-300 block max-w-[140px] sm:max-w-[180px] truncate ml-auto mt-0.5 leading-tight">
                      {farmName}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="rounded-full bg-emerald-900/90 border border-emerald-500/40 px-3 py-1 font-montserrat text-[11px] font-bold text-emerald-200 inline-flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    <span>
                      {diagnostic.rating === 'Optimal'
                        ? 'Good Condition'
                        : diagnostic.rating === 'Fair'
                        ? 'Moderate Condition'
                        : 'Needs Regeneration'}
                    </span>
                  </span>
                </div>
              </div>

              {/* 3 Horizontal Telemetry Chips */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {/* Chip 1: Root Moisture */}
                <div className="rounded-xl sm:rounded-2xl border border-stone-200/90 bg-stone-50/70 p-2 sm:p-2.5 dark:border-stone-800 dark:bg-stone-900/40 text-center space-y-1">
                  <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <span className="block text-[10px] text-stone-500 font-medium">Root Moisture</span>
                  <span className="block font-montserrat text-xs font-bold text-sky-800 dark:text-sky-300">
                    {diagnostic.rootMoisturePercent}% Wet
                  </span>
                </div>

                {/* Chip 2: Urea Burn Risk */}
                <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40 text-center space-y-1">
                  <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <span className="block text-[10px] text-stone-500 font-medium">Urea Burn Risk</span>
                  <span className={`block font-montserrat text-xs font-bold ${
                    diagnostic.acidificationRisk === 'Critical'
                      ? 'text-rose-700 dark:text-rose-400'
                      : diagnostic.acidificationRisk === 'Moderate'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {diagnostic.acidificationRisk}
                  </span>
                </div>

                {/* Chip 3: Soil Life */}
                <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/40 text-center space-y-1">
                  <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="block text-[10px] text-stone-500 font-medium">Soil Life</span>
                  <span className="block font-montserrat text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {diagnostic.microbialActivity === 'Active & Diverse'
                      ? 'Active'
                      : diagnostic.microbialActivity === 'Moderate'
                      ? 'Moderate'
                      : 'Low'}
                  </span>
                </div>
              </div>

              {/* Next Season Advice Card */}
              <div className="rounded-2xl border border-stone-200/90 bg-white p-3.5 dark:border-stone-800 dark:bg-stone-900/50 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-emerald-800 dark:text-emerald-400">
                  <CropIcon cropId="chickpea" className="h-4 w-4" />
                  <span>Next Season Advice</span>
                </div>
                <p className="text-[11.5px] text-stone-600 dark:text-stone-300 leading-relaxed">
                  Plant a Legume crop (Chickpea or Mungbean) after {standingCropName} harvest. It naturally restores nitrogen and saves you 2 bags of Urea per acre next season.
                </p>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 dark:border-stone-800 shrink-0">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-asym-mirror inline-flex min-h-[38px] items-center gap-1 border border-stone-300 bg-transparent px-3 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinalActivation}
                className="btn-asym inline-flex min-h-[40px] sm:min-h-[42px] items-center gap-1.5 sm:gap-2 bg-emerald-800 px-4 sm:px-6 text-xs font-semibold text-white shadow-md hover:bg-emerald-900 active:scale-95 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              >
                <span>
                  {isEditing ? 'Save Changes' : isCreate ? 'Save & Activate Field' : 'Open My Farm Plan'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
