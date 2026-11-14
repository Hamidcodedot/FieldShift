import { NasaClimateData } from '../types';
import { AGRO_REGIONS } from '../data/regions';

// In-memory cache for fast lookups
const climateCache = new Map<string, NasaClimateData>();

/**
 * Grid-quantization: Snaps coordinates to 0.05° (~5 km) for intelligent caching,
 * while preserving exact parcel coordinates for live NASA POWER API requests.
 */
export function snapCoordinateToGrid(val: number): number {
  return Math.round(val * 20) / 20;
}

export function generateCoordKey(lat: number, lon: number): string {
  return `${snapCoordinateToGrid(lat).toFixed(2)},${snapCoordinateToGrid(lon).toFixed(2)}`;
}

/**
 * Find closest preset region based on euclidean distance
 */
export function findClosestRegion(lat: number, lon: number) {
  let closest = AGRO_REGIONS[0];
  let minDistance = Infinity;

  for (const reg of AGRO_REGIONS) {
    const dLat = reg.latitude - lat;
    const dLon = reg.longitude - lon;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = reg;
    }
  }

  return closest;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Fetch live NASA POWER Climatology with automatic caching and graceful fallback
 */
export async function fetchNasaClimatology(lat: number, lon: number, forceRefresh = false): Promise<{
  data: NasaClimateData;
  source: 'live' | 'cached' | 'fallback';
}> {
  const snappedLat = snapCoordinateToGrid(lat);
  const snappedLon = snapCoordinateToGrid(lon);
  const cacheKey = generateCoordKey(snappedLat, snappedLon);
  const currentMonthIdx = new Date().getUTCMonth();
  const currentMonthName = MONTH_NAMES[currentMonthIdx];

  // 1. Check in-memory cache (unless forceRefresh is true)
  if (!forceRefresh && climateCache.has(cacheKey)) {
    const cached = climateCache.get(cacheKey)!;
    return {
      data: {
        ...cached,
        currentMonthName,
        currentMonthTempC: cached.temperatureMonthlyMeanC[currentMonthIdx],
        currentMonthPrecipMm: cached.precipitationMonthlyMm[currentMonthIdx],
        currentMonthRootZoneWetnessPercent: Math.round((cached.rootZoneSoilMoistureMonthly[currentMonthIdx] ?? 0.45) * 100),
        currentMonthSolarRadiation: Math.round((cached.solarRadiationMonthlyMjPerM2[currentMonthIdx] ?? 18) * 10) / 10,
      },
      source: 'cached',
    };
  }

  // 2. Check localStorage cache (unless forceRefresh is true)
  if (!forceRefresh) {
    try {
      const saved = localStorage.getItem(`fieldshift_nasa_${cacheKey}`);
      if (saved) {
        const parsed = JSON.parse(saved) as NasaClimateData;
        climateCache.set(cacheKey, parsed);
        return {
          data: {
            ...parsed,
            currentMonthName,
            currentMonthTempC: parsed.temperatureMonthlyMeanC[currentMonthIdx],
            currentMonthPrecipMm: parsed.precipitationMonthlyMm[currentMonthIdx],
            currentMonthRootZoneWetnessPercent: Math.round((parsed.rootZoneSoilMoistureMonthly[currentMonthIdx] ?? 0.45) * 100),
            currentMonthSolarRadiation: Math.round((parsed.solarRadiationMonthlyMjPerM2[currentMonthIdx] ?? 18) * 10) / 10,
          },
          source: 'cached',
        };
      }
    } catch (err) {
      console.warn('LocalStorage access warning:', err);
    }
  }

  // 3. Attempt Live NASA POWER Climatology API Request
  const params = 'T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,GWETROOT,ALLSKY_SFC_SW_DWN,RH2M,WS10M,TS';
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=${params}&community=AG&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500); // 7.5s timeout for NASA API

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`NASA API returned HTTP ${response.status}`);
    }

    const json = await response.json();
    const props = json?.properties?.parameter;

    if (props && props.T2M && props.PRECTOTCORR) {
      const monthKeys = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      const tMean = monthKeys.map(m => Number(props.T2M[m] ?? 20));
      const tMax = monthKeys.map(m => Number(props.T2M_MAX?.[m] ?? props.T2M[m] + 5));
      const tMin = monthKeys.map(m => Number(props.T2M_MIN?.[m] ?? props.T2M[m] - 5));
      // PRECTOTCORR in NASA climatology is mm/day -> convert to monthly total mm
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const precip = monthKeys.map((m, idx) => Math.round(Number(props.PRECTOTCORR[m] ?? 2) * daysInMonth[idx]));
      const solar = monthKeys.map(m => Number(props.ALLSKY_SFC_SW_DWN?.[m] ?? 18));
      const gwetroot = monthKeys.map(m => Number(props.GWETROOT?.[m] ?? 0.45));

      const totalPrecip = precip.reduce((acc, curr) => acc + curr, 0);
      const meanTemp = tMean.reduce((acc, curr) => acc + curr, 0) / 12;

      const now = new Date();
      const formattedTimestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

      const liveData: NasaClimateData = {
        latitude: lat,
        longitude: lon,
        elevationMeters: json?.geometry?.coordinates?.[2] ?? 150,
        source: 'nasa_power_live',
        temperatureMonthlyMeanC: tMean,
        temperatureMonthlyMaxC: tMax,
        temperatureMonthlyMinC: tMin,
        precipitationMonthlyMm: precip,
        solarRadiationMonthlyMjPerM2: solar,
        rootZoneSoilMoistureMonthly: gwetroot,
        annualPrecipitationMm: totalPrecip,
        meanAnnualTemperatureC: Math.round(meanTemp * 10) / 10,
        frostFreeDays: tMin.filter(t => t > 0).length * 30,
        historicalDroughtProbabilityPercent: totalPrecip < 500 ? 38 : totalPrecip < 800 ? 24 : 12,
        lastFetchedAt: formattedTimestamp,
        currentMonthName,
        currentMonthTempC: tMean[currentMonthIdx],
        currentMonthPrecipMm: precip[currentMonthIdx],
        currentMonthRootZoneWetnessPercent: Math.round(gwetroot[currentMonthIdx] * 100),
        currentMonthSolarRadiation: Math.round(solar[currentMonthIdx] * 10) / 10,
      };

      // Save to cache
      climateCache.set(cacheKey, liveData);
      try {
        localStorage.setItem(`fieldshift_nasa_${cacheKey}`, JSON.stringify(liveData));
      } catch {
        // quota exceeded or private mode, ignore
      }

      return { data: liveData, source: 'live' };
    }
  } catch (apiError) {
    console.warn('NASA POWER Live fetch failed or timed out. Falling back to calibrated baseline:', apiError);
  }

  // 4. Graceful Fallback: Use closest pre-calibrated region data
  const closestRegion = findClosestRegion(lat, lon);
  const fallbackData: NasaClimateData = {
    ...closestRegion.cachedClimate,
    latitude: lat,
    longitude: lon,
    source: 'merra2_climatology',
    lastFetchedAt: 'Calibrated MERRA-2 Climatology',
    currentMonthName,
    currentMonthTempC: closestRegion.cachedClimate.temperatureMonthlyMeanC[currentMonthIdx],
    currentMonthPrecipMm: closestRegion.cachedClimate.precipitationMonthlyMm[currentMonthIdx],
    currentMonthRootZoneWetnessPercent: Math.round((closestRegion.cachedClimate.rootZoneSoilMoistureMonthly[currentMonthIdx] ?? 0.45) * 100),
    currentMonthSolarRadiation: Math.round((closestRegion.cachedClimate.solarRadiationMonthlyMjPerM2[currentMonthIdx] ?? 18) * 10) / 10,
  };

  climateCache.set(cacheKey, fallbackData);
  return { data: fallbackData, source: 'fallback' };
}

/**
 * Fetch Open-Meteo Agro 7-Day Real-Time Soil Moisture and ET0 Forecast
 */
export async function fetchOpenMeteoForecast(lat: number, lon: number): Promise<{
  dailyDates: string[];
  et0Mm: number[];
  precipitationMm: number[];
  soilMoistureSurfacePercent: number[];
  soilMoistureRootZonePercent: number[];
} | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&daily=et0_fao_evapotranspiration,precipitation_sum&hourly=soil_moisture_0_to_1cm,soil_moisture_9_to_27cm&timezone=auto&forecast_days=7`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    // Aggregate 24 hourly volumetric soil moisture readings into daily percentages
    const surfaceHourly: number[] = data.hourly?.soil_moisture_0_to_1cm || [];
    const rootZoneHourly: number[] = data.hourly?.soil_moisture_9_to_27cm || [];
    const dailySurface: number[] = [];
    const dailyRootZone: number[] = [];
    for (let d = 0; d < 7; d++) {
      const sliceS = surfaceHourly.slice(d * 24, (d + 1) * 24);
      const sliceR = rootZoneHourly.slice(d * 24, (d + 1) * 24);
      const avgS = sliceS.length > 0 ? sliceS.reduce((a, b) => a + b, 0) / sliceS.length : 0.28;
      const avgR = sliceR.length > 0 ? sliceR.reduce((a, b) => a + b, 0) / sliceR.length : 0.36;
      dailySurface.push(Math.round(avgS * 100));
      dailyRootZone.push(Math.round(avgR * 100));
    }

    return {
      dailyDates: data.daily?.time ?? [],
      et0Mm: data.daily?.et0_fao_evapotranspiration ?? [4.2, 4.5, 4.1, 4.3, 4.6, 4.0, 4.2],
      precipitationMm: data.daily?.precipitation_sum ?? [0, 0, 2.5, 8.0, 1.2, 0, 0],
      soilMoistureSurfacePercent: dailySurface,
      soilMoistureRootZonePercent: dailyRootZone,
    };
  } catch (err) {
    console.warn('Open-Meteo forecast fetch error:', err);
    return null;
  }
}
