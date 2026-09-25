import { Crop, AgroRegion, SoilProfile, FarmerPriorities, RotationStrategy, RotationSeasonSlot, NasaClimateData } from '../types';
import { CROPS_DATABASE, getCropById } from '../data/crops';

/**
 * Evaluates an individual rotation plan and returns detailed sub-indices and agronomic metrics
 */
export function evaluateRotationPlan(
  cropsSequence: Crop[],
  region: AgroRegion,
  climate: NasaClimateData,
  soil: SoilProfile,
  priorities: FarmerPriorities,
  strategyArchetype: 'soil_builder' | 'climate_shield' | 'balanced_profit' | 'custom',
  title: string,
  description: string
): RotationStrategy {
  const numSeasons = cropsSequence.length;
  const regionSeasons = region.seasons;

  let totalNitrogenBalance = 0;
  let totalCarbonAdded = 0;
  let totalWaterRequiredMm = 0;
  let totalRainfallAvailableMm = 0;
  let totalGrossRevenueUsd = 0;
  let familyViolations = 0;
  let heatRiskPenalties = 0;
  let distinctFamilies = new Set<string>();
  let distinctRootTypes = new Set<string>();

  const seasonSlots: RotationSeasonSlot[] = [];

  for (let i = 0; i < numSeasons; i++) {
    const crop = cropsSequence[i];
    const prevCrop = i > 0 ? cropsSequence[i - 1] : null;
    const seasonInfo = regionSeasons[i % regionSeasons.length];
    const yearNumber = Math.floor(i / regionSeasons.length) + 1;

    // 1. Botanical Family Alternation
    distinctFamilies.add(crop.family);
    distinctRootTypes.add(crop.rootArchitecture);
    const isFamilyViolation = prevCrop ? prevCrop.family === crop.family : false;
    if (isFamilyViolation) {
      familyViolations += 1;
    }

    // 2. Nitrogen Dynamics (BNF credit minus crop uptake)
    const netNCredit = crop.nitrogenFixationKgPerHa - (crop.nitrogenUptakeKgPerHa * 0.4);
    totalNitrogenBalance += netNCredit;

    // 3. Carbon Input
    totalCarbonAdded += crop.carbonResidueInputTonPerHa * 0.22; // humification fraction

    // 4. Hydrology & Water Budget
    // Estimate rainfall during this crop's growth window
    const startM = seasonInfo.startMonth - 1; // 0-indexed
    let seasonalRainfall = 0;
    for (let m = 0; m < seasonInfo.durationMonths; m++) {
      const monthIdx = (startM + m) % 12;
      seasonalRainfall += climate.precipitationMonthlyMm[monthIdx] ?? 40;
    }
    totalRainfallAvailableMm += seasonalRainfall;
    totalWaterRequiredMm += crop.waterRequirementMm;
    const waterBalanceMm = Math.round(seasonalRainfall - crop.waterRequirementMm);

    // 5. Thermal & Climate Risk
    const peakMonth = (startM + Math.floor(seasonInfo.durationMonths / 2)) % 12;
    const peakTemp = climate.temperatureMonthlyMaxC[peakMonth] ?? 30;
    let climateRisk = 15;
    if (peakTemp > crop.criticalHeatThresholdC) {
      climateRisk += 45;
      heatRiskPenalties += 1;
    }
    if (waterBalanceMm < -200 && priorities.waterAccessType === 'rainfed') {
      climateRisk += 35;
    }

    // 6. Economics
    const seasonRevenue = crop.marketValuePerTonUsd * crop.typicalYieldTonPerHa;
    totalGrossRevenueUsd += seasonRevenue;

    seasonSlots.push({
      seasonIndex: i + 1,
      year: yearNumber,
      seasonId: seasonInfo.id,
      seasonName: `${seasonInfo.name} (Yr ${yearNumber})`,
      crop: crop,
      isCoverCrop: crop.category === 'cover_crop',
      waterBalanceMm: waterBalanceMm,
      soilNitrogenBalanceKg: Math.round(netNCredit),
      carbonContributionTon: Math.round(crop.carbonResidueInputTonPerHa * 0.22 * 10) / 10,
      pestCycleBroken: !isFamilyViolation,
      climateRiskScore: Math.min(100, climateRisk)
    });
  }

  // --- SUB-INDEX 1: Soil Health Index (SHI: 0 - 100) ---
  const nitrogenScore = Math.min(100, Math.max(10, 50 + (totalNitrogenBalance / numSeasons) * 0.8));
  const carbonScore = Math.min(100, Math.max(15, (totalCarbonAdded / numSeasons) * 35));
  const biodiversityScore = (distinctFamilies.size / Math.min(4, numSeasons)) * 60 + (distinctRootTypes.size / 3) * 40;
  const familyPenalty = familyViolations * 22;
  const soilHealthIndex = Math.round(
    Math.min(100, Math.max(5, (nitrogenScore * 0.35 + carbonScore * 0.35 + biodiversityScore * 0.3) - familyPenalty))
  );

  // --- SUB-INDEX 2: Water Resilience Index (WRI: 0 - 100) ---
  const waterSupplyDemandRatio = totalWaterRequiredMm > 0 ? totalRainfallAvailableMm / totalWaterRequiredMm : 1.0;
  let rawWaterScore = waterSupplyDemandRatio >= 1.0 
    ? 90 + Math.min(10, (waterSupplyDemandRatio - 1.0) * 10)
    : Math.max(20, waterSupplyDemandRatio * 90);
  
  if (priorities.waterAccessType === 'rainfed' && waterSupplyDemandRatio < 0.7) {
    rawWaterScore -= 25;
  }
  const waterResilienceIndex = Math.round(Math.min(100, Math.max(10, rawWaterScore)));

  // --- SUB-INDEX 3: Economic Security Index (ESI: 0 - 100) ---
  const annualGrossMargin = totalGrossRevenueUsd / (numSeasons / regionSeasons.length);
  const economicSecurityIndex = Math.round(
    Math.min(100, Math.max(15, (annualGrossMargin / 3500) * 100))
  );

  // --- SUB-INDEX 4: Climate Risk Penalty (CRP: 0 - 100) ---
  const climateRiskPenalty = Math.round(
    Math.min(100, Math.max(5, (heatRiskPenalties / numSeasons) * 60 + (climate.historicalDroughtProbabilityPercent * 0.4)))
  );

  // --- COMPOSITE OVERALL SCORE ---
  const wS = priorities.soilHealthWeight / 100;
  const wW = priorities.waterConservationWeight / 100;
  const wE = priorities.economicProfitWeight / 100;
  const wR = priorities.climateResilienceWeight / 100;
  const sumWeights = wS + wW + wE + wR || 1.0;

  const compositeScore = Math.round(
    (wS * soilHealthIndex + wW * waterResilienceIndex + wE * economicSecurityIndex - wR * (climateRiskPenalty * 0.5)) / sumWeights
  );
  const overallScore = Math.min(100, Math.max(10, compositeScore));

  // Ecological savings
  const conventionalWaterDemandMm = numSeasons * 480; // baseline conventional
  const waterSavedMm = Math.max(0, conventionalWaterDemandMm - totalWaterRequiredMm);
  const waterSavedM3PerHa = waterSavedMm * 10; // 1 mm = 10 m³/ha

  const benefits: string[] = [];
  if (totalNitrogenBalance > 50) {
    benefits.push(`Net biological nitrogen fixation of +${Math.round(totalNitrogenBalance)} kg N/ha reduces synthetic fertilizer demand.`);
  } else if (totalNitrogenBalance < -50) {
    benefits.push(`Significant nitrogen drawdown of ${Math.round(Math.abs(totalNitrogenBalance))} kg N/ha requires legume rotation reinforcement.`);
  }
  if (waterSavedM3PerHa > 1000) {
    benefits.push(`Conserves ${Math.round(waterSavedM3PerHa).toLocaleString()} m³/ha of water compared to conventional monoculture.`);
  }
  if (familyViolations === 0) {
    benefits.push('Zero botanical family overlap eliminates soil-borne fungal Take-all and nematode pathogen build-up.');
  } else {
    benefits.push(`Warning: ${familyViolations} consecutive botanical family repetition(s) increases disease vulnerability.`);
  }
  benefits.push(`Predicted 3-year organic matter input: ${totalCarbonAdded.toFixed(1)} t/ha humified carbon.`);

  return {
    id: `strategy_${strategyArchetype}`,
    title: title,
    archetype: strategyArchetype,
    description: description,
    seasons: seasonSlots,
    overallScore: overallScore,
    soilHealthIndex: soilHealthIndex,
    waterResilienceIndex: waterResilienceIndex,
    economicSecurityIndex: economicSecurityIndex,
    climateRiskPenalty: climateRiskPenalty,
    total3YearNitrogenNetKgPerHa: Math.round(totalNitrogenBalance),
    total3YearCarbonSequestrationTonPerHa: Math.round(totalCarbonAdded * 10) / 10,
    total3YearWaterSavedM3PerHa: Math.round(waterSavedM3PerHa),
    projected3YearGrossMarginUsdPerHa: Math.round(totalGrossRevenueUsd),
    breakEvenMonths: Math.round(12 / (economicSecurityIndex / 50)),
    agroecologicalBenefits: benefits
  };
}

/**
 * Generate 3 curated archetypal strategies based on regional agro-ecological profile
 */
export function generateCuratedStrategies(
  region: AgroRegion,
  climate: NasaClimateData,
  soil: SoilProfile,
  priorities: FarmerPriorities
): {
  conventional: RotationStrategy;
  soilBuilder: RotationStrategy;
  climateShield: RotationStrategy;
  balancedProfit: RotationStrategy;
} {
  const regId = region.id;
  const isSouthAsia = regId === 'indo_gangetic';
  const isMidwest = regId === 'us_midwest';
  const isSahel = regId === 'sahel';
  const isMediterranean = regId === 'mediterranean';
  const isCerrado = regId === 'cerrado';

  // 1. CONVENTIONAL BASELINE MONOCULTURE
  let convCrops: Crop[] = [];
  if (isSouthAsia) {
    // Rice - Wheat - Fallow repeated for 2 years (6 seasons)
    convCrops = [
      getCropById('puddle_rice'), getCropById('wheat'), getCropById('puddle_rice'),
      getCropById('wheat'), getCropById('puddle_rice'), getCropById('wheat')
    ];
  } else if (isMidwest) {
    // Corn - Soy - Corn - Soy - Corn - Soy
    convCrops = [
      getCropById('corn_maize'), getCropById('soybean'), getCropById('corn_maize'),
      getCropById('soybean'), getCropById('corn_maize'), getCropById('soybean')
    ];
  } else if (isSahel) {
    // Sorghum - Fallow - Sorghum - Fallow
    convCrops = [
      getCropById('sorghum'), getCropById('sorghum'), getCropById('sorghum'),
      getCropById('sorghum'), getCropById('sorghum'), getCropById('sorghum')
    ];
  } else if (isMediterranean) {
    // Wheat - Bare Fallow - Wheat
    convCrops = [
      getCropById('wheat'), getCropById('barley'), getCropById('wheat'),
      getCropById('barley'), getCropById('wheat'), getCropById('barley')
    ];
  } else if (isCerrado) {
    convCrops = [
      getCropById('soybean'), getCropById('corn_maize'), getCropById('soybean'),
      getCropById('corn_maize'), getCropById('soybean'), getCropById('corn_maize')
    ];
  } else {
    convCrops = [
      getCropById('wheat'), getCropById('barley'), getCropById('wheat'),
      getCropById('barley'), getCropById('wheat'), getCropById('barley')
    ];
  }

  const conventional = evaluateRotationPlan(
    convCrops,
    region,
    climate,
    soil,
    priorities,
    'custom',
    'Conventional Regional Monoculture',
    `Baseline continuous practice (${region.dominantDegradedMonoculture}). High input dependency and declining soil metrics.`
  );

  // 2. STRATEGY A: SOIL REGENERATOR & NITROGEN BUILDER
  let soilBuilderCrops: Crop[] = [];
  if (isSouthAsia) {
    // Kharif Pigeon pea (deep taproot) -> Rabi Mustard -> Zaid Moong -> Kharif Rice (direct seeded) -> Rabi Chickpea -> Zaid Moong
    soilBuilderCrops = [
      getCropById('pigeon_pea'), getCropById('mustard'), getCropById('green_gram_moong'),
      getCropById('puddle_rice'), getCropById('chickpea'), getCropById('green_gram_moong')
    ];
  } else if (isMidwest) {
    // Corn -> Hairy Vetch cover -> Soybean -> Cereal Rye cover -> Wheat -> Crimson Clover
    soilBuilderCrops = [
      getCropById('corn_maize'), getCropById('hairy_vetch'), getCropById('soybean'),
      getCropById('cereal_rye'), getCropById('wheat'), getCropById('crimson_clover')
    ];
  } else if (isSahel) {
    // Cowpea -> Pearl Millet -> Cowpea -> Sorghum -> Cowpea -> Cassava
    soilBuilderCrops = [
      getCropById('cowpea'), getCropById('pearl_millet'), getCropById('cowpea'),
      getCropById('sorghum'), getCropById('cowpea'), getCropById('cassava')
    ];
  } else if (isMediterranean) {
    // Durum Wheat -> Chickpea -> Barley -> Lentil -> Mustard -> Chickpea
    soilBuilderCrops = [
      getCropById('wheat'), getCropById('chickpea'), getCropById('barley'),
      getCropById('lentil'), getCropById('mustard'), getCropById('chickpea')
    ];
  } else if (isCerrado) {
    // Soybean -> Brachiaria cover -> Cotton -> Safrinha Corn + Brachiaria -> Soybean -> Pigeon pea
    soilBuilderCrops = [
      getCropById('soybean'), getCropById('brachiaria_grass'), getCropById('cotton'),
      getCropById('corn_maize'), getCropById('soybean'), getCropById('pigeon_pea')
    ];
  } else {
    soilBuilderCrops = [
      getCropById('wheat'), getCropById('chickpea'), getCropById('canola'),
      getCropById('barley'), getCropById('lentil'), getCropById('chickpea')
    ];
  }

  const soilBuilder = evaluateRotationPlan(
    soilBuilderCrops,
    region,
    climate,
    soil,
    priorities,
    'soil_builder',
    'Soil Regenerator & Nitrogen Builder',
    'Maximizes symbiotic biological nitrogen fixation, increases organic matter, and breaks plow compaction.'
  );

  // 3. STRATEGY B: DROUGHT & CLIMATE RESILIENCE SHIELD
  let climateShieldCrops: Crop[] = [];
  if (isSouthAsia) {
    // Pearl Millet -> Mustard -> Moong -> Sorghum -> Chickpea -> Pearl Millet
    climateShieldCrops = [
      getCropById('pearl_millet'), getCropById('mustard'), getCropById('green_gram_moong'),
      getCropById('sorghum'), getCropById('chickpea'), getCropById('pearl_millet')
    ];
  } else if (isMidwest) {
    // Sorghum -> Cereal Rye -> Soybean -> Wheat -> Hairy Vetch -> Sorghum
    climateShieldCrops = [
      getCropById('sorghum'), getCropById('cereal_rye'), getCropById('soybean'),
      getCropById('wheat'), getCropById('hairy_vetch'), getCropById('sorghum')
    ];
  } else if (isSahel) {
    // Pearl Millet -> Cowpea -> Sorghum -> Cassava -> Pearl Millet -> Cowpea
    climateShieldCrops = [
      getCropById('pearl_millet'), getCropById('cowpea'), getCropById('sorghum'),
      getCropById('cassava'), getCropById('pearl_millet'), getCropById('cowpea')
    ];
  } else if (isMediterranean) {
    // Barley -> Lentil -> Mustard -> Sunflower -> Chickpea -> Barley
    climateShieldCrops = [
      getCropById('barley'), getCropById('lentil'), getCropById('mustard'),
      getCropById('sunflower'), getCropById('chickpea'), getCropById('barley')
    ];
  } else if (isCerrado) {
    // Sorghum -> Brachiaria -> Soybean -> Brachiaria -> Sorghum -> Pigeon pea
    climateShieldCrops = [
      getCropById('sorghum'), getCropById('brachiaria_grass'), getCropById('soybean'),
      getCropById('brachiaria_grass'), getCropById('sorghum'), getCropById('pigeon_pea')
    ];
  } else {
    climateShieldCrops = [
      getCropById('barley'), getCropById('lentil'), getCropById('mustard'),
      getCropById('chickpea'), getCropById('barley'), getCropById('lentil')
    ];
  }

  const climateShield = evaluateRotationPlan(
    climateShieldCrops,
    region,
    climate,
    soil,
    priorities,
    'climate_shield',
    'Drought & Climate Resilience Shield',
    'Engineered for low water footprints, C4 heat-hardy cereals, and deep-taproot survival during flash droughts.'
  );

  // 4. STRATEGY C: BALANCED HIGH-VALUE MARKET & FOOD SECURITY
  let balancedCrops: Crop[] = [];
  if (isSouthAsia) {
    // Cotton -> Chickpea -> Moong -> Rice -> Mustard -> Moong
    balancedCrops = [
      getCropById('cotton'), getCropById('chickpea'), getCropById('green_gram_moong'),
      getCropById('puddle_rice'), getCropById('mustard'), getCropById('green_gram_moong')
    ];
  } else if (isMidwest) {
    // Corn -> Hairy Vetch -> Soybean -> Wheat -> Crimson Clover -> Corn
    balancedCrops = [
      getCropById('corn_maize'), getCropById('hairy_vetch'), getCropById('soybean'),
      getCropById('wheat'), getCropById('crimson_clover'), getCropById('corn_maize')
    ];
  } else if (isSahel) {
    // Sorghum -> Cowpea -> Cassava -> Pearl Millet -> Cowpea -> Sorghum
    balancedCrops = [
      getCropById('sorghum'), getCropById('cowpea'), getCropById('cassava'),
      getCropById('pearl_millet'), getCropById('cowpea'), getCropById('sorghum')
    ];
  } else if (isMediterranean) {
    // Wheat -> Chickpea -> Sunflower -> Barley -> Lentil -> Mustard
    balancedCrops = [
      getCropById('wheat'), getCropById('chickpea'), getCropById('sunflower'),
      getCropById('barley'), getCropById('lentil'), getCropById('mustard')
    ];
  } else if (isCerrado) {
    // Soybean -> Safrinha Corn + Brachiaria -> Cotton -> Soybean -> Safrinha Corn -> Brachiaria
    balancedCrops = [
      getCropById('soybean'), getCropById('corn_maize'), getCropById('cotton'),
      getCropById('soybean'), getCropById('corn_maize'), getCropById('brachiaria_grass')
    ];
  } else {
    balancedCrops = [
      getCropById('wheat'), getCropById('canola'), getCropById('chickpea'),
      getCropById('barley'), getCropById('lentil'), getCropById('wheat')
    ];
  }

  const balancedProfit = evaluateRotationPlan(
    balancedCrops,
    region,
    climate,
    soil,
    priorities,
    'balanced_profit',
    'Balanced Market & Food Security',
    'Optimal synthesis of high-value cash returns with timely biological green manure restoration.'
  );

  return {
    conventional,
    soilBuilder,
    climateShield,
    balancedProfit
  };
}
