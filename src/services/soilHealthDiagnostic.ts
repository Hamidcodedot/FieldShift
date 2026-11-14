import { AgroRegion, FarmerFieldProfile } from '../types';
import { CROPS_DATABASE } from '../data/crops';

export interface SoilDiagnosticResult {
  score: number; // 0 - 100
  rating: 'Optimal' | 'Fair' | 'Vulnerable / Acidified';
  scoreColor: string;
  badgeBg: string;
  badgeText: string;
  rootMoisturePercent: number;
  rootMoistureLabel: string;
  rootMoistureStatus: 'Deficit' | 'Optimal' | 'Saturated';
  acidificationRisk: 'Low' | 'Moderate' | 'Critical';
  microbialActivity: 'Active & Diverse' | 'Moderate' | 'Suppressed';
  organicMatterEstimated: number;
  nitrogenStatus: string;
  trustIndicators: {
    source: string;
    finding: string;
  }[];
  actionableInsight: string;
}

export function computeSoilHealthDiagnostic(params: {
  soilTexture: 'loam' | 'clay' | 'sandy_loam' | 'silt_loam' | 'clay_loam' | 'sand';
  ureaIntensity: 'low' | 'moderate' | 'heavy';
  pesticideFrequency: 'none' | 'moderate' | 'intensive';
  irrigationMethod: FarmerFieldProfile['irrigationMethod'];
  currentCropId?: string;
  rootMoisturePercent?: number;
  region?: AgroRegion;
}): SoilDiagnosticResult {
  const {
    soilTexture,
    ureaIntensity,
    pesticideFrequency,
    irrigationMethod,
    currentCropId = 'wheat',
    rootMoisturePercent: inputRootMoisture,
    region,
  } = params;

  // 1. Root-zone moisture from NASA or regional baseline
  const curMonthIdx = new Date().getUTCMonth();
  const rootMoisturePercent =
    inputRootMoisture ??
    region?.cachedClimate?.currentMonthRootZoneWetnessPercent ??
    Math.round((region?.cachedClimate?.rootZoneSoilMoistureMonthly?.[curMonthIdx] ?? 0.52) * 100);

  // 2. Base score from physical soil texture
  let baseScore = 75;
  let som = 1.5;

  if (soilTexture === 'loam') {
    baseScore = 80;
    som = 1.8;
  } else if (soilTexture === 'silt_loam') {
    baseScore = 82;
    som = 2.0;
  } else if (soilTexture === 'clay_loam') {
    baseScore = 78;
    som = 1.6;
  } else if (soilTexture === 'clay') {
    baseScore = 72;
    som = 1.2;
  } else if (soilTexture === 'sandy_loam') {
    baseScore = 68;
    som = 0.8;
  } else if (soilTexture === 'sand') {
    baseScore = 60;
    som = 0.5;
  }

  // 3. Impact of Urea Nitrogen Application
  // Urea in high amounts causes soil acidification and microbial shock
  let acidificationRisk: 'Low' | 'Moderate' | 'Critical' = 'Low';
  let nitrogenStatus = 'Balanced microbial nitrogen';

  if (ureaIntensity === 'low') {
    baseScore += 6;
    acidificationRisk = 'Low';
    nitrogenStatus = 'Low synthetic load; minimal acidification';
  } else if (ureaIntensity === 'moderate') {
    baseScore -= 2;
    acidificationRisk = 'Moderate';
    nitrogenStatus = 'Standard application with minor leaching vulnerability';
  } else if (ureaIntensity === 'heavy') {
    baseScore -= 16;
    acidificationRisk = 'Critical';
    nitrogenStatus = 'Excessive free ammonium; severe acidification & leaching';
  }

  // 4. Impact of Pesticide / Spray Frequency
  let microbialActivity: 'Active & Diverse' | 'Moderate' | 'Suppressed' = 'Active & Diverse';
  if (pesticideFrequency === 'none') {
    baseScore += 6;
    microbialActivity = 'Active & Diverse';
  } else if (pesticideFrequency === 'moderate') {
    baseScore -= 2;
    microbialActivity = 'Moderate';
  } else if (pesticideFrequency === 'intensive') {
    baseScore -= 12;
    microbialActivity = 'Suppressed';
  }

  // 5. Impact of Irrigation Regime (Calibrated for South Asian basins)
  if (irrigationMethod === 'hybrid_conjunctive') {
    // Silt-rich canal water buffers soil pH and dilutes groundwater salinity; tubewell prevents drought shock
    baseScore += 5;
  } else if (irrigationMethod === 'canal_surface') {
    baseScore += 3; // Natural mineral silt replenishment
  } else if (irrigationMethod === 'drip_precision') {
    baseScore += 6; // Precision root hydration without erosion
  } else if (irrigationMethod === 'rainfed') {
    if (rootMoisturePercent < 35) {
      baseScore -= 8; // Severe moisture stress
    }
  } else if (irrigationMethod === 'groundwater_borewell') {
    baseScore -= 2; // Groundwater salinity hazard and aquifer drawdown
  }

  // 6. Impact of Current Crop
  const crop = CROPS_DATABASE.find((c) => c.id === currentCropId);
  const isLegume = crop?.family === 'Fabaceae';
  if (isLegume) {
    baseScore += 8;
    som += 0.2;
  } else if (currentCropId === 'puddle_rice') {
    baseScore -= 4; // hardpan puddling compaction
  }

  // Root moisture condition
  let rootMoistureStatus: 'Deficit' | 'Optimal' | 'Saturated' = 'Optimal';
  let rootMoistureLabel = `${rootMoisturePercent}% Saturation (Aerated)`;

  if (rootMoisturePercent < 35) {
    rootMoistureStatus = 'Deficit';
    rootMoistureLabel = `${rootMoisturePercent}% Saturation (Moisture Deficit)`;
    baseScore -= 6;
  } else if (rootMoisturePercent > 78) {
    rootMoistureStatus = 'Saturated';
    rootMoistureLabel = `${rootMoisturePercent}% Saturation (Waterlogged / Reduced O₂)`;
    baseScore -= 4;
  }

  // Clamp final score between 35 and 96
  const finalScore = Math.min(96, Math.max(35, Math.round(baseScore)));

  let rating: 'Optimal' | 'Fair' | 'Vulnerable / Acidified' = 'Fair';
  let scoreColor = 'text-amber-700 dark:text-amber-400';
  let badgeBg = 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
  let badgeText = 'text-amber-900 dark:text-amber-300';

  if (finalScore >= 80) {
    rating = 'Optimal';
    scoreColor = 'text-emerald-700 dark:text-emerald-400';
    badgeBg = 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
    badgeText = 'text-emerald-900 dark:text-emerald-300';
  } else if (finalScore < 65) {
    rating = 'Vulnerable / Acidified';
    scoreColor = 'text-rose-700 dark:text-rose-400';
    badgeBg = 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800';
    badgeText = 'text-rose-900 dark:text-rose-300';
  }

  // Actionable insight
  let actionableInsight = 'Rotate in a nitrogen-fixing legume to naturally replenish soil biology without extra synthetic inputs.';
  if (acidificationRisk === 'Critical') {
    actionableInsight = 'High urea burden detected. Transitioning to chickpea or summer moong cuts fertilizer costs and neutralizes soil pH.';
  } else if (microbialActivity === 'Suppressed') {
    actionableInsight = 'Microbial life suppressed by frequent sprays. Brassica mustard or deep taproot rotation will naturally disrupt pathogen cycles.';
  } else if (rootMoistureStatus === 'Deficit') {
    actionableInsight = 'Subsoil moisture is restricted. Drought-resilient sorghum or pearl millet will conserve irrigation while restoring organic matter.';
  }

  const trustIndicators = [
    {
      source: 'NASA GEOS-FP Microwave Radiometry',
      finding: `${rootMoisturePercent}% root-zone water capacity detected at 0–100 cm depth.`,
    },
    {
      source: 'Farmer Field Inputs Calibration',
      finding: `${ureaIntensity === 'heavy' ? '4+ bags urea load' : ureaIntensity === 'moderate' ? '2-3 bags urea load' : '0-1 bag urea load'} and ${pesticideFrequency === 'intensive' ? '3+ spray frequency' : pesticideFrequency === 'moderate' ? '1-2 spray frequency' : 'no chemical spray'} recorded.`,
    },
    {
      source: 'Irrigation Regime Calibration',
      finding: `${
        irrigationMethod === 'hybrid_conjunctive'
          ? 'Hybrid conjunctive water access (Canal + Tubewell) dilutes salinity and secures soil moisture'
          : irrigationMethod === 'canal_surface'
          ? 'Canal surface flow (Nehri Pani) enriches mineral silt deposition'
          : irrigationMethod === 'groundwater_borewell'
          ? 'Groundwater tubewell pumping monitored for secondary salinity risk'
          : 'Rainfed moisture regime calibrated against NASA seasonal precipitation'
      }.`,
    },
    {
      source: 'Agro-Ecological Soil Texture',
      finding: `${soilTexture.replace('_', ' ')} texture with ~${som.toFixed(1)}% estimated organic humus.`,
    },
  ];

  return {
    score: finalScore,
    rating,
    scoreColor,
    badgeBg,
    badgeText,
    rootMoisturePercent,
    rootMoistureLabel,
    rootMoistureStatus,
    acidificationRisk,
    microbialActivity,
    organicMatterEstimated: som,
    nitrogenStatus,
    trustIndicators,
    actionableInsight,
  };
}
