export type BotanicalFamily = 
  | 'Poaceae'      // Grasses & Cereals (Wheat, Rice, Corn, Millets, Sorghum, Rye, Barley)
  | 'Fabaceae'     // Legumes & Pulses (Chickpea, Soybean, Moong, Cowpea, Lentil, Pigeon pea, Vetch, Clover)
  | 'Brassicaceae' // Crucifers (Mustard, Canola, Radish)
  | 'Solanaceae'   // Nightshades (Potato, Tomato)
  | 'Asteraceae'   // Sunflower, Safflower
  | 'Malvaceae'    // Cotton
  | 'Euphorbiaceae'// Cassava
  | 'Amaranthaceae'// Spinach, Quinoa;

export type RootArchitecture = 'taproot_deep' | 'fibrous_shallow' | 'fibrous_deep' | 'tuberous';

export type Season = 'kharif' | 'rabi' | 'zaid' | 'spring' | 'summer' | 'fall' | 'winter';

export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  family: BotanicalFamily;
  category: 'cereal' | 'pulse_legume' | 'oilseed' | 'cover_crop' | 'cash_crop' | 'fiber';
  growthDurationDays: number;
  waterRequirementMm: number; // Seasonal water requirement (mm)
  cropCoefficientKc: number;  // FAO-56 mid-season Kc
  nitrogenFixationKgPerHa: number; // Net biological N credit (positive) or extraction (negative)
  nitrogenUptakeKgPerHa: number;
  carbonResidueInputTonPerHa: number;
  carbonNitrogenRatio: number;
  rootArchitecture: RootArchitecture;
  maxRootingDepthMeters: number;
  tempOptimumMinC: number;
  tempOptimumMaxC: number;
  criticalHeatThresholdC: number; // Flowering temperature threshold above which sterility occurs
  gddRequired: number; // Base 10°C Growing Degree Days
  droughtToleranceScore: number; // 0 - 100
  marketValuePerTonUsd: number;
  typicalYieldTonPerHa: number;
  suitableSeasons: Season[];
  suitableRegions: string[]; // Region IDs
  description: string;
  agroecologicalRole: string;
}

export interface SoilProfile {
  texture: 'clay' | 'clay_loam' | 'silt_loam' | 'loam' | 'sandy_loam' | 'sand';
  ph: number;
  organicMatterPercent: number; // e.g. 0.5% - 4.5%
  totalAvailableWaterCapacityMm: number; // TAW per meter
  fieldCapacityVolPercent: number;
  permanentWiltingPointVolPercent: number;
  drainageClass: 'poor' | 'moderate' | 'well' | 'excessive';
  salinityHazardDsm: number;
}

export type WaterAccessType = 'groundwater_borewell' | 'canal_surface' | 'rainfed' | 'hybrid_conjunctive' | 'drip_precision';

export interface FarmerPriorities {
  soilHealthWeight: number;    // 0 - 100
  waterConservationWeight: number; // 0 - 100
  economicProfitWeight: number;   // 0 - 100
  climateResilienceWeight: number;// 0 - 100
  waterAccessType: WaterAccessType;
}

export interface FarmerFieldProfile {
  id: string;
  isConfigured: boolean;
  hasCompletedOnboarding?: boolean;
  farmName: string;
  farmerName?: string;
  placeName: string;
  latitude: number;
  longitude: number;
  currentCropHistory: {
    previousCropId: string;
    currentCropId: string;
    patternLabel: string;
  };
  irrigationMethod: WaterAccessType;
  soilTexture: 'loam' | 'clay' | 'sandy_loam';
  soilOrganicMatter: number;
  fieldSizeAcres?: number;
  fieldBoundary?: [number, number][];
  createdAt?: string;
  sowingDate?: string;          // ISO date format 'YYYY-MM-DD', e.g. '2026-10-15'
  targetHarvestDate?: string;   // ISO date format 'YYYY-MM-DD'
  ureaIntensity?: 'low' | 'moderate' | 'heavy';
  pesticideFrequency?: 'none' | 'moderate' | 'intensive';
  sowingStage?: 'germination' | 'vegetative' | 'flowering' | 'maturing';
  soilHealthScore?: number;
  isEvaluationMode?: boolean;
  evaluationScenarioLabel?: string;
}

export interface NasaClimateData {
  latitude: number;
  longitude: number;
  elevationMeters: number;
  source: 'nasa_power_live' | 'nasa_power_cached' | 'merra2_climatology';
  temperatureMonthlyMeanC: number[];   // 12 months
  temperatureMonthlyMaxC: number[];
  temperatureMonthlyMinC: number[];
  precipitationMonthlyMm: number[];   // 12 months
  solarRadiationMonthlyMjPerM2: number[]; // ALLSKY_SFC_SW_DWN
  rootZoneSoilMoistureMonthly: number[]; // GWETROOT (0.0 to 1.0)
  annualPrecipitationMm: number;
  meanAnnualTemperatureC: number;
  frostFreeDays: number;
  historicalDroughtProbabilityPercent: number;
  lastFetchedAt?: string;             // ISO timestamp or formatted fetch time
  currentMonthName?: string;          // e.g. 'November'
  currentMonthTempC?: number;         // Authentic 2m temperature for the current month
  currentMonthPrecipMm?: number;      // Authentic precipitation for current month
  currentMonthRootZoneWetnessPercent?: number; // Authentic microwave root-zone moisture saturation %
  currentMonthSolarRadiation?: number;// Solar irradiance in MJ/m²/day
}

export interface AgroRegion {
  id: string;
  name: string;
  subTitle: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  climateZone: string;
  dominantDegradedMonoculture: string;
  primaryDegradationRisk: string;
  typicalSoil: SoilProfile;
  cachedClimate: NasaClimateData;
  seasons: {
    id: Season;
    name: string;
    months: string;
    startMonth: number; // 1-12
    durationMonths: number;
  }[];
}

export interface RotationSeasonSlot {
  seasonIndex: number;
  year: number;
  seasonId: Season;
  seasonName: string;
  crop: Crop;
  isCoverCrop: boolean;
  waterBalanceMm: number; // Rainfall + irrigation - crop need
  soilNitrogenBalanceKg: number;
  carbonContributionTon: number;
  pestCycleBroken: boolean;
  climateRiskScore: number; // 0 - 100 (lower is safer)
}

export interface RotationStrategy {
  id: string;
  title: string;
  archetype: 'soil_builder' | 'climate_shield' | 'balanced_profit' | 'custom';
  description: string;
  seasons: RotationSeasonSlot[];
  overallScore: number; // 0 - 100
  soilHealthIndex: number; // 0 - 100
  waterResilienceIndex: number; // 0 - 100
  economicSecurityIndex: number; // 0 - 100
  climateRiskPenalty: number; // 0 - 100
  total3YearNitrogenNetKgPerHa: number;
  total3YearCarbonSequestrationTonPerHa: number;
  total3YearWaterSavedM3PerHa: number;
  projected3YearGrossMarginUsdPerHa: number;
  breakEvenMonths: number;
  agroecologicalBenefits: string[];
}
