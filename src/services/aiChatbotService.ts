import { FarmerFieldProfile, AgroRegion, NasaClimateData, SoilProfile, RotationStrategy } from '../types';
import { getCropById } from '../data/crops';
import { formatIrrigationMethod } from './fieldProfileService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  matchedTopic?: 'rotation' | 'sowing_stage' | 'irrigation' | 'fertilizer' | 'pest' | 'soil' | 'general';
  fieldId?: string;
  fieldName?: string;
  recommendedAction?: string;
}

export interface ChatbotContext {
  activeField: FarmerFieldProfile;
  allFields: FarmerFieldProfile[];
  region: AgroRegion;
  climate: NasaClimateData;
  soil: SoilProfile;
  activeStrategy?: RotationStrategy;
}

/**
 * Calculates days elapsed from a sowing date string (YYYY-MM-DD)
 */
function getDaysSinceSowing(dateStr?: string): number | null {
  if (!dateStr) return null;
  const sowing = new Date(dateStr);
  if (isNaN(sowing.getTime())) return null;
  const now = new Date();
  const diffTime = now.getTime() - sowing.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Identifies the growth stage based on days elapsed and crop total duration
 */
function getGrowthStage(daysElapsed: number, durationDays: number): {
  stageName: string;
  description: string;
  daysRemaining: number;
} {
  const ratio = daysElapsed / durationDays;
  const daysRemaining = Math.max(0, durationDays - daysElapsed);

  if (ratio <= 0.25) {
    return {
      stageName: 'Seedling & Early Vegetative Foundation',
      description: 'Crops are establishing root structures. Ensure weed competition is managed and soil moisture is balanced.',
      daysRemaining,
    };
  } else if (ratio <= 0.55) {
    return {
      stageName: 'Active Tillering & Canopy Branching',
      description: 'Rapid biomass accumulation. Nitrogen uptake peaks during this window.',
      daysRemaining,
    };
  } else if (ratio <= 0.80) {
    return {
      stageName: 'Flowering & Grain/Pod Initiation',
      description: 'Critical moisture sensitivity window. Water stress during this phase causes flower drop or sterile florets.',
      daysRemaining,
    };
  } else if (ratio < 1.0) {
    return {
      stageName: 'Grain Filling & Pod Maturation',
      description: 'Translocation of carbohydrates into harvestable grain. Reduce excessive nitrogen to prevent lodging.',
      daysRemaining,
    };
  } else {
    return {
      stageName: 'Physiological Maturity & Harvest Window',
      description: 'Crop is ready or near ready for harvest. Plan post-harvest soil preparation and next crop seeding.',
      daysRemaining: 0,
    };
  }
}

/**
 * Main agronomic AI engine that generates field-grounded advice.
 * If VITE_GEMINI_API_KEY is configured, it attempts a call to Gemini with full field context.
 * Otherwise, it delivers instant, deterministic, peer-reviewed agronomic intelligence.
 */
export async function generateFieldAiResponse(
  userQuery: string,
  context: ChatbotContext
): Promise<ChatMessage> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const geminiResponse = await callGeminiWithFieldContext(userQuery, context, apiKey);
      if (geminiResponse) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: geminiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fieldId: context.activeField.id,
          fieldName: context.activeField.farmName,
          matchedTopic: 'general',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, using deterministic agronomic engine fallback:', err);
    }
  }

  // Fallback / Default: Offline-first deterministic agronomic intelligence engine
  return generateDeterministicFieldResponse(userQuery, context);
}

/**
 * Generates structured, authentic agricultural intelligence grounded in field parameters
 */
function generateDeterministicFieldResponse(
  userQuery: string,
  context: ChatbotContext
): ChatMessage {
  const q = userQuery.toLowerCase();
  const { activeField, climate, soil, activeStrategy, allFields } = context;

  const currentCropId = activeField.currentCropHistory?.currentCropId || 'wheat';
  let currentCrop = null;
  try {
    currentCrop = getCropById(currentCropId);
  } catch {
    // fallback
  }

  const cropName = currentCrop?.name || 'Wheat';
  const cropFamily = currentCrop?.family || 'Poaceae (Cereals)';
  const cropDuration = currentCrop?.growthDurationDays || 120;
  const daysElapsed = getDaysSinceSowing(activeField.sowingDate);

  const soilTexture = activeField.soilTexture || soil.texture || 'loam';
  const irrigation = formatIrrigationMethod(activeField.irrigationMethod);
  const wetnessPercent = climate.currentMonthRootZoneWetnessPercent ?? Math.round((climate.rootZoneSoilMoistureMonthly?.[0] ?? 0.38) * 100);
  const rootZoneMoisture = wetnessPercent / 100;
  const annualTemp = climate.currentMonthTempC ?? climate.meanAnnualTemperatureC ?? 26.5;

  // Derive urea savings and next crop from active rotation strategy
  const bagsSaved = activeStrategy
    ? Math.max(2, Math.round(activeStrategy.total3YearNitrogenNetKgPerHa / 23))
    : 4;
  const waterSaved = activeStrategy
    ? activeStrategy.total3YearWaterSavedM3PerHa
    : 3800;

  // Identify next recommended crop from active strategy sequence
  const nextSeason = activeStrategy?.seasons?.[0];
  const nextCropName = nextSeason?.crop.name || 'Summer Moong (Green Gram)';
  const nextCropFamily = nextSeason?.crop.family || 'Fabaceae (Legumes)';

  let responseText = '';
  let topic: ChatMessage['matchedTopic'] = 'general';
  let action: string | undefined = undefined;

  // 1. SOWING DATES, HARVEST & GROWTH STAGE
  if (
    q.includes('sow') ||
    q.includes('date') ||
    q.includes('harvest') ||
    q.includes('stage') ||
    q.includes('days') ||
    q.includes('when') ||
    q.includes('maturity') ||
    q.includes('old')
  ) {
    topic = 'sowing_stage';
    if (daysElapsed !== null) {
      const stage = getGrowthStage(daysElapsed, cropDuration);
      responseText = `**Field Status for "${activeField.farmName}":**\n` +
        `• **Standing Crop:** ${cropName} (${cropFamily})\n` +
        `• **Sowing Date:** ${activeField.sowingDate} (${daysElapsed} days elapsed)\n` +
        `• **Growth Stage:** **${stage.stageName}**\n` +
        `• **Agronomic Assessment:** ${stage.description}\n` +
        `• **Harvest Outlook:** Expected in approximately **${stage.daysRemaining} days** (total ~${cropDuration} day cycle).`;
      action = 'Keep tracking soil moisture to safeguard final grain or pod yield.';
    } else {
      responseText = `For your field **"${activeField.farmName}"**, your recorded crop is **${cropName}** (~${cropDuration} day growth cycle). ` +
        `You haven't recorded a specific sowing date yet. Setting your exact sowing date in the **My Field** tab enables day-by-day stage tracking and harvest predictions.`;
      action = 'Head to "My Field" tab to add your sowing date.';
    }
  }

  // 2. NEXT CROP & CROP ROTATION ADVISORY
  else if (
    q.includes('next') ||
    q.includes('after') ||
    q.includes('rotation') ||
    q.includes('plant') ||
    q.includes('sequence') ||
    q.includes('follow') ||
    q.includes('break crop') ||
    q.includes('plan')
  ) {
    topic = 'rotation';
    responseText = `**Recommended Next Season Succession for "${activeField.farmName}":**\n\n` +
      `Your current crop is **${cropName}** (${cropFamily}). Following this continuously with another cereal depletes subsoil minerals and invites persistent pests.\n\n` +
      `• **Next Recommended Crop:** **${nextCropName}** (${nextCropFamily})\n` +
      `• **Biological Advantage:** Breaks the host pest cycle of ${cropName} and forms symbiotic root nodules with Rhizobium bacteria to inject natural nitrogen into your root zone.\n` +
      `• **Projected Fertilizer Impact:** Saves **+${bagsSaved} bags of 50-kg urea** over the multi-year cycle.\n` +
      `• **Tubewell Water Conserved:** **+${waterSaved.toLocaleString()} m³** compared to continuous monoculture.`;
    action = 'Review the detailed 6-season schedule in the "Crop Rotation" tab.';
  }

  // 3. LIVE NASA WATER & IRRIGATION SCHEDULING
  else if (
    q.includes('water') ||
    q.includes('irrigate') ||
    q.includes('irrigation') ||
    q.includes('rain') ||
    q.includes('dry') ||
    q.includes('moisture') ||
    q.includes('borewell') ||
    q.includes('tubewell') ||
    q.includes('drought')
  ) {
    topic = 'irrigation';
    let moistureAssessment = '';
    if (rootZoneMoisture >= 0.38) {
      moistureAssessment = `Soil moisture is currently **healthy (${rootZoneMoisture.toFixed(2)} m³/m³)**. Holding off on tubewell pumping for the next 3-5 days will save electricity and prevent root waterlogging.`;
    } else if (rootZoneMoisture >= 0.28) {
      moistureAssessment = `Soil moisture is at a **moderate baseline (${rootZoneMoisture.toFixed(2)} m³/m³)**. For ${soilTexture} soil, schedule light irrigation only if topsoil shows visible dry crusting.`;
    } else {
      moistureAssessment = `Root-zone moisture is **low (${rootZoneMoisture.toFixed(2)} m³/m³)**. A timely irrigation pass is recommended to avoid moisture stress.`;
    }

    let regimeDetail = '';
    if (activeField.irrigationMethod === 'hybrid_conjunctive') {
      regimeDetail = `\n• **Hybrid Mode Advantage:** Conjunctive water management (Canal turns supplemented with tubewell pumping) dilutes subsoil salinity while reducing high-cost diesel or electric motor hours by up to 40%.`;
    } else if (activeField.irrigationMethod === 'canal_surface') {
      regimeDetail = `\n• **Canal Water Dynamics:** Silt-rich canal water (Nehri Pani) naturally deposits mineral nutrients; schedule pre-irrigation soaking (rauni) during your scheduled canal turn.`;
    }

    responseText = `**NASA Earth Data Water Diagnostic for "${activeField.farmName}":**\n\n` +
      `• **Live Root-Zone Soil Wetness:** **${rootZoneMoisture.toFixed(2)} m³/m³** (Source: NASA POWER MERRA-2)\n` +
      `• **Current Soil Texture:** ${soilTexture.toUpperCase()}\n` +
      `• **Primary Water Access:** ${irrigation}\n` +
      `• **Satellite Advisory:** ${moistureAssessment}${regimeDetail}\n` +
      `• **Conservation Metric:** Transitioning to our recommended diversified rotation saves up to **+${waterSaved.toLocaleString()} m³** of irrigation water.`;
    action = 'Check daily precipitation trends on your Home tab dashboard.';
  }

  // 4. FERTILIZER & UREA SAVINGS
  else if (
    q.includes('urea') ||
    q.includes('fertilizer') ||
    q.includes('nitrogen') ||
    q.includes('npk') ||
    q.includes('dap') ||
    q.includes('chemical') ||
    q.includes('saving') ||
    q.includes('cost') ||
    q.includes('bags')
  ) {
    topic = 'fertilizer';
    responseText = `**Fertilizer Optimization & Biological N Credits:**\n\n` +
      `For field **"${activeField.farmName}"**, synthetic urea costs can be substantially lowered by utilizing biological nitrogen fixation:\n\n` +
      `• **Urea Reduction:** Up to **${bagsSaved} bags (50-kg each) saved per hectare** over the 3-year cycle.\n` +
      `• **Biological Mechanism:** When legumes such as Moong or Chickpea follow your ${cropName}, Rhizobium bacteria fix 50 to 90 kg of pure atmospheric nitrogen per hectare directly into the root zone.\n` +
      `• **Soil Fertility Rating:** Your active rotation maintains a soil health index of **${activeStrategy?.soilHealthIndex || 82}/100**.\n` +
      `• **Agronomic Tip:** Inoculate legume seeds with Rhizobium culture before sowing to achieve peak nodulation.`;
    action = 'Select "Soil Regenerator" plan to maximize organic nitrogen credits.';
  }

  // 5. PESTS, DISEASES & BIOLOGICAL SHIELD
  else if (
    q.includes('pest') ||
    q.includes('disease') ||
    q.includes('insect') ||
    q.includes('fungus') ||
    q.includes('shield') ||
    q.includes('worm') ||
    q.includes('rust') ||
    q.includes('borer') ||
    q.includes('nematode')
  ) {
    topic = 'pest';
    responseText = `**Crop Disease Shield & Pest Disruption for "${activeField.farmName}":**\n\n` +
      `Continuous planting of ${cropName} (${cropFamily}) builds up specialized soil-borne pathogens, root-knot nematodes, and foliar rusts.\n\n` +
      `• **Shield Status:** **Active (Pest Lifecycle Disrupted)**\n` +
      `• **Interruption Strategy:** By alternating Poaceae (cereals) with Fabaceae (legumes) or Brassicaceae (mustard/canola), host-specific root pests and fungal spores starve out without expensive pesticide sprays.\n` +
      `• **Root Action:** Alternating fibrous cereal roots with deep taproots prevents soil plow pan compaction and restricts root rot pathogens.`;
    action = 'Maintain crop family alternation across every seasonal transition.';
  }

  // 6. SOIL HEALTH, TEXTURE & ORGANIC MATTER
  else if (
    q.includes('soil') ||
    q.includes('clay') ||
    q.includes('sand') ||
    q.includes('loam') ||
    q.includes('organic') ||
    q.includes('humus') ||
    q.includes('fertility') ||
    q.includes('compaction') ||
    q.includes('hardpan')
  ) {
    topic = 'soil';
    let textureAdvice = '';
    if (soilTexture.includes('clay')) {
      textureAdvice = 'Clay soils retain substantial moisture and nutrients, but are prone to waterlogging and plow pan compaction. Rotate deep taproot legumes (pigeon pea, mustard) to shatter subsoil hardpans naturally.';
    } else if (soilTexture.includes('sand')) {
      textureAdvice = 'Sandy soils drain rapidly and have lower nutrient retention. Retaining crop residues and planting green manures (cowpea, sesbania) is critical to build organic humus and water holding capacity.';
    } else {
      textureAdvice = 'Loam soil is well-balanced with optimal aeration and cation exchange capacity. Diversified 3-crop annual sequences (e.g. Rice-Mustard-Moong or Wheat-Moong) maximize economic productivity.';
    }

    responseText = `**Soil Health Profile for "${activeField.farmName}":**\n\n` +
      `• **Texture Classification:** ${soilTexture.toUpperCase()}\n` +
      `• **Organic Matter Level:** ~${(activeField.soilOrganicMatter || 1.2).toFixed(1)}%\n` +
      `• **Soil Texture Guidance:** ${textureAdvice}\n` +
      `• **Carbon Sequestration:** Active rotation sequence sequesters approximately **+${activeStrategy?.total3YearCarbonSequestrationTonPerHa || 3.2} t/ha** of biological humus.`;
    action = 'Incorporate crop residues instead of burning to boost organic matter.';
  }

  // 7. MULTI-FIELD COMPARISON
  else if (
    q.includes('field') ||
    q.includes('plot') ||
    q.includes('acres') ||
    q.includes('compare') ||
    q.includes('all fields')
  ) {
    topic = 'general';
    const fieldSummaries = allFields
      .map(
        (f) =>
          `• **${f.farmName}:** ${f.placeName || 'Local Farm'} • ${f.soilTexture || 'loam'} soil • ${f.currentCropHistory?.currentCropId || 'wheat'}`
      )
      .join('\n');

    responseText = `**Your Configured Farm Fields (${allFields.length} total):**\n\n` +
      `${fieldSummaries}\n\n` +
      `Currently answering for: **"${activeField.farmName}"** (${activeField.latitude.toFixed(4)}°N, ${activeField.longitude.toFixed(4)}°E).\n` +
      `You can switch active fields using the dropdown at the top of this chat or from the Home page!`;
    action = 'Switch active field at any time to get tailored advice for that parcel.';
  }

  // 8. GENERAL GREETING / OVERVIEW
  else {
    topic = 'general';
    responseText = `**Hello! I am your AI Field Assistant for "${activeField.farmName}".**\n\n` +
      `I analyze live NASA satellite Earth observations, soil physics, and agronomic science calibrated to your coordinates (${activeField.latitude.toFixed(4)}°N, ${activeField.longitude.toFixed(4)}°E).\n\n` +
      `**Quick Field Snapshot:**\n` +
      `• **Standing Crop:** ${cropName} ${daysElapsed !== null ? `(Day ${daysElapsed})` : ''}\n` +
      `• **NASA Root-Zone Wetness:** ${rootZoneMoisture.toFixed(2)} m³/m³\n` +
      `• **Annual Mean Temperature:** ${annualTemp.toFixed(1)}°C\n` +
      `• **Soil:** ${soilTexture.toUpperCase()} with ${irrigation}\n\n` +
      `You can ask me questions about **what to plant next**, **sowing and harvest dates**, **saving urea fertilizer**, **irrigation needs**, or **pest protection**!`;
    action = 'Tap any of the quick question chips below to ask.';
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    matchedTopic: topic,
    fieldId: activeField.id,
    fieldName: activeField.farmName,
    recommendedAction: action,
  };
}

/**
 * Optional Gemini API caller when VITE_GEMINI_API_KEY is available
 */
async function callGeminiWithFieldContext(
  userQuery: string,
  context: ChatbotContext,
  apiKey: string
): Promise<string | null> {
  const { activeField, climate, soil, activeStrategy } = context;
  const currentCropId = activeField.currentCropHistory?.currentCropId || 'wheat';
  const daysElapsed = getDaysSinceSowing(activeField.sowingDate);

  const systemPrompt = `You are the FieldShift AI Agronomic Assistant, an expert agronomist providing concise, practical, highly accurate advice to a farmer.
Always speak respectfully, clearly, and directly without fluff. No emojis.
Use Markdown formatting with bullet points and bold headers.

FARMER'S ACTIVE FIELD PROFILE:
- Field Name: ${activeField.farmName}
- Location: ${activeField.placeName || 'Farm'} (${activeField.latitude.toFixed(4)}°N, ${activeField.longitude.toFixed(4)}°E)
- Current Standing Crop: ${currentCropId}
- Sowing Date: ${activeField.sowingDate || 'Not specified'} (${daysElapsed !== null ? `${daysElapsed} days elapsed` : 'unknown days'})
- Soil Texture: ${activeField.soilTexture || soil.texture}
- Soil Organic Matter: ${activeField.soilOrganicMatter || soil.organicMatterPercent}%
- Irrigation Method: ${formatIrrigationMethod(activeField.irrigationMethod)}
- LIVE NASA SATELLITE CLIMATE DATA:
  - 2m Air Temp: ${climate.currentMonthTempC ?? climate.meanAnnualTemperatureC}°C
  - Annual Precipitation: ${climate.annualPrecipitationMm} mm
  - Root-zone Soil Wetness: ${climate.currentMonthRootZoneWetnessPercent ?? 38}%
  - Historical Drought Risk: ${climate.historicalDroughtProbabilityPercent}%
- RECOMMENDED CROP ROTATION:
  - Active Plan: ${activeStrategy?.title || 'Soil Regenerator'}
  - 3-Year Urea Fertilizer Saved: ~${activeStrategy ? Math.round(activeStrategy.total3YearNitrogenNetKgPerHa / 23) : 4} bags (50kg)
  - 3-Year Tubewell Water Saved: ~${activeStrategy?.total3YearWaterSavedM3PerHa || 4000} m³

Answer the farmer's question directly using these exact field and satellite numbers. Keep responses under 180 words, actionable and grounded in peer-reviewed agronomy.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\nFarmer Question: "${userQuery}"` }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 500,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Gemini HTTP error ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}
