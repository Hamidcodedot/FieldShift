import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  RefreshCw,
  CheckCircle2,
  Calendar,
  MapPin,
  CloudDrizzle,
  CloudLightning,
  ArrowRight,
} from 'lucide-react';
import { FarmerFieldProfile } from '../types';
import {
  fetchField5DayWeather,
  Field5DayWeather,
  DailyForecastDay,
} from '../services/weatherService';

interface FieldWeatherConditionsProps {
  activeField: FarmerFieldProfile;
  onNavigateToWeather?: () => void;
}

export const FieldWeatherConditions: React.FC<FieldWeatherConditionsProps> = ({
  activeField,
  onNavigateToWeather,
}) => {
  const [weather, setWeather] = useState<Field5DayWeather | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadWeather = async (forceRefresh = false) => {
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
      console.warn('Error loading 5-day field weather:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(false);
  }, [activeField.id, activeField.latitude, activeField.longitude]);

  // Helper to render condition icon cleanly
  const renderConditionIcon = (category: DailyForecastDay['conditionCategory']) => {
    switch (category) {
      case 'sunny':
        return <Sun className="h-6 w-6 text-amber-500" />;
      case 'partly_cloudy':
        return <CloudSun className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'cloudy':
        return <Cloud className="h-6 w-6 text-stone-500" />;
      case 'rain':
        return <CloudRain className="h-6 w-6 text-sky-600 dark:text-sky-400" />;
      case 'drizzle':
        return <CloudDrizzle className="h-6 w-6 text-sky-500" />;
      case 'storm':
        return <CloudLightning className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <CloudSun className="h-6 w-6 text-stone-600" />;
    }
  };

  return (
    <div className="card-chai p-4 sm:p-5">
      {/* Header with Title & Field Coordinates */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-900/15 bg-stone-50 text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200">
            <CloudSun className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-montserrat text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
                5-day field weather conditions
              </h2>
              <span className="flex items-center gap-1 rounded border border-emerald-300/80 bg-emerald-50 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Forecast
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-montserrat">
              Atmospheric & crop water demand forecast for{' '}
              <strong className="text-stone-700 dark:text-stone-300">
                {activeField.farmName}
              </strong>
            </p>
          </div>
        </div>

        {/* Location & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-stone-200/80 bg-stone-50/70 px-2.5 py-1 text-[11px] text-stone-600 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400">
            <MapPin className="h-3 w-3 text-stone-500" />
            <span className="font-mono text-[10px]">
              {activeField.latitude.toFixed(2)}°N, {activeField.longitude.toFixed(2)}°E
            </span>
          </div>

          <button
            type="button"
            onClick={() => loadWeather(true)}
            disabled={isRefreshing || isLoading}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-stone-200/80 bg-stone-50 text-stone-600 hover:bg-stone-100 active:scale-95 disabled:opacity-50 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-400"
            title="Refresh 5-day weather data"
            aria-label="Refresh weather data"
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && !weather && (
        <div className="mt-4 space-y-3 py-6">
          <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
            <RefreshCw className="h-4 w-4 animate-spin text-stone-400" />
            <span>Fetching real-time agricultural weather for your coordinates...</span>
          </div>
        </div>
      )}

      {/* Current Real-Time Conditions Snapshot */}
      {weather && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {/* Live Temp */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-[11px] font-medium">Field temperature</span>
                <Thermometer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-montserrat text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  {weather.current.temperatureC}°
                </span>
                <span className="text-xs text-stone-500">C</span>
              </div>
              <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400 truncate">
                {weather.current.conditionLabel}
              </p>
            </div>

            {/* Relative Humidity */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-[11px] font-medium">Relative humidity</span>
                <Droplets className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-montserrat text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  {weather.current.relativeHumidity}%
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                {weather.current.relativeHumidity < 35
                  ? 'Dry air: check soil crust'
                  : weather.current.relativeHumidity < 70
                  ? 'Balanced humidity'
                  : 'High humidity: fungal watch'}
              </p>
            </div>

            {/* 10m Wind Speed */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-[11px] font-medium">Surface wind</span>
                <Wind className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-montserrat text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  {weather.current.windSpeedKmH}
                </span>
                <span className="text-[11px] text-stone-500">km/h</span>
              </div>
              <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                {weather.current.windSpeedKmH < 12 ? 'Calm (ideal for spray)' : 'Moderate air currents'}
              </p>
            </div>

            {/* Daily ET0 Evapotranspiration */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span className="text-[11px] font-medium">Daily ET0 water loss</span>
                <Gauge className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-montserrat text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  {weather.current.et0TodayMm}
                </span>
                <span className="text-[11px] text-stone-500">mm/day</span>
              </div>
              <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                FAO-56 reference crop rate
              </p>
            </div>
          </div>

          {/* 5-Day Forecast Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-stone-500" />
                5-Day Daily Progression
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">
                Updated {weather.lastFetchedAt}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {weather.daily.map((day, idx) => {
                const isToday = idx === 0;

                return (
                  <div
                    key={day.date}
                    className={`flex flex-col justify-between rounded-xl border p-3 transition ${
                      isToday
                        ? 'border-stone-900 bg-stone-100/90 dark:border-stone-100 dark:bg-stone-900/80 ring-1 ring-stone-900/20'
                        : 'border-stone-200/80 bg-stone-50/70 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/40'
                    }`}
                  >
                    <div>
                      {/* Day Label & Date */}
                      <div className="flex items-center justify-between">
                        <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                          {day.dayLabel}
                        </span>
                        <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 font-montserrat">
                          {day.formattedDate}
                        </span>
                      </div>

                      {/* Condition Icon & Label */}
                      <div className="my-2.5 flex items-center gap-2">
                        {renderConditionIcon(day.conditionCategory)}
                        <span className="text-xs font-medium text-stone-800 dark:text-stone-200 leading-tight">
                          {day.conditionLabel.split(' (')[0]}
                        </span>
                      </div>

                      {/* Temperature Range */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-montserrat text-base font-bold text-stone-900 dark:text-stone-100">
                          {day.tempMax}°
                        </span>
                        <span className="font-montserrat text-xs text-stone-500 dark:text-stone-400">
                          / {day.tempMin}°C
                        </span>
                      </div>

                      {/* Rain Probability & Volume */}
                      <div className="mt-2 flex items-center justify-between text-[11px] border-t border-stone-200/60 pt-2 dark:border-stone-800/80">
                        <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <CloudRain className="h-3 w-3 text-sky-600" />
                          Rain:
                        </span>
                        <span
                          className={`font-semibold font-montserrat ${
                            day.precipitationProbability > 30
                              ? 'text-sky-700 dark:text-sky-400'
                              : 'text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {day.precipitationMm > 0 ? `${day.precipitationMm} mm` : `${day.precipitationProbability}%`}
                        </span>
                      </div>

                      {/* ET0 Rate */}
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <Gauge className="h-3 w-3 text-emerald-700" />
                          ET0:
                        </span>
                        <span className="font-medium text-stone-700 dark:text-stone-300 font-mono text-[10px]">
                          {day.et0Mm} mm
                        </span>
                      </div>
                    </div>

                    {/* Agricultural Action Tag */}
                    <div className="mt-3">
                      <span
                        className={`block rounded-md border px-2 py-1 text-center text-[10px] font-semibold leading-tight ${
                          day.farmActionType === 'alert'
                            ? 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            : day.farmActionType === 'warning'
                            ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {day.farmActionTag}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High-Level 5-Day Farm Operational Outlook Banner */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3.5 dark:border-stone-800 dark:bg-stone-900/50">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
                <CheckCircle2 className="h-3 w-3" />
              </div>
              <div>
                <h4 className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100">
                  5-Day Operational Agronomic Outlook
                </h4>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {weather.summaryHeadline}{' '}
                  <span className="font-semibold text-stone-900 dark:text-stone-100">
                    Total 5-day rain: {weather.total5DayPrecipMm.toFixed(1)} mm. Thermal peak: {weather.peakTempC}°C.
                  </span>
                </p>
                {onNavigateToWeather && (
                  <div className="mt-2.5">
                    <button
                      onClick={onNavigateToWeather}
                      className="btn-asym inline-flex h-8 items-center gap-1.5 bg-stone-900 px-3 font-montserrat text-xs font-semibold text-white transition hover:bg-stone-800 active:scale-95 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
                    >
                      <span>Open full weather & spray advisory</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
