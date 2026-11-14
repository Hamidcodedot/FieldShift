import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Wind,
  Droplets,
  Gauge,
  RefreshCw,
  CheckCircle2,
  Calendar,
  MapPin,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  FarmerFieldProfile,
  AgroRegion,
  NasaClimateData,
  SoilProfile,
} from '../types';
import { getCropById } from '../data/crops';
import {
  fetchField5DayWeather,
  Field5DayWeather,
  DailyForecastDay,
} from '../services/weatherService';
import { calculateDaysSinceSowing } from '../services/fieldProfileService';
import { ClimateDashboard } from './ClimateDashboard';
import { AppTab } from './BottomNavigation';

interface FarmerWeatherTabProps {
  fields: FarmerFieldProfile[];
  activeField: FarmerFieldProfile;
  onSelectActiveField: (fieldId: string) => void;
  region: AgroRegion;
  climate: NasaClimateData;
  soil: SoilProfile;
  onNavigateTab: (tab: AppTab) => void;
  onOpenChatbot?: () => void;
  onOpenOnboarding?: () => void;
}

export const FarmerWeatherTab: React.FC<FarmerWeatherTabProps> = ({
  fields,
  activeField,
  onSelectActiveField,
  region,
  climate,
  soil: _soil,
  onNavigateTab: _onNavigateTab,
  onOpenChatbot: _onOpenChatbot,
  onOpenOnboarding,
}) => {
  const [weather, setWeather] = useState<Field5DayWeather | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState<boolean>(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isEtAccordionOpen, setIsEtAccordionOpen] = useState<boolean>(false);
  const [isClimatologyOpen, setIsClimatologyOpen] = useState<boolean>(false);

  // Standing crop metadata
  const currentCropId = activeField.currentCropHistory?.currentCropId || 'wheat';
  let standingCrop = null;
  try {
    standingCrop = getCropById(currentCropId);
  } catch {
    // fallback
  }

  const daysSinceSowing = calculateDaysSinceSowing(activeField.sowingDate);

  // Dynamic agro-hydrology calculations
  const currentMonthIdx = new Date().getUTCMonth();
  const rootMoistureVal = Math.round(
    climate?.currentMonthRootZoneWetnessPercent ??
      (climate?.rootZoneSoilMoistureMonthly?.[currentMonthIdx] ? climate.rootZoneSoilMoistureMonthly[currentMonthIdx] * 100 : 42)
  );
  const rootMoistureDesc =
    rootMoistureVal >= 60
      ? 'High subsoil wetness'
      : rootMoistureVal >= 35
      ? 'Adequate subsoil'
      : 'Deficit (Irrigation needed)';

  const currentWind = weather?.current.windSpeedKmH ?? 7;
  const currentTemp = weather?.current.temperatureC ?? 26;
  const isSafeSpray = currentWind < 14 && currentTemp < 34;

  const cropKc = standingCrop?.cropCoefficientKc ?? 1.05;
  const refEt0 = weather?.current.et0TodayMm ?? 3.5;
  const cropEtc = Math.round(refEt0 * cropKc * 10) / 10;
  const availableWaterMm = Math.round(48 * (rootMoistureVal / 100) * 10) / 10;
  const daysAutonomy = Math.max(1, Math.min(14, Math.round(availableWaterMm / Math.max(0.5, cropEtc))));

  const loadWeather = async (forceRefresh = false) => {
    if (!activeField.isConfigured) {
      setWeather(null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await fetchField5DayWeather(
        activeField.latitude,
        activeField.longitude,
        forceRefresh
      );
      setWeather(data);
    } catch (err) {
      console.warn('Error fetching weather data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(false);
  }, [activeField.id, activeField.latitude, activeField.longitude]);

  const renderWeatherIcon = (
    category: DailyForecastDay['conditionCategory'],
    size = 'h-5 w-5'
  ) => {
    switch (category) {
      case 'sunny':
        return <Sun className={`${size} text-amber-500`} />;
      case 'partly_cloudy':
        return <CloudSun className={`${size} text-amber-600 dark:text-amber-400`} />;
      case 'cloudy':
        return <Cloud className={`${size} text-stone-500`} />;
      case 'rain':
        return <CloudRain className={`${size} text-sky-600 dark:text-sky-400`} />;
      case 'drizzle':
        return <CloudDrizzle className={`${size} text-sky-500`} />;
      case 'storm':
        return <CloudLightning className={`${size} text-indigo-600 dark:text-indigo-400`} />;
      default:
        return <CloudSun className={`${size} text-stone-600`} />;
    }
  };

  const selectedDay = weather?.daily[selectedDayIndex] || weather?.daily[0];

  // Awaiting Field Location Empty State
  if (!activeField.isConfigured) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 text-center shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200/80 bg-stone-50 text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
            <CloudSun className="h-7 w-7 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="mt-4">
            <h2 className="font-brand text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Field Coordinates Required
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
              Precision agricultural micro-forecasts and foliar spray windows require setting up your field coordinates.
            </p>
          </div>

          {onOpenOnboarding && (
            <div className="mt-5">
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-stone-900 px-5 py-2 font-montserrat text-xs font-semibold text-white transition hover:bg-stone-800 active:scale-95 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
              >
                <Sparkles className="h-4 w-4" />
                <span>Configure field location</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Top Header Row: Title & Refresh button */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h1 className="font-brand text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Weather
          </h1>
          <p className="font-montserrat text-xs text-stone-500 dark:text-stone-400">
            Live Satellite & Agro-Met
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadWeather(true)}
          disabled={isRefreshing || isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/90 bg-white/95 text-stone-700 shadow-xs transition hover:bg-stone-50 active:scale-95 disabled:opacity-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
          title="Refresh live weather observation"
          aria-label="Refresh Weather"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
          />
        </button>
      </div>

      {/* 1. Field Selector Context Strip */}
      <div className="relative rounded-2xl border border-stone-200/90 bg-white/95 px-3.5 py-2.5 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-1 flex-1">
            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
              {activeField.farmName}
            </span>
            <span className="text-stone-300 dark:text-stone-700 shrink-0">•</span>
            <span className="shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {activeField.fieldSizeAcres || 5.2} ac
            </span>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-700 shrink-0">•</span>
            <span className="hidden sm:inline text-[11px] text-stone-500 dark:text-stone-400 truncate">
              Sown {standingCrop?.name || 'Wheat'}
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

        {/* Field Dropdown Popover */}
        {isFieldDropdownOpen && fields && fields.length > 0 && onSelectActiveField && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-800 dark:bg-stone-950">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 font-montserrat border-b border-stone-100 dark:border-stone-800/80 mb-1">
              Select Field Parcel
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {fields.map((f) => {
                const isActive = f.id === activeField.id;
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
                        {f.placeName} • {f.fieldSizeAcres || 5} ac
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Atmospheric Hero Card */}
      <div className="rounded-3xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-brand text-4xl sm:text-5xl font-extrabold text-stone-900 dark:text-stone-100 leading-none">
                {weather?.current.temperatureC ?? 28}°
              </span>
              <span className="font-montserrat text-xl font-bold text-stone-400">C</span>
            </div>

            <h3 className="mt-2 font-montserrat text-sm font-bold text-stone-800 dark:text-stone-200">
              {weather?.current.conditionLabel ?? 'Clear & Sunny'}
            </h3>
            <p className="text-[11.5px] text-stone-500 dark:text-stone-400 font-montserrat">
              High {weather?.peakTempC ?? 31}° • Low {weather?.lowestTempC ?? 19}°C
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/90 text-amber-600 shadow-xs dark:border-amber-900/60 dark:from-amber-950/40 dark:to-amber-900/20 dark:text-amber-400">
            <Sun className="h-9 w-9" />
          </div>
        </div>

        {/* Spray Window Banner */}
        <div className={`mt-4 rounded-2xl border p-3 flex items-center gap-2.5 ${
          isSafeSpray
            ? 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/40'
            : 'border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/40'
        }`}>
          <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 ${isSafeSpray ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`} />
          <div className="min-w-0">
            <h4 className={`font-montserrat text-xs font-bold ${isSafeSpray ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'}`}>
              {isSafeSpray ? 'Safe Foliar Spray Window' : 'Caution: Elevated Spray Drift Risk'}
            </h4>
            <p className={`text-[11px] leading-snug ${isSafeSpray ? 'text-emerald-800/90 dark:text-emerald-300/90' : 'text-amber-800/90 dark:text-amber-300/90'}`}>
              Winds {currentWind} km/h • Temp {currentTemp}°C. {isSafeSpray ? 'Calm atmospheric boundary layer. High efficiency window for foliar nutrient uptake.' : 'Breeze exceeds safe application threshold. Defer spraying to prevent droplet drift.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. 4-Metrics Agro-Meteorology Grid (2x2) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Metric 1: Root Moisture */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <div className="flex items-center justify-between text-stone-400">
            <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider">
              Root Moisture
            </span>
            <Droplets className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="mt-1 block font-montserrat text-lg font-bold text-stone-900 dark:text-stone-100">
            {rootMoistureVal}%
          </span>
          <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
            {rootMoistureDesc}
          </span>
        </div>

        {/* Metric 2: Crop ET0 */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <div className="flex items-center justify-between text-stone-400">
            <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider">
              Crop ET0
            </span>
            <Gauge className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <span className="mt-1 block font-montserrat text-lg font-bold text-stone-900 dark:text-stone-100">
            {weather?.current.et0TodayMm ?? 3.8} mm/d
          </span>
          <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
            FAO-56 water loss
          </span>
        </div>

        {/* Metric 3: Humidity */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <div className="flex items-center justify-between text-stone-400">
            <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider">
              Humidity
            </span>
            <Cloud className="h-3.5 w-3.5 text-stone-500" />
          </div>
          <span className="mt-1 block font-montserrat text-lg font-bold text-stone-900 dark:text-stone-100">
            {weather?.current.relativeHumidity ?? 38}%
          </span>
          <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
            Moderate canopy
          </span>
        </div>

        {/* Metric 4: Surface Wind */}
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 p-3 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <div className="flex items-center justify-between text-stone-400">
            <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider">
              Surface Wind
            </span>
            <Wind className="h-3.5 w-3.5 text-stone-500" />
          </div>
          <span className="mt-1 block font-montserrat text-lg font-bold text-stone-900 dark:text-stone-100">
            {weather?.current.windSpeedKmH ?? 7} km/h
          </span>
          <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
            Calm drift conditions
          </span>
        </div>
      </div>

      {/* 4. 5-Day Precision Daily Forecast List */}
      <section className="rounded-3xl border border-stone-200/90 bg-white/95 p-4 sm:p-5 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-montserrat text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              5-Day Micro-Forecast
            </h3>
          </div>
          <span className="text-[10.5px] text-stone-400 font-montserrat">
            Tap day for details
          </span>
        </div>

        {/* Forecast Rows */}
        <div className="mt-3 space-y-1.5">
          {weather?.daily.map((day, idx) => {
            const isToday = idx === 0;
            const isSelected = idx === selectedDayIndex;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`cursor-pointer rounded-xl border p-2.5 transition grid grid-cols-[46px_1fr_32px_64px] sm:grid-cols-[52px_1fr_36px_72px] items-center gap-1.5 text-xs font-montserrat ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/40'
                    : isToday
                    ? 'border-stone-200 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/50'
                    : 'border-transparent hover:bg-stone-50 dark:hover:bg-stone-900/40'
                }`}
              >
                {/* Day label */}
                <div className="font-bold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                  {isToday ? 'Today' : day.dayLabel}
                </div>

                {/* Condition Icon + Label */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {renderWeatherIcon(day.conditionCategory, 'h-4 w-4 shrink-0')}
                  <span className="text-[10.5px] sm:text-[11px] text-stone-700 dark:text-stone-300 leading-tight">
                    {day.conditionLabel.split(' (')[0]}
                  </span>
                </div>

                {/* Rain probability */}
                <div className="text-[10.5px] text-sky-700 dark:text-sky-400 font-semibold text-center whitespace-nowrap">
                  {day.precipitationProbability > 0 ? `${day.precipitationProbability}%` : '0%'}
                </div>

                {/* Temp range */}
                <div className="font-bold text-stone-900 dark:text-stone-100 text-right whitespace-nowrap">
                  {day.tempMax}°{' '}
                  <span className="font-normal text-stone-400 text-[10.5px]">/ {day.tempMin}°</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Details Strip */}
        {selectedDay && (
          <div className="mt-3 rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40 text-xs">
            <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
              <span>{selectedDay.dayLabel} Advisory</span>
              <span className="text-[10.5px] text-stone-500 font-normal">
                ET0: {selectedDay.et0Mm} mm/day
              </span>
            </div>
            <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
              {selectedDay.windSpeedKmH < 12 && selectedDay.precipitationProbability < 25
                ? 'Calm atmospheric boundary layer. High efficiency window for micronutrient foliar spraying.'
                : 'Elevated breeze or rain risk. Defer spraying to prevent droplet drift outside your parcel.'}
            </p>
          </div>
        )}
      </section>

      {/* 5. Collapsible Accordions: ET0 & Seasonal Climatology */}
      <div className="space-y-2">
        {/* Accordion 1: Evapotranspiration */}
        <div className="rounded-3xl border border-stone-200/90 bg-white/95 p-4 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <button
            type="button"
            onClick={() => setIsEtAccordionOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <div>
                <span>Evapotranspiration & Water Balance</span>
                <span className="block text-[10.5px] font-normal text-stone-500 dark:text-stone-400">
                  FAO-56 Penman-Monteith crop coefficients
                </span>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-stone-400 transition-transform ${
                isEtAccordionOpen ? 'rotate-180 text-emerald-600' : ''
              }`}
            />
          </button>

          {isEtAccordionOpen && (
            <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30 animate-in fade-in space-y-2">
              <p className="leading-relaxed text-emerald-950 dark:text-emerald-200">
                Standing crop <strong>{standingCrop?.name || 'Wheat'}</strong> (FAO-56 Kc: {cropKc}) is at day {daysSinceSowing || 35} of its cycle.
                Calibrated crop transpiration demand (ETc) is <strong>{cropEtc} mm/day</strong> based on reference ET0 ({refEt0} mm/day).
                Subsoil moisture reserves on {activeField.soilTexture || 'loam'} soil provide approximately <strong>{daysAutonomy} days</strong> of water autonomy before supplemental irrigation is required.
              </p>
            </div>
          )}
        </div>

        {/* Accordion 2: NASA Climatology Dashboard */}
        <div className="rounded-3xl border border-stone-200/90 bg-white/95 p-4 shadow-xs dark:border-stone-800 dark:bg-[#121212]">
          <button
            type="button"
            onClick={() => setIsClimatologyOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <div>
                <span>Seasonal Climatology (NASA MERRA-2)</span>
                <span className="block text-[10.5px] font-normal text-stone-500 dark:text-stone-400">
                  40-Year satellite climate norms
                </span>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-stone-400 transition-transform ${
                isClimatologyOpen ? 'rotate-180 text-sky-600' : ''
              }`}
            />
          </button>

          {isClimatologyOpen && (
            <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 animate-in fade-in">
              <ClimateDashboard climate={climate} region={region} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerWeatherTab;