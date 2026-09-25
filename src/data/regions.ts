import { AgroRegion } from '../types';

export const AGRO_REGIONS: AgroRegion[] = [
  {
    id: 'indo_gangetic',
    name: 'South Asia (Indo-Gangetic Plains)',
    subTitle: 'Punjab, Haryana & Western UP, India',
    country: 'India',
    latitude: 30.90,
    longitude: 75.85,
    elevationMeters: 245,
    climateZone: 'Semi-Arid Monsoonal (Cwa/BSh)',
    dominantDegradedMonoculture: 'Continuous Puddled Rice - Irrigated Wheat',
    primaryDegradationRisk: 'Severe groundwater table depletion (-0.8 m/yr), dense plow hardpan, and soil organic carbon exhaustion (<0.4%).',
    typicalSoil: {
      texture: 'silt_loam',
      ph: 7.8,
      organicMatterPercent: 0.42,
      totalAvailableWaterCapacityMm: 165,
      fieldCapacityVolPercent: 28,
      permanentWiltingPointVolPercent: 12,
      drainageClass: 'moderate',
      salinityHazardDsm: 1.4
    },
    cachedClimate: {
      latitude: 30.90,
      longitude: 75.85,
      elevationMeters: 245,
      source: 'merra2_climatology',
      temperatureMonthlyMeanC: [12.4, 15.6, 21.2, 27.8, 32.5, 34.2, 31.8, 30.4, 28.9, 24.5, 18.2, 13.5],
      temperatureMonthlyMaxC: [19.2, 22.8, 28.5, 35.8, 40.5, 41.2, 36.5, 34.8, 34.2, 32.4, 26.8, 20.8],
      temperatureMonthlyMinC: [5.6, 8.4, 13.9, 19.8, 24.5, 27.2, 27.1, 26.0, 23.6, 16.6, 9.6, 6.2],
      precipitationMonthlyMm: [24, 28, 22, 14, 18, 55, 195, 172, 85, 12, 6, 15],
      solarRadiationMonthlyMjPerM2: [12.8, 15.6, 19.4, 23.2, 25.8, 24.6, 20.2, 19.4, 18.8, 17.2, 14.1, 11.9],
      rootZoneSoilMoistureMonthly: [0.42, 0.45, 0.38, 0.28, 0.22, 0.28, 0.68, 0.72, 0.54, 0.35, 0.38, 0.41],
      annualPrecipitationMm: 646,
      meanAnnualTemperatureC: 24.2,
      frostFreeDays: 345,
      historicalDroughtProbabilityPercent: 28
    },
    seasons: [
      { id: 'kharif', name: 'Kharif (Monsoon)', months: 'Jun – Oct', startMonth: 6, durationMonths: 5 },
      { id: 'rabi', name: 'Rabi (Winter)', months: 'Nov – Mar', startMonth: 11, durationMonths: 5 },
      { id: 'zaid', name: 'Zaid (Summer Pulse)', months: 'Apr – May', startMonth: 4, durationMonths: 2 }
    ]
  },
  {
    id: 'us_midwest',
    name: 'US Midwest Corn Belt',
    subTitle: 'Des Moines, Iowa, USA',
    country: 'United States',
    latitude: 41.58,
    longitude: -93.62,
    elevationMeters: 290,
    climateZone: 'Humid Continental (Dfa)',
    dominantDegradedMonoculture: 'Corn - Soybean Two-Year Duopoly',
    primaryDegradationRisk: 'Severe tile-drainage nitrate leaching (Gulf of Mexico hypoxia), bare winter soil oxidation, and herbicide-resistant weeds.',
    typicalSoil: {
      texture: 'clay_loam',
      ph: 6.4,
      organicMatterPercent: 2.8,
      totalAvailableWaterCapacityMm: 195,
      fieldCapacityVolPercent: 34,
      permanentWiltingPointVolPercent: 15,
      drainageClass: 'moderate',
      salinityHazardDsm: 0.4
    },
    cachedClimate: {
      latitude: 41.58,
      longitude: -93.62,
      elevationMeters: 290,
      source: 'merra2_climatology',
      temperatureMonthlyMeanC: [-6.8, -4.2, 2.8, 10.4, 16.8, 22.2, 24.6, 23.2, 18.5, 11.4, 3.2, -4.4],
      temperatureMonthlyMaxC: [-2.1, 0.8, 8.5, 16.8, 23.1, 28.2, 30.4, 29.1, 25.0, 17.8, 8.6, 0.2],
      temperatureMonthlyMinC: [-11.5, -9.2, -2.9, 4.0, 10.5, 16.2, 18.8, 17.3, 12.0, 5.0, -2.2, -9.0],
      precipitationMonthlyMm: [25, 32, 58, 98, 122, 128, 110, 105, 82, 65, 48, 35],
      solarRadiationMonthlyMjPerM2: [7.2, 10.5, 14.8, 18.5, 21.8, 24.2, 23.8, 21.0, 16.5, 11.8, 7.8, 6.1],
      rootZoneSoilMoistureMonthly: [0.72, 0.74, 0.82, 0.78, 0.70, 0.62, 0.52, 0.48, 0.55, 0.62, 0.68, 0.70],
      annualPrecipitationMm: 908,
      meanAnnualTemperatureC: 9.8,
      frostFreeDays: 165,
      historicalDroughtProbabilityPercent: 22
    },
    seasons: [
      { id: 'spring', name: 'Spring / Early Summer', months: 'Apr – Jun', startMonth: 4, durationMonths: 3 },
      { id: 'summer', name: 'Summer Main Crop', months: 'Jul – Oct', startMonth: 7, durationMonths: 4 },
      { id: 'winter', name: 'Winter Bio-Cover Window', months: 'Nov – Mar', startMonth: 11, durationMonths: 5 }
    ]
  },
  {
    id: 'sahel',
    name: 'Sub-Saharan Africa (Sahel Belt)',
    subTitle: 'Central Plateau, Burkina Faso',
    country: 'Burkina Faso',
    latitude: 12.37,
    longitude: -1.53,
    elevationMeters: 305,
    climateZone: 'Semi-Arid Tropical Sahel (BSh)',
    dominantDegradedMonoculture: 'Continuous Low-Yield Sorghum / Bare Fallow',
    primaryDegradationRisk: 'Acute flash drought vulnerability, high heat (>42°C), nutrient-starved Arenosols, and rapid crusting erosion.',
    typicalSoil: {
      texture: 'sandy_loam',
      ph: 5.6,
      organicMatterPercent: 0.35,
      totalAvailableWaterCapacityMm: 85,
      fieldCapacityVolPercent: 16,
      permanentWiltingPointVolPercent: 7,
      drainageClass: 'excessive',
      salinityHazardDsm: 0.2
    },
    cachedClimate: {
      latitude: 12.37,
      longitude: -1.53,
      elevationMeters: 305,
      source: 'merra2_climatology',
      temperatureMonthlyMeanC: [25.2, 28.5, 32.4, 34.6, 33.2, 30.1, 27.8, 26.8, 27.6, 29.8, 28.4, 25.6],
      temperatureMonthlyMaxC: [33.8, 37.1, 40.2, 41.8, 39.6, 35.8, 32.4, 31.0, 32.6, 36.2, 36.5, 34.2],
      temperatureMonthlyMinC: [16.6, 19.9, 24.6, 27.4, 26.8, 24.4, 23.2, 22.6, 22.6, 23.4, 20.3, 17.0],
      precipitationMonthlyMm: [1, 2, 8, 24, 72, 115, 195, 245, 138, 32, 2, 0],
      solarRadiationMonthlyMjPerM2: [19.2, 21.5, 23.4, 23.8, 22.4, 21.0, 19.6, 18.5, 19.8, 21.2, 20.4, 18.8],
      rootZoneSoilMoistureMonthly: [0.15, 0.12, 0.10, 0.12, 0.25, 0.42, 0.65, 0.74, 0.58, 0.32, 0.18, 0.15],
      annualPrecipitationMm: 834,
      meanAnnualTemperatureC: 29.2,
      frostFreeDays: 365,
      historicalDroughtProbabilityPercent: 46
    },
    seasons: [
      { id: 'kharif', name: 'Monsoon (Hivernage)', months: 'Jun – Oct', startMonth: 6, durationMonths: 5 },
      { id: 'winter', name: 'Dry Cold Season', months: 'Nov – Feb', startMonth: 11, durationMonths: 4 },
      { id: 'summer', name: 'Dry Hot Season', months: 'Mar – May', startMonth: 3, durationMonths: 3 }
    ]
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Basin',
    subTitle: 'Andalusia, Southern Spain',
    country: 'Spain',
    latitude: 37.38,
    longitude: -5.98,
    elevationMeters: 42,
    climateZone: 'Mediterranean Hot Summer (Csa)',
    dominantDegradedMonoculture: 'Rainfed Winter Wheat – Bare Weeded Fallow',
    primaryDegradationRisk: 'Extreme summer vapor pressure deficits (>3.5 kPa), bare fallow erosion during torrential winter rains, and secondary salinization.',
    typicalSoil: {
      texture: 'clay',
      ph: 8.1,
      organicMatterPercent: 1.1,
      totalAvailableWaterCapacityMm: 175,
      fieldCapacityVolPercent: 36,
      permanentWiltingPointVolPercent: 19,
      drainageClass: 'moderate',
      salinityHazardDsm: 1.8
    },
    cachedClimate: {
      latitude: 37.38,
      longitude: -5.98,
      elevationMeters: 42,
      source: 'merra2_climatology',
      temperatureMonthlyMeanC: [11.0, 12.5, 15.2, 17.5, 21.2, 26.0, 28.5, 28.2, 24.8, 20.2, 15.0, 11.8],
      temperatureMonthlyMaxC: [16.2, 18.0, 21.5, 24.0, 28.2, 33.5, 36.8, 36.2, 32.0, 26.2, 20.5, 16.8],
      temperatureMonthlyMinC: [5.8, 7.0, 8.9, 11.0, 14.2, 18.5, 20.2, 20.2, 17.6, 14.2, 9.5, 6.8],
      precipitationMonthlyMm: [65, 52, 40, 48, 30, 8, 2, 4, 25, 68, 85, 88],
      solarRadiationMonthlyMjPerM2: [9.5, 12.8, 17.2, 21.0, 25.2, 28.5, 29.2, 26.4, 20.5, 14.6, 10.2, 8.4],
      rootZoneSoilMoistureMonthly: [0.65, 0.68, 0.62, 0.54, 0.38, 0.22, 0.14, 0.12, 0.20, 0.45, 0.60, 0.65],
      annualPrecipitationMm: 515,
      meanAnnualTemperatureC: 18.5,
      frostFreeDays: 320,
      historicalDroughtProbabilityPercent: 38
    },
    seasons: [
      { id: 'winter', name: 'Winter Rainfed Season', months: 'Nov – Mar', startMonth: 11, durationMonths: 5 },
      { id: 'spring', name: 'Spring Maturity Window', months: 'Apr – May', startMonth: 4, durationMonths: 2 },
      { id: 'summer', name: 'Arid Summer Break', months: 'Jun – Oct', startMonth: 6, durationMonths: 5 }
    ]
  },
  {
    id: 'cerrado',
    name: 'Latin America (Brazilian Cerrado)',
    subTitle: 'Mato Grosso Savanna, Brazil',
    country: 'Brazil',
    latitude: -15.60,
    longitude: -56.09,
    elevationMeters: 175,
    climateZone: 'Tropical Wet and Dry (Aw)',
    dominantDegradedMonoculture: 'Early Soybean – Safrinha Corn Monoculture',
    primaryDegradationRisk: 'Acid Oxisols (Latossolos), severe organic matter oxidation under continuous high heat, and intense runoff erosion.',
    typicalSoil: {
      texture: 'clay',
      ph: 5.2,
      organicMatterPercent: 1.6,
      totalAvailableWaterCapacityMm: 120,
      fieldCapacityVolPercent: 28,
      permanentWiltingPointVolPercent: 18,
      drainageClass: 'well',
      salinityHazardDsm: 0.1
    },
    cachedClimate: {
      latitude: -15.60,
      longitude: -56.09,
      elevationMeters: 175,
      source: 'merra2_climatology',
      temperatureMonthlyMeanC: [27.2, 27.0, 27.1, 26.5, 24.8, 23.5, 24.2, 26.5, 28.2, 28.5, 27.8, 27.4],
      temperatureMonthlyMaxC: [32.8, 32.5, 32.6, 32.8, 31.5, 31.0, 32.5, 35.2, 36.8, 35.5, 34.0, 33.0],
      temperatureMonthlyMinC: [21.6, 21.5, 21.6, 20.2, 18.1, 16.0, 15.9, 17.8, 19.6, 21.5, 21.6, 21.8],
      precipitationMonthlyMm: [225, 210, 185, 95, 25, 8, 4, 12, 45, 125, 180, 215],
      solarRadiationMonthlyMjPerM2: [18.5, 18.2, 19.0, 19.5, 18.8, 18.0, 19.5, 21.2, 21.5, 20.8, 19.8, 18.8],
      rootZoneSoilMoistureMonthly: [0.75, 0.78, 0.72, 0.58, 0.38, 0.25, 0.18, 0.16, 0.24, 0.52, 0.68, 0.74],
      annualPrecipitationMm: 1329,
      meanAnnualTemperatureC: 26.3,
      frostFreeDays: 365,
      historicalDroughtProbabilityPercent: 20
    },
    seasons: [
      { id: 'summer', name: 'Main Summer Wet Season', months: 'Oct – Feb', startMonth: 10, durationMonths: 5 },
      { id: 'fall', name: 'Safrinha Second Season', months: 'Mar – Jun', startMonth: 3, durationMonths: 4 },
      { id: 'winter', name: 'Dry Winter Fallow/Cover', months: 'Jul – Sep', startMonth: 7, durationMonths: 3 }
    ]
  },
  {
    id: 'murray_darling',
    name: 'Australia (Murray-Darling Basin)',
    subTitle: 'Riverina, New South Wales, Australia',
    country: 'Australia',
    latitude: -34.42,
    longitude: 144.38,
    elevationMeters: 110,
    climateZone: 'Semi-Arid Temperate (BSk)',
    dominantDegradedMonoculture: 'Continuous Winter Wheat / Sheep Fallow',
    primaryDegradationRisk: 'Frequent multi-year drought cycles, dryland soil salinity, and fragile sodic topsoil structure.',
    typicalSoil: {
      texture: 'clay_loam',
      ph: 7.4,
      organicMatterPercent: 0.85,
      totalAvailableWaterCapacityMm: 140,
      fieldCapacityVolPercent: 30,
      permanentWiltingPointVolPercent: 16,
      drainageClass: 'moderate',
      salinityHazardDsm: 2.2
    },
    cachedClimate: {
      latitude: -34.42,
      longitude: 144.38,
      elevationMeters: 110,
      source: 'merra2_climatology',
      temperatureMonthlyMeanC: [25.4, 24.8, 21.8, 17.2, 13.0, 10.2, 9.5, 11.2, 14.5, 18.0, 21.2, 23.8],
      temperatureMonthlyMaxC: [33.2, 32.5, 29.2, 24.2, 19.5, 16.0, 15.2, 17.4, 21.0, 25.4, 29.0, 31.8],
      temperatureMonthlyMinC: [17.6, 17.1, 14.4, 10.2, 6.5, 4.4, 3.8, 5.0, 8.0, 10.6, 13.4, 15.8],
      precipitationMonthlyMm: [28, 26, 32, 25, 34, 38, 36, 39, 34, 42, 32, 30],
      solarRadiationMonthlyMjPerM2: [26.8, 24.2, 19.5, 14.2, 10.5, 8.5, 9.2, 12.4, 16.8, 21.5, 25.0, 27.5],
      rootZoneSoilMoistureMonthly: [0.22, 0.20, 0.24, 0.28, 0.42, 0.58, 0.62, 0.58, 0.48, 0.35, 0.26, 0.22],
      annualPrecipitationMm: 406,
      meanAnnualTemperatureC: 17.6,
      frostFreeDays: 275,
      historicalDroughtProbabilityPercent: 42
    },
    seasons: [
      { id: 'winter', name: 'Winter Cropping Window', months: 'May – Oct', startMonth: 5, durationMonths: 6 },
      { id: 'summer', name: 'Dry Summer Fallow', months: 'Nov – Apr', startMonth: 11, durationMonths: 6 }
    ]
  }
];

export const getRegionById = (id: string): AgroRegion => {
  const reg = AGRO_REGIONS.find(r => r.id === id);
  return reg || AGRO_REGIONS[0];
};
