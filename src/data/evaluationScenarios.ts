import { FarmerFieldProfile } from '../types';

export interface EvaluationScenario {
  id: string;
  title: string;
  subtitle: string;
  climateZone: string;
  highlightMetric: string;
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
    subtitle: 'Multan, Punjab • 5.0 ac • Loam Soil',
    climateZone: 'Semi-Arid Subtropical',
    highlightMetric: 'Cotton → Wheat • Hybrid Irrigation',
    profile: {
      isConfigured: true,
      hasCompletedOnboarding: true,
      isEvaluationMode: true,
      evaluationScenarioLabel: 'Indus Basin (Multan)',
      farmName: 'Punjab Demo Farm (Eval)',
      farmerName: 'Judge Evaluator',
      placeName: 'Multan District, Punjab',
      latitude: 30.1904,
      longitude: 71.4793,
      fieldSizeAcres: 5,
      fieldBoundary: buildSquareBoundary(30.1904, 71.4793, 5),
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
    subtitle: 'Ames, Iowa, USA • 12.5 ac • Loam Soil',
    climateZone: 'Humid Continental',
    highlightMetric: 'Soybean → Maize • Rainfed Only',
    profile: {
      isConfigured: true,
      hasCompletedOnboarding: true,
      isEvaluationMode: true,
      evaluationScenarioLabel: 'US Corn Belt (Ames, IA)',
      farmName: 'Iowa Demo Parcel (Eval)',
      farmerName: 'Judge Evaluator',
      placeName: 'Story County, Iowa, USA',
      latitude: 42.0308,
      longitude: -93.6319,
      fieldSizeAcres: 12.5,
      fieldBoundary: buildSquareBoundary(42.0308, -93.6319, 12.5),
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
    subtitle: 'Can Tho, Vietnam • 3.2 ac • Clay Soil',
    climateZone: 'Tropical Monsoon',
    highlightMetric: 'Rice → Rice • Canal Gravity',
    profile: {
      isConfigured: true,
      hasCompletedOnboarding: true,
      isEvaluationMode: true,
      evaluationScenarioLabel: 'Mekong Delta (Can Tho)',
      farmName: 'Mekong Demo Plot (Eval)',
      farmerName: 'Judge Evaluator',
      placeName: 'Can Tho, Mekong Delta',
      latitude: 10.0452,
      longitude: 105.7469,
      fieldSizeAcres: 3.2,
      fieldBoundary: buildSquareBoundary(10.0452, 105.7469, 3.2),
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
