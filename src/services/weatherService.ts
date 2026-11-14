import { findClosestRegion } from './nasaService';

export interface DailyForecastDay {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Today", "Mon", "Tue"
  formattedDate: string; // e.g. "Nov 4"
  tempMax: number; // °C
  tempMin: number; // °C
  precipitationMm: number; // mm
  precipitationProbability: number; // %
  weatherCode: number; // WMO code
  conditionLabel: string;
  conditionCategory: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'drizzle' | 'storm' | 'fog';
  et0Mm: number; // FAO-56 Reference Evapotranspiration
  windSpeedKmH: number; // 10m wind speed
  farmActionTag: string;
  farmActionType: 'safe' | 'alert' | 'warning' | 'neutral';
}

export interface CurrentWeather {
  temperatureC: number;
  relativeHumidity: number;
  weatherCode: number;
  conditionLabel: string;
  conditionCategory: 'sunny' | 'partly_cloudy' | 'cloudy' | 'rain' | 'drizzle' | 'storm' | 'fog';
  windSpeedKmH: number;
  precipitationMm: number;
  et0TodayMm: number;
}

export interface Field5DayWeather {
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  daily: DailyForecastDay[];
  summaryHeadline: string;
  total5DayPrecipMm: number;
  peakTempC: number;
  lowestTempC: number;
  lastFetchedAt: string;
  source: 'live' | 'cached' | 'fallback';
}

const weatherCache = new Map<string, Field5DayWeather>();

function snapCoords(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

export function parseWmoCode(code: number): {
  label: string;
  category: DailyForecastDay['conditionCategory'];
} {
  switch (code) {
    case 0:
      return { label: 'Clear Sky (Sunny)', category: 'sunny' };
    case 1:
      return { label: 'Mainly Clear', category: 'partly_cloudy' };
    case 2:
      return { label: 'Partly Cloudy', category: 'partly_cloudy' };
    case 3:
      return { label: 'Overcast Skies', category: 'cloudy' };
    case 45:
    case 48:
      return { label: 'Fog / Mist', category: 'fog' };
    case 51:
    case 53:
    case 55:
      return { label: 'Light Drizzle', category: 'drizzle' };
    case 61:
      return { label: 'Slight Rain', category: 'rain' };
    case 63:
      return { label: 'Moderate Rain', category: 'rain' };
    case 65:
      return { label: 'Heavy Rain', category: 'rain' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', category: 'rain' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorms', category: 'storm' };
    default:
      return { label: 'Fair Skies', category: 'partly_cloudy' };
  }
}

function determineFarmAction(
  prob: number,
  precipMm: number,
  windSpeed: number,
  et0: number
): { tag: string; type: DailyForecastDay['farmActionType'] } {
  if (prob >= 45 || precipMm >= 2.0) {
    return {
      tag: 'Rain alert: Delay irrigation',
      type: 'alert',
    };
  }
  if (windSpeed >= 18) {
    return {
      tag: 'Breezy: Avoid spray drift',
      type: 'warning',
    };
  }
  if (et0 >= 4.5) {
    return {
      tag: 'High crop water loss (ET0)',
      type: 'warning',
    };
  }
  return {
    tag: 'Optimal spraying & field window',
    type: 'safe',
  };
}

export async function fetchField5DayWeather(
  lat: number,
  lon: number,
  forceRefresh = false
): Promise<Field5DayWeather> {
  const cacheKey = snapCoords(lat, lon);

  // 1. Check in-memory cache
  if (!forceRefresh && weatherCache.has(cacheKey)) {
    return weatherCache.get(cacheKey)!;
  }

  // 2. Check localStorage cache
  if (!forceRefresh) {
    try {
      const saved = localStorage.getItem(`fieldshift_weather_${cacheKey}`);
      if (saved) {
        const parsed = JSON.parse(saved) as Field5DayWeather;
        weatherCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  // 3. Fetch from Open-Meteo High-Resolution Agricultural Weather API
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,et0_fao_evapotranspiration,wind_speed_10m_max&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=auto&forecast_days=5`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const currentRaw = data.current || {};
      const dailyRaw = data.daily || {};

      const currentParsed = parseWmoCode(currentRaw.weather_code ?? 0);
      const et0Today = Number(dailyRaw.et0_fao_evapotranspiration?.[0] ?? 3.5);

      const currentWeather: CurrentWeather = {
        temperatureC: Math.round(Number(currentRaw.temperature_2m ?? 24) * 10) / 10,
        relativeHumidity: Math.round(Number(currentRaw.relative_humidity_2m ?? 50)),
        weatherCode: currentRaw.weather_code ?? 0,
        conditionLabel: currentParsed.label,
        conditionCategory: currentParsed.category,
        windSpeedKmH: Math.round(Number(currentRaw.wind_speed_10m ?? 8) * 10) / 10,
        precipitationMm: Number(currentRaw.precipitation ?? 0),
        et0TodayMm: Math.round(et0Today * 10) / 10,
      };

      const daysCount = (dailyRaw.time || []).length;
      const dailyForecasts: DailyForecastDay[] = [];

      for (let i = 0; i < Math.min(5, daysCount); i++) {
        const dateStr = dailyRaw.time[i];
        const dateObj = new Date(dateStr + 'T00:00:00');
        const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const maxT = Math.round(Number(dailyRaw.temperature_2m_max?.[i] ?? 30) * 10) / 10;
        const minT = Math.round(Number(dailyRaw.temperature_2m_min?.[i] ?? 18) * 10) / 10;
        const precipMm = Math.round(Number(dailyRaw.precipitation_sum?.[i] ?? 0) * 10) / 10;
        const precipProb = Math.round(Number(dailyRaw.precipitation_probability_max?.[i] ?? 0));
        const wCode = Number(dailyRaw.weather_code?.[i] ?? 0);
        const et0 = Math.round(Number(dailyRaw.et0_fao_evapotranspiration?.[i] ?? 3.5) * 10) / 10;
        const wind = Math.round(Number(dailyRaw.wind_speed_10m_max?.[i] ?? 10) * 10) / 10;

        const { label, category } = parseWmoCode(wCode);
        const { tag, type } = determineFarmAction(precipProb, precipMm, wind, et0);

        dailyForecasts.push({
          date: dateStr,
          dayLabel: dayName,
          formattedDate,
          tempMax: maxT,
          tempMin: minT,
          precipitationMm: precipMm,
          precipitationProbability: precipProb,
          weatherCode: wCode,
          conditionLabel: label,
          conditionCategory: category,
          et0Mm: et0,
          windSpeedKmH: wind,
          farmActionTag: tag,
          farmActionType: type,
        });
      }

      const totalPrecip = dailyForecasts.reduce((acc, d) => acc + d.precipitationMm, 0);
      const peakTemp = Math.max(...dailyForecasts.map((d) => d.tempMax));
      const lowestTemp = Math.min(...dailyForecasts.map((d) => d.tempMin));

      let headline = '';
      if (totalPrecip > 5) {
        headline = `5-day outlook: ${totalPrecip.toFixed(1)} mm total precipitation forecasted. Hold off on heavy tubewell pumping.`;
      } else if (peakTemp >= 35) {
        headline = `5-day outlook: High heat days reaching ${peakTemp}°C. Monitor soil moisture to protect flowering canopy.`;
      } else {
        headline = `5-day outlook: Favorable dry conditions with mild winds. Excellent window for fertilizer side-dressing and weeding.`;
      }

      const now = new Date();
      const lastFetchedAt =
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const weatherResult: Field5DayWeather = {
        latitude: lat,
        longitude: lon,
        current: currentWeather,
        daily: dailyForecasts,
        summaryHeadline: headline,
        total5DayPrecipMm: Math.round(totalPrecip * 10) / 10,
        peakTempC: peakTemp,
        lowestTempC: lowestTemp,
        lastFetchedAt,
        source: 'live',
      };

      weatherCache.set(cacheKey, weatherResult);
      try {
        localStorage.setItem(`fieldshift_weather_${cacheKey}`, JSON.stringify(weatherResult));
      } catch {
        // quota exceeded
      }

      return weatherResult;
    }
  } catch (err) {
    console.warn('Open-Meteo live weather fetch failed, constructing calibrated fallback:', err);
  }

  // 4. Fallback if offline or API unreachable
  const fallback = generateFallbackWeather(lat, lon);
  weatherCache.set(cacheKey, fallback);
  return fallback;
}

function generateFallbackWeather(lat: number, lon: number): Field5DayWeather {
  const closest = findClosestRegion(lat, lon);
  const monthIdx = new Date().getUTCMonth();
  const clim = closest.cachedClimate;
  const meanTemp = clim.temperatureMonthlyMeanC[monthIdx] ?? 24;
  const maxTemp = clim.temperatureMonthlyMaxC[monthIdx] ?? (meanTemp + 5);
  const minTemp = clim.temperatureMonthlyMinC[monthIdx] ?? (meanTemp - 5);
  const monthPrecip = clim.precipitationMonthlyMm[monthIdx] ?? 15;
  const dailyPrecipEst = Math.round((monthPrecip / 30) * 10) / 10;
  const solarRad = clim.solarRadiationMonthlyMjPerM2[monthIdx] ?? 18;
  const et0Est = Math.round((solarRad * 0.18 + meanTemp * 0.04) * 10) / 10; // FAO-56 radiation-temperature proxy

  const days: DailyForecastDay[] = [];
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isRainLikely = dailyPrecipEst > 2.0;

    days.push({
      date: dateStr,
      dayLabel,
      formattedDate,
      tempMax: Math.round((maxTemp - i * 0.3) * 10) / 10,
      tempMin: Math.round((minTemp - i * 0.2) * 10) / 10,
      precipitationMm: isRainLikely ? dailyPrecipEst : 0,
      precipitationProbability: isRainLikely ? 45 : 5,
      weatherCode: isRainLikely ? 61 : 0,
      conditionLabel: isRainLikely ? 'Slight Rain' : 'Clear Sky (Sunny)',
      conditionCategory: isRainLikely ? 'rain' : 'sunny',
      et0Mm: et0Est,
      windSpeedKmH: 7.5,
      farmActionTag: 'Calibrated climatology window',
      farmActionType: 'safe',
    });
  }

  return {
    latitude: lat,
    longitude: lon,
    current: {
      temperatureC: Math.round(meanTemp * 10) / 10,
      relativeHumidity: monthPrecip > 50 ? 68 : 42,
      weatherCode: 0,
      conditionLabel: 'Clear Sky (Sunny)',
      conditionCategory: 'sunny',
      windSpeedKmH: 7.0,
      precipitationMm: 0,
      et0TodayMm: et0Est,
    },
    daily: days,
    summaryHeadline: `5-day agro-climate calibrated for ${closest.name}: Mean temperature ${meanTemp.toFixed(1)}°C with ET0 ${et0Est} mm/d.`,
    total5DayPrecipMm: dailyPrecipEst * 2,
    peakTempC: Math.round(maxTemp),
    lowestTempC: Math.round(minTemp),
    lastFetchedAt: `NASA POWER Climatology (${closest.name})`,
    source: 'fallback',
  };
}
