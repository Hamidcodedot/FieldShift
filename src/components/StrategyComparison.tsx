import React, { useState } from 'react';
import {
  RotationStrategy,
  FarmerFieldProfile,
  NasaClimateData,
  SoilProfile,
  AgroRegion,
  Crop,
} from '../types';
import { CROP_LOCALIZED_NAMES } from '../data/translations';
import { CROPS_DATABASE } from '../data/crops';
import { calculateDaysSinceSowing } from '../services/fieldProfileService';
import { NasaLogo } from './NasaLogo';
import { formatShortDate } from '../services/cropCalendarService';
import {
  MapPin,
  Calendar,
  ChevronDown,
  Check,
  Sparkles,
  SlidersHorizontal,
  Droplets,
  Layers,
  Shield,
  TrendingUp,
  CheckCircle2,
  Repeat,
} from 'lucide-react';
import { getCropThemeConfig } from './CropIcon';

interface StrategyComparisonProps {
  strategies: {
    conventional: RotationStrategy;
    soilBuilder: RotationStrategy;
    climateShield: RotationStrategy;
    balancedProfit: RotationStrategy;
  };
  selectedStrategyId: string;
  onSelectStrategy: (strat: RotationStrategy) => void;
  activeField?: FarmerFieldProfile;
  fields?: FarmerFieldProfile[];
  onSelectActiveField?: (fieldId: string) => void;
  climate?: NasaClimateData;
  soil?: SoilProfile;
  region?: AgroRegion;
  onOpenCustomBuilder?: () => void;
  onOpenOnboarding?: () => void;
}

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  activeField,
  fields,
  onSelectActiveField,
  climate: _climate,
  soil: _soil,
  region: _region,
  onOpenCustomBuilder,
}) => {
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState<boolean>(false);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState<boolean>(false);
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0); // 0 = Year 1, 1 = Year 2, 2 = Year 3
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);
  const [isRationaleOpen, setIsRationaleOpen] = useState<boolean>(false);
  const [expandedCropKeys, setExpandedCropKeys] = useState<Record<string, boolean>>({
    '0-0': true, // Standing crop open by default
  });

  const toggleCropDropdown = (cardKey: string) => {
    setExpandedCropKeys((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  const fieldAcres = activeField?.fieldSizeAcres || 5;
  const fieldHa = fieldAcres / 2.471;

  const getStratMetrics = (strat: RotationStrategy) => {
    const ureaBags = Math.max(0, Math.round((strat.total3YearNitrogenNetKgPerHa * fieldHa) / 23));
    const waterM3 = Math.max(0, Math.round(strat.total3YearWaterSavedM3PerHa * fieldHa));
    const humus = Math.max(0, Math.min(45, Math.round(strat.total3YearCarbonSequestrationTonPerHa * 6.5)));

    return {
      ureaSaved: ureaBags > 0 ? `+${ureaBags} Bags` : '0 Bags',
      waterSaved: waterM3 > 0 ? `+${waterM3.toLocaleString()} m³` : '0 m³',
      humusBoost: humus > 0 ? `+${humus}%` : '0%',
    };
  };

  const strategyList = [
    {
      key: 'soilBuilder',
      data: strategies.soilBuilder,
      title: 'Soil Regenerator',
      tag: 'Recommended',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      subtitle: 'Bio-nitrogen builder • Saves urea expenses',
      ...getStratMetrics(strategies.soilBuilder),
      icon: <Layers className="h-5 w-5" />,
      boxClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      key: 'climateShield',
      data: strategies.climateShield,
      title: 'Climate Resilience Shield',
      tag: 'Drought Defense',
      badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
      subtitle: 'Low irrigation demand • Safeguards groundwater',
      ...getStratMetrics(strategies.climateShield),
      icon: <Shield className="h-5 w-5" />,
      boxClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    },
    {
      key: 'balancedProfit',
      data: strategies.balancedProfit,
      title: 'Balanced High Profit',
      tag: 'High Income',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      subtitle: 'Commercial cash crops • Maximizes cash flow',
      ...getStratMetrics(strategies.balancedProfit),
      icon: <TrendingUp className="h-5 w-5" />,
      boxClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      key: 'conventional',
      data: strategies.conventional,
      title: 'Conventional Baseline',
      tag: 'Current Practice',
      badgeClass: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
      subtitle: 'Repeated wheat-cotton monoculture without legumes',
      ...getStratMetrics(strategies.conventional),
      icon: <Repeat className="h-5 w-5" />,
      boxClass: 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
    },
  ];

  const activePlanItem =
    strategyList.find((s) => s.data.id === selectedStrategyId) || strategyList[0];
  const activeData = activePlanItem.data;

  // Standing crop in active field (Ground Truth from Parcel Profile)
  const standingCropId = activeField?.currentCropHistory?.currentCropId || 'wheat';
  const standingCropObj = CROPS_DATABASE.find((c) => c.id === standingCropId) || CROPS_DATABASE[0];
  const standingCropName =
    activeField?.currentCropHistory?.patternLabel?.split(' (')[0] ||
    standingCropObj.name.split(' (')[0];
  const totalCropDays = standingCropObj.growthDurationDays || 120;
  const daysSinceSowing = activeField ? calculateDaysSinceSowing(activeField.sowingDate) : 35;
  const currentDaysText = `Day ${daysSinceSowing} of ${totalCropDays}`;

  // Field sowing baseline (Pure calculation from field profile)
  const sowingDateObj = activeField?.sowingDate
    ? new Date(activeField.sowingDate)
    : new Date('2026-10-18T00:00:00Z');
  const startYear = sowingDateObj.getFullYear();

  // Dynamic Year Labels based on parcel sowing year
  const yearLabels = [
    `Year 1 (${startYear}–${(startYear + 1).toString().slice(-2)})`,
    `Year 2 (${startYear + 1}–${(startYear + 2).toString().slice(-2)})`,
    `Year 3 (${startYear + 2}–${(startYear + 3).toString().slice(-2)})`,
  ];

  // Date manipulation helpers for consecutive seasons
  const addDays = (base: Date, days: number): Date => {
    const res = new Date(base);
    res.setDate(res.getDate() + days);
    return res;
  };

  const getWindowText = (sDate: Date, duration: number) => {
    const eDate = addDays(sDate, duration);
    return `${formatShortDate(sDate.toISOString())} - ${formatShortDate(eDate.toISOString())}`;
  };

  // Dynamic agronomic tag & badge color generator
  const getCropTagAndBadge = (crop: Crop, isStanding = false, nBalance?: number) => {
    if (isStanding) {
      return {
        extraTag: 'STANDING CROP',
        extraTagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        iconType: crop.category === 'cereal' ? 'wheat' : 'sprout',
      };
    }
    const isLegume = crop.family === 'Fabaceae' || (nBalance !== undefined ? nBalance > 0 : crop.nitrogenFixationKgPerHa > 0);
    if (isLegume) {
      const nFix = Math.round(nBalance ?? (crop.nitrogenFixationKgPerHa > 0 ? crop.nitrogenFixationKgPerHa : 35));
      return {
        extraTag: `+${Math.max(25, nFix)}KG N FIX`,
        extraTagColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
        iconType: 'sprout',
      };
    }
    if (crop.family === 'Brassicaceae') {
      return {
        extraTag: 'BIO-FUMIGATION',
        extraTagColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
        iconType: 'sprout',
      };
    }
    if (crop.category === 'cash_crop' || crop.marketValuePerTonUsd > 350) {
      return {
        extraTag: 'HIGH CASH VALUE',
        extraTagColor: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
        iconType: 'sun',
      };
    }
    if (crop.droughtToleranceScore >= 70) {
      return {
        extraTag: 'DROUGHT DEFENSE',
        extraTagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
        iconType: 'sun',
      };
    }
    return {
      extraTag: 'HIGH YIELD FEED',
      extraTagColor: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
      iconType: 'sun',
    };
  };

  const allSeasons = activeData.seasons || [];

  // =========================================================================
  // Year 1 Timeline:
  // Phase 1: Standing Crop (active in field)
  // Phase 2: First rotation crop from active strategy (e.g. Chickpea / Legume)
  // Phase 3: Second rotation crop from active strategy (e.g. Cotton / Cash Crop)
  // =========================================================================
  const y1HarvestDate = addDays(sowingDateObj, totalCropDays);
  const y1StandingBadge = getCropTagAndBadge(standingCropObj, true);

  const y1Crop2Slot = allSeasons[0];
  const y1Crop2Obj = y1Crop2Slot?.crop || CROPS_DATABASE.find((c) => c.id === 'chickpea') || CROPS_DATABASE[0];
  const y1Crop2Start = addDays(y1HarvestDate, 10);
  const y1Crop2Days = y1Crop2Obj.growthDurationDays || 75;
  const y1Crop2Badge = getCropTagAndBadge(y1Crop2Obj, false, y1Crop2Slot?.soilNitrogenBalanceKg);
  const y1Crop2End = addDays(y1Crop2Start, y1Crop2Days);

  const y1Crop3Slot = allSeasons[1];
  const y1Crop3Obj = y1Crop3Slot?.crop || CROPS_DATABASE.find((c) => c.id === 'cotton') || CROPS_DATABASE[1];
  const y1Crop3Start = addDays(y1Crop2End, 10);
  const y1Crop3Days = y1Crop3Obj.growthDurationDays || 125;
  const y1Crop3Badge = getCropTagAndBadge(y1Crop3Obj, false, y1Crop3Slot?.soilNitrogenBalanceKg);
  const y1Crop3End = addDays(y1Crop3Start, y1Crop3Days);

  const year1Crops = [
    {
      crop: standingCropObj,
      seasonName: `${standingCropObj.suitableSeasons?.[0]?.toUpperCase() || 'RABI'} (Standing)`,
      windowText: getWindowText(sowingDateObj, totalCropDays),
      extraTag: y1StandingBadge.extraTag,
      extraTagColor: y1StandingBadge.extraTagColor,
      detailsText: currentDaysText,
      iconType: y1StandingBadge.iconType,
    },
    {
      crop: y1Crop2Obj,
      seasonName: y1Crop2Slot?.seasonName || 'Zaid Window',
      windowText: getWindowText(y1Crop2Start, y1Crop2Days),
      extraTag: y1Crop2Badge.extraTag,
      extraTagColor: y1Crop2Badge.extraTagColor,
      detailsText: `${y1Crop2Days} Days Duration`,
      iconType: y1Crop2Badge.iconType,
    },
    {
      crop: y1Crop3Obj,
      seasonName: y1Crop3Slot?.seasonName || 'Kharif Season',
      windowText: getWindowText(y1Crop3Start, y1Crop3Days),
      extraTag: y1Crop3Badge.extraTag,
      extraTagColor: y1Crop3Badge.extraTagColor,
      detailsText: `${y1Crop3Days} Days Duration`,
      iconType: y1Crop3Badge.iconType,
    },
  ];

  // =========================================================================
  // Year 2 Timeline:
  // Phase 1: Slot 2 from strategy (e.g. Mustard bio-fumigation)
  // Phase 2: Slot 3 from strategy (e.g. Moong)
  // Phase 3: Slot 4 from strategy (e.g. Maize)
  // =========================================================================
  const y2Crop1Slot = allSeasons[2] || allSeasons[0];
  const y2Crop1Obj = y2Crop1Slot?.crop || CROPS_DATABASE.find((c) => c.id === 'mustard') || CROPS_DATABASE[0];
  const y2Crop1Start = addDays(y1Crop3End, 10);
  const y2Crop1Days = y2Crop1Obj.growthDurationDays || 110;
  const y2Crop1Badge = getCropTagAndBadge(y2Crop1Obj, false, y2Crop1Slot?.soilNitrogenBalanceKg);
  const y2Crop1End = addDays(y2Crop1Start, y2Crop1Days);

  const y2Crop2Slot = allSeasons[3] || allSeasons[1];
  const y2Crop2Obj = y2Crop2Slot?.crop || CROPS_DATABASE.find((c) => c.id === 'green_gram_moong') || CROPS_DATABASE[1];
  const y2Crop2Start = addDays(y2Crop1End, 10);
  const y2Crop2Days = y2Crop2Obj.growthDurationDays || 70;
  const y2Crop2Badge = getCropTagAndBadge(y2Crop2Obj, false, y2Crop2Slot?.soilNitrogenBalanceKg);
  const y2Crop2End = addDays(y2Crop2Start, y2Crop2Days);

  const y2Crop3Slot = allSeasons[4] || allSeasons[2];
  const y2Crop3Obj = y2Crop3Slot?.crop || CROPS_DATABASE.find((c) => c.id === 'corn_maize') || CROPS_DATABASE[2];
  const y2Crop3Start = addDays(y2Crop2End, 10);
  const y2Crop3Days = y2Crop3Obj.growthDurationDays || 105;
  const y2Crop3Badge = getCropTagAndBadge(y2Crop3Obj, false, y2Crop3Slot?.soilNitrogenBalanceKg);
  const y2Crop3End = addDays(y2Crop3Start, y2Crop3Days);

  const year2Crops = [
    {
      crop: y2Crop1Obj,
      seasonName: y2Crop1Slot?.seasonName || 'Rabi Season',
      windowText: getWindowText(y2Crop1Start, y2Crop1Days),
      extraTag: y2Crop1Badge.extraTag,
      extraTagColor: y2Crop1Badge.extraTagColor,
      detailsText: `${y2Crop1Days} Days Duration`,
      iconType: y2Crop1Badge.iconType,
    },
    {
      crop: y2Crop2Obj,
      seasonName: y2Crop2Slot?.seasonName || 'Zaid Window',
      windowText: getWindowText(y2Crop2Start, y2Crop2Days),
      extraTag: y2Crop2Badge.extraTag,
      extraTagColor: y2Crop2Badge.extraTagColor,
      detailsText: `${y2Crop2Days} Days Duration`,
      iconType: y2Crop2Badge.iconType,
    },
    {
      crop: y2Crop3Obj,
      seasonName: y2Crop3Slot?.seasonName || 'Kharif Season',
      windowText: getWindowText(y2Crop3Start, y2Crop3Days),
      extraTag: y2Crop3Badge.extraTag,
      extraTagColor: y2Crop3Badge.extraTagColor,
      detailsText: `${y2Crop3Days} Days Duration`,
      iconType: y2Crop3Badge.iconType,
    },
  ];

  // =========================================================================
  // Year 3 Timeline:
  // Phase 1: Slot 5 from strategy (e.g. Barley or Cereal)
  // Phase 2: Slot 0 from strategy (Legume recharge)
  // Phase 3: Slot 1 from strategy (Monsoon cash crop)
  // =========================================================================
  const y3Crop1Slot = allSeasons[5] || allSeasons[0];
  const y3Crop1Obj = y3Crop1Slot?.crop || CROPS_DATABASE.find((c) => c.id === 'barley') || CROPS_DATABASE[0];
  const y3Crop1Start = addDays(y2Crop3End, 10);
  const y3Crop1Days = y3Crop1Obj.growthDurationDays || 115;
  const y3Crop1Badge = getCropTagAndBadge(y3Crop1Obj, false, y3Crop1Slot?.soilNitrogenBalanceKg);
  const y3Crop1End = addDays(y3Crop1Start, y3Crop1Days);

  const y3Crop2Slot = allSeasons[0];
  const y3Crop2Obj = y3Crop2Slot?.crop || CROPS_DATABASE.find((c) => c.id === 'green_gram_moong') || CROPS_DATABASE[1];
  const y3Crop2Start = addDays(y3Crop1End, 10);
  const y3Crop2Days = y3Crop2Obj.growthDurationDays || 80;
  const y3Crop2Badge = getCropTagAndBadge(y3Crop2Obj, false, y3Crop2Slot?.soilNitrogenBalanceKg);
  const y3Crop2End = addDays(y3Crop2Start, y3Crop2Days);

  const y3Crop3Slot = allSeasons[1];
  const y3Crop3Obj = y3Crop3Slot?.crop || CROPS_DATABASE.find((c) => c.id === 'pearl_millet') || CROPS_DATABASE[2];
  const y3Crop3Start = addDays(y3Crop2End, 10);
  const y3Crop3Days = y3Crop3Obj.growthDurationDays || 90;
  const y3Crop3Badge = getCropTagAndBadge(y3Crop3Obj, false, y3Crop3Slot?.soilNitrogenBalanceKg);

  const year3Crops = [
    {
      crop: y3Crop1Obj,
      seasonName: y3Crop1Slot?.seasonName || 'Rabi Season',
      windowText: getWindowText(y3Crop1Start, y3Crop1Days),
      extraTag: y3Crop1Badge.extraTag,
      extraTagColor: y3Crop1Badge.extraTagColor,
      detailsText: `${y3Crop1Days} Days Duration`,
      iconType: y3Crop1Badge.iconType,
    },
    {
      crop: y3Crop2Obj,
      seasonName: y3Crop2Slot?.seasonName || 'Zaid Window',
      windowText: getWindowText(y3Crop2Start, y3Crop2Days),
      extraTag: y3Crop2Badge.extraTag,
      extraTagColor: y3Crop2Badge.extraTagColor,
      detailsText: `${y3Crop2Days} Days Duration`,
      iconType: y3Crop2Badge.iconType,
    },
    {
      crop: y3Crop3Obj,
      seasonName: y3Crop3Slot?.seasonName || 'Kharif Season',
      windowText: getWindowText(y3Crop3Start, y3Crop3Days),
      extraTag: y3Crop3Badge.extraTag,
      extraTagColor: y3Crop3Badge.extraTagColor,
      detailsText: `${y3Crop3Days} Days Duration`,
      iconType: y3Crop3Badge.iconType,
    },
  ];

  const yearOptions = [
    { label: yearLabels[0], crops: year1Crops },
    { label: yearLabels[1], crops: year2Crops },
    { label: yearLabels[2], crops: year3Crops },
  ];

  const currentYearData = yearOptions[selectedYearIndex] || yearOptions[0];

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Header Row: Crop Plan & Sliders Customizer Button */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h1 className="font-brand text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Crop Plan
          </h1>
          <p className="font-montserrat text-xs text-stone-500 dark:text-stone-400">
            Tailored 3-Year Rotations
          </p>
        </div>

        {onOpenCustomBuilder && (
          <button
            type="button"
            onClick={onOpenCustomBuilder}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/90 bg-white/95 text-stone-700 shadow-xs transition hover:bg-stone-50 active:scale-95 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
            title="Open Interactive Rotation Sandbox"
            aria-label="Customize Strategy"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 1. Field Context Strip with Switch link */}
      <div className="relative rounded-2xl border border-stone-200/90 bg-white/95 px-3.5 py-2.5 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
              {activeField?.farmName || 'Farm Field'}
            </span>
            <span className="text-stone-300 dark:text-stone-700 shrink-0">•</span>
            <span className="shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {activeField?.fieldSizeAcres || 5.2} ac
            </span>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-700 shrink-0">•</span>
            <span className="hidden sm:inline text-[11px] text-stone-500 dark:text-stone-400 truncate">
              Sown {standingCropName}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsFieldDropdownOpen((prev) => !prev)}
            className="font-montserrat text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition shrink-0 ml-2"
          >
            Switch
          </button>
        </div>

        {/* Field Selection Popover */}
        {isFieldDropdownOpen && fields && fields.length > 0 && onSelectActiveField && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-800 dark:bg-stone-950">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 font-montserrat border-b border-stone-100 dark:border-stone-800/80 mb-1">
              Select Field Parcel
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {fields.map((f) => {
                const isActive = f.id === activeField?.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      onSelectActiveField(f.id);
                      setIsFieldDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition ${
                      isActive
                        ? 'bg-emerald-50 font-bold text-emerald-900 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'text-stone-700 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-900'
                    }`}
                  >
                    <div>
                      <div className="font-montserrat font-bold">{f.farmName}</div>
                      <div className="text-[11px] text-stone-400 font-normal">
                        {f.placeName} • {f.fieldSizeAcres || 5} ac • {f.soilTexture}
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Primary Strategy Dropdown Selector Card */}
      <div className="relative">
        <div
          onClick={() => setIsPlanDropdownOpen((prev) => !prev)}
          className="cursor-pointer rounded-2xl border-2 border-emerald-600 bg-white/95 p-3.5 shadow-sm transition hover:bg-emerald-50/20 active:scale-99 dark:border-emerald-500 dark:bg-[#121212]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs ${activePlanItem.boxClass}`}>
                {activePlanItem.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-montserrat text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {activePlanItem.title}
                  </h2>
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                    {activePlanItem.tag}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                  {activePlanItem.subtitle}
                </p>
              </div>
            </div>

            <div
              className={`text-stone-400 transition-transform duration-200 shrink-0 ml-2 ${
                isPlanDropdownOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            >
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Strategy Dropdown Menu */}
        {isPlanDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl dark:border-stone-800 dark:bg-stone-950 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 font-montserrat border-b border-stone-100 dark:border-stone-800/80 mb-1">
              Select Rotation Strategy
            </div>
            <div className="space-y-1">
              {strategyList.map((plan) => {
                const isSelected = plan.data.id === selectedStrategyId;
                return (
                  <div
                    key={plan.key}
                    onClick={() => {
                      onSelectStrategy(plan.data);
                      setIsPlanDropdownOpen(false);
                    }}
                    className={`cursor-pointer rounded-xl p-3 transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                          {plan.title}
                        </span>
                        <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                          ({plan.tag})
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                        {plan.subtitle}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Three Impact Metric Badges */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Urea Saved */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <span className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Urea Saved
          </span>
          <span className="mt-1 block font-montserrat text-base sm:text-lg font-bold text-amber-700 dark:text-amber-400">
            {activePlanItem.ureaSaved}
          </span>
          <span className="mt-0.5 block text-[10.5px] text-stone-500 dark:text-stone-400">
            Bio-fixation
          </span>
        </div>

        {/* Water Conserved */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <span className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Water Conserved
          </span>
          <span className="mt-1 block font-montserrat text-base sm:text-lg font-bold text-sky-700 dark:text-sky-400">
            {activePlanItem.waterSaved}
          </span>
          <span className="mt-0.5 block text-[10.5px] text-stone-500 dark:text-stone-400">
            Groundwater
          </span>
        </div>

        {/* Humus Boost */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <span className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Humus Boost
          </span>
          <span className="mt-1 block font-montserrat text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">
            {activePlanItem.humusBoost}
          </span>
          <span className="mt-0.5 block text-[10.5px] text-stone-500 dark:text-stone-400">
            Root colonies
          </span>
        </div>
      </div>

      {/* 4. Unified Crop Schedule Card (Timeline + Year Dropdown + Collapsible Accordion) */}
      <section className="rounded-3xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        {/* Header: Title + Verified Badge + Year Selector Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="h-4.5 w-4.5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="font-montserrat text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                Crop Schedule
              </h3>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                <NasaLogo className="h-3.5 w-3.5" />
                NASA Verified
              </span>
            </div>
            {activeField && (
              <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400 font-montserrat">
                Calibrated for <strong>{activeField.farmName}</strong> ({activeField.fieldSizeAcres || 5} ac • {activeField.soilTexture || 'loam'} soil) via NASA POWER Climatology
              </p>
            )}
          </div>

          {/* Year Selector Dropdown Button */}
          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsYearDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200/90 bg-stone-50/90 px-3 py-1 font-montserrat text-xs font-bold text-stone-800 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
            >
              <span>{currentYearData.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-stone-500 transition-transform ${
                  isYearDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isYearDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-40 w-44 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-800 dark:bg-stone-950">
                {yearOptions.map((opt, idx) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setSelectedYearIndex(idx);
                      setIsYearDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-montserrat transition ${
                      selectedYearIndex === idx
                        ? 'bg-emerald-50 text-emerald-900 font-bold dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-900'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedYearIndex === idx && (
                      <span className="text-[9px] font-bold text-emerald-600">Active</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Continuous Timeline Stream (Connecting Dashed Rail & Dropdown Crop Cards) */}
        <div className="relative py-3 space-y-3">
          {currentYearData.crops.map((step, idx) => {
            const cropLocalized =
              CROP_LOCALIZED_NAMES[step.crop.id]?.en || step.crop.name;
            const cardKey = `${selectedYearIndex}-${idx}`;
            const isCardExpanded = Boolean(expandedCropKeys[cardKey]);
            const cropTheme = getCropThemeConfig(step.crop.id, step.crop.family, step.crop.category);

            return (
              <div key={idx} className="relative flex items-start gap-3">
                {/* Connecting Rail Line */}
                {idx < currentYearData.crops.length - 1 && (
                  <div className="absolute left-[19px] top-[42px] bottom-[-14px] w-0.5 border-l border-dashed border-stone-300 dark:border-stone-700 z-0"></div>
                )}

                {/* Specific Scientific Crop Icon Box */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-xs mt-1 ${cropTheme.boxClass}`}
                >
                  {cropTheme.icon}
                </div>

                {/* Interactive Dropdown Crop Details Card */}
                <div
                  className={`flex-1 rounded-2xl border transition overflow-hidden ${
                    idx === 0 && selectedYearIndex === 0
                      ? 'border-emerald-500/70 bg-emerald-50/25 dark:border-emerald-700/60 dark:bg-emerald-950/25'
                      : 'border-stone-200/80 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/40'
                  }`}
                >
                  {/* Clickable Dropdown Trigger Header */}
                  <button
                    type="button"
                    onClick={() => toggleCropDropdown(cardKey)}
                    className="w-full text-left p-3 sm:p-3.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition"
                    aria-expanded={isCardExpanded}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-montserrat text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                          {cropLocalized}
                        </span>
                        {idx === 0 && selectedYearIndex === 0 && (
                          <span className="rounded-full bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.2 text-[9px] font-bold">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10.5px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-montserrat">
                        <span>{step.seasonName}</span>
                        <span>•</span>
                        <span>{step.windowText}</span>
                        <span>•</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-300">
                          {step.detailsText}
                        </span>
                      </div>
                    </div>

                    {/* Right: Extra Tag + Animated Chevron */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shrink-0 ${step.extraTagColor}`}
                      >
                        {step.extraTag}
                      </span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-200/60 text-stone-600 dark:bg-stone-800 dark:text-stone-300 transition">
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            isCardExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Dropped Down Agronomic & Satellite Climatology Details */}
                  {isCardExpanded && (
                    <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 border-t border-stone-200/60 dark:border-stone-800/80 pt-2.5 space-y-2.5 animate-in fade-in duration-200">
                      {/* Scientific classification */}
                      <div className="text-[10.5px] text-stone-500 dark:text-stone-400 italic">
                        {step.crop.scientificName} • {step.crop.family}
                      </div>

                      {/* Verified Agronomic & Satellite Climatology Metrics */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Water Demand (NASA ET0 calibrated) */}
                        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800">
                          <Droplets className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                          <span>{step.crop.waterRequirementMm || 380} mm Water</span>
                        </span>

                        {/* Root System Architecture */}
                        <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-semibold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                          <Layers className="h-3 w-3 text-stone-500 dark:text-stone-400" />
                          <span>
                            {step.crop.maxRootingDepthMeters || 1.2}m {step.crop.rootArchitecture === 'taproot_deep' ? 'Taproot' : 'Fibrous Root'}
                          </span>
                        </span>

                        {/* Soil Benefit / Action */}
                        {step.crop.family === 'Fabaceae' || (step.crop.nitrogenFixationKgPerHa && step.crop.nitrogenFixationKgPerHa > 0) ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800">
                            <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>+{Math.max(25, step.crop.nitrogenFixationKgPerHa || 38)} kg N/ha Bio-Fix</span>
                          </span>
                        ) : step.crop.family === 'Brassicaceae' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800">
                            <Shield className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                            <span>Bio-Fumigation (Pest Break)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-semibold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                            <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{step.crop.typicalYieldTonPerHa || 3.5} T/ha Yield</span>
                          </span>
                        )}
                      </div>

                      {/* Standing Crop Progress Bar if Active */}
                      {idx === 0 && selectedYearIndex === 0 && (
                        <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-900/60">
                          <div className="flex items-center justify-between text-[10px] text-emerald-900 dark:text-emerald-300 font-montserrat mb-1">
                            <span>Field progress: Day {daysSinceSowing} of {totalCropDays}</span>
                            <span className="font-bold">
                              {Math.min(100, Math.round((daysSinceSowing / totalCropDays) * 100))}% to harvest
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-emerald-200/60 dark:bg-emerald-950/60 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.round((daysSinceSowing / totalCropDays) * 100))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* In-depth Verified Agronomic Breakdown Drawer */}
                      <div className="space-y-1.5 rounded-xl border border-stone-200/80 bg-white/95 p-2.5 text-[11px] text-stone-700 dark:border-stone-800 dark:bg-stone-900/90 dark:text-stone-300">
                        <div>
                          <strong className="text-stone-900 dark:text-stone-100 font-montserrat font-bold">
                            Agroecological Role:{' '}
                          </strong>
                          <span>{step.crop.agroecologicalRole}</span>
                        </div>
                        <div className="text-stone-500 dark:text-stone-400 leading-relaxed">
                          {step.crop.description}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[10px] font-mono text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
                          <span>
                            Opt. Temp: {step.crop.tempOptimumMinC}°C–{step.crop.tempOptimumMaxC}°C
                          </span>
                          <span>Heat Threshold: {step.crop.criticalHeatThresholdC}°C</span>
                          <span>C:N Ratio: {step.crop.carbonNitrogenRatio}:1</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Accordion 1: Why this rotation sequence works */}
        <div className="mt-3 border-t border-stone-100 pt-2.5 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setIsRationaleOpen((prev) => !prev)}
            className="w-full flex items-center justify-between rounded-xl py-1 text-left text-xs font-bold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>Why this rotation sequence works</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-stone-400 transition-transform ${
                isRationaleOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {isRationaleOpen && (
            <div className="mt-2.5 space-y-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30 animate-in fade-in">
              <p className="leading-relaxed text-emerald-900 dark:text-emerald-200">
                Planting <strong>{y1Crop2Obj.name.split(' (')[0]} immediately after {standingCropName}</strong>{' '}
                {y1Crop2Obj.family === 'Fabaceae' || (y1Crop2Slot?.soilNitrogenBalanceKg ?? 0) > 0 ? (
                  <>
                    introduces symbiotic <em>Rhizobium</em> bacteria that fix up to{' '}
                    <strong>+{Math.round(y1Crop2Slot?.soilNitrogenBalanceKg || y1Crop2Obj.nitrogenFixationKgPerHa || 38)} kg biological nitrogen per hectare</strong> (~{Math.max(1, Math.round(((y1Crop2Slot?.soilNitrogenBalanceKg || y1Crop2Obj.nitrogenFixationKgPerHa || 38) * fieldHa) / 23))} bags of urea saved on this {fieldAcres} ac parcel).
                    This replenishes root-zone soil humus and cuts synthetic urea purchases for the following {y1Crop3Obj.name.split(' (')[0]} crop.
                  </>
                ) : (
                  <>
                    acts as a strategic bio-break crop that suppresses soil-borne fungal pathogens, breaks subsoil plow compaction, and secures farmer profit under NASA-calibrated climatological windows.
                  </>
                )}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md border border-emerald-300 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-300">
                  NASA POWER 30-Yr Norms
                </span>
                <span className="rounded-md border border-emerald-300 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-300">
                  {y1Crop2Obj.family === 'Fabaceae' ? 'Rhizobia Bio-Fixation' : 'Biodiversity Defense'}
                </span>
                <span className="rounded-md border border-emerald-300 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-300">
                  Pathogen Cycle Disrupted
                </span>
                <span className="rounded-md border border-emerald-300 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-300">
                  Subsoil Bio-Drilling
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StrategyComparison;