import { FarmerFieldProfile } from '../types';

export interface EvaluationScenario {
  id: string;
  title: string;
  subtitle: string;
  climateZone: string;
  highlightMetric: string;
  demoNote: string;
  profile: Omit<FarmerFieldProfile, 'id'>;
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function buildSquareBoundary(lat: number, lon: number, acres: number): [number, number][] {
  // Approximate square parcel side in degrees (~4046.86 m^2 per acre)
  const sideMeters = Math.sqrt(acres * 4046.86);
  const dLat = (sideMeters / 2) / 111320;
  const dLon = (sideMeters / 2) / (111320 * Math.cos((lat * Math.PI) / 180));
  return [
    [Number((lat + dLat).toFixed(6)), Number((lon - dLon).toFixed(6))],
    [Number((lat + dLat).toFixed(6)), Number((lon + dLon).toFixed(6))],
    [Number((lat - dLat).toFixed(6)), Number((lon + dLon).toFixed(6))],
    [Number((lat - dLat).toFixed(6)), Number((lon - dLon).toFixed(6))],
  ];
}

export const EVALUATION_SCENARIOS: EvaluationScenario[] = [
  {
    id: 'indus_punjab',
    title: 'Indus Basin Irrigated Farm',
    subtitle: 'Khanewal Cropland, Punjab • 5.0 ac • Loam Soil',
    climateZone: 'Semi-Arid Subtropical',
    highlightMetric: 'Cotton → Wheat • Hybrid Irrigation',
    demoNote: 'Demo field boundary & standing Wheat preset paired with live NASA POWER telemetry at 30.3726°N, 71.9023°E.',
    profile: {
      isConfigured: true,
      hasCompletedOnboarding: true,
      isEvaluationMode: true,
      evaluationScenarioLabel: 'Indus Basin (Khanewal)',
      farmName: 'Punjab Demo Farm (Eval)',
      farmerName: 'Judge Evaluator',
      placeName: 'Khanewal Cropland, Punjab',
      latitude: 30.3726,
      longitude: 71.9023,
      fieldSizeAcres: 5,
      fieldBoundary: buildSquareBoundary(30.3726, 71.9023, 5),
      irrigationMethod: 'hybrid_conjunctive',
      soilTexture: 'loam',
      soilOrganicMatter: 1.4,
      soilHealthScore: 68,
      ureaIntensity: 'moderate',
      pesticideFrequency: 'moderate',
      sowingStage: 'vegetative',
      sowingDate: daysAgoIso(42),
      currentCropHistory: {
        previousCropId: 'cotton',
        currentCropId: 'wheat',
        patternLabel: 'Cotton → Bread Wheat',
      },
    },
  },
  {
    id: 'iowa_cornbelt',
    title: 'Midwest Rainfed Corn Belt',
    subtitle: 'ISU Agronomy Farmland, IA • 12.5 ac • Loam Soil',
    climateZone: 'Humid Continental',
    highlightMetric: 'Soybean → Maize • Rainfed Only',
    demoNote: 'Demo field boundary & standing Maize preset paired with live NASA POWER telemetry at 42.0204°N, 93.7738°W.',
    profile: {
      isConfigured: true,
      hasCompletedOnboarding: true,
      isEvaluationMode: true,
      evaluationScenarioLabel: 'US Corn Belt (Ames, IA)',
      farmName: 'Iowa Demo Parcel (Eval)',
      farmerName: 'Judge Evaluator',
      placeName: 'Boone County Farmland, Iowa, USA',
      latitude: 42.0204,
      longitude: -93.7738,
      fieldSizeAcres: 12.5,
      fieldBoundary: buildSquareBoundary(42.0204, -93.7738, 12.5),
      irrigationMethod: 'rainfed',
      soilTexture: 'loam',
      soilOrganicMatter: 3.1,
      soilHealthScore: 81,
      ureaIntensity: 'low',
      pesticideFrequency: 'none',
      sowingStage: 'vegetative',
      sowingDate: daysAgoIso(35),
      currentCropHistory: {
        previousCropId: 'soybean',
        currentCropId: 'corn_maize',
        patternLabel: 'Soybean → Maize (Corn)',
      },
    },
  },
  {
    id: 'mekong_delta',
    title: 'Tropical Monsoon Rice Delta',
    subtitle: 'O Mon Rice Paddies, Vietnam • 3.2 ac • Clay Soil',
    climateZone: 'Tropical Monsoon',
    highlightMetric: 'Rice → Rice • Canal Surface',
    demoNote: 'Demo field boundary & standing Rice preset paired with live NASA POWER telemetry at 10.1048°N, 105.6201°E.',
    profile: {
      isConfigured: true,
      hasCompletedOnboarding: true,
      isEvaluationMode: true,
      evaluationScenarioLabel: 'Mekong Delta (O Mon)',
      farmName: 'Mekong Demo Plot (Eval)',
      farmerName: 'Judge Evaluator',
      placeName: 'O Mon Rice Paddies, Can Tho',
      latitude: 10.1048,
      longitude: 105.6201,
      fieldSizeAcres: 3.2,
      fieldBoundary: buildSquareBoundary(10.1048, 105.6201, 3.2),
      irrigationMethod: 'canal_surface',
      soilTexture: 'clay',
      soilOrganicMatter: 2.2,
      soilHealthScore: 62,
      ureaIntensity: 'heavy',
      pesticideFrequency: 'intensive',
      sowingStage: 'germination',
      sowingDate: daysAgoIso(28),
      currentCropHistory: {
        previousCropId: 'puddle_rice',
        currentCropId: 'puddle_rice',
        patternLabel: 'Continuous Wetland Rice',
      },
    },
  },
];
