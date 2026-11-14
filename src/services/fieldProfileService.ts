import { FarmerFieldProfile, AgroRegion } from '../types';

const STORAGE_KEY_SINGLE = 'fieldshift_farmer_profile';
const STORAGE_KEY_FIELDS = 'fieldshift_farmer_fields';
const STORAGE_KEY_ACTIVE_ID = 'fieldshift_active_field_id';

export const COMMON_CROP_ROTATION_PATTERNS = [
  {
    id: 'rice_wheat',
    label: 'Rice ➔ Wheat (Intensive Cereal Monoculture)',
    previousCropId: 'puddle_rice',
    currentCropId: 'wheat',
    description: 'High irrigation demand, severe subsoil compaction, and high fungal/pest carryover.',
    typicalRegion: 'indo_gangetic',
  },
  {
    id: 'corn_soy',
    label: 'Corn ➔ Soybean (Continuous Row Crop)',
    previousCropId: 'corn_maize',
    currentCropId: 'soybean',
    description: 'High nitrogen demand in corn phase, risk of tile drainage nitrate loss.',
    typicalRegion: 'us_midwest',
  },
  {
    id: 'cotton_wheat',
    label: 'Cotton ➔ Wheat (Cash Crop + Cereal)',
    previousCropId: 'cotton',
    currentCropId: 'wheat',
    description: 'Depletes deep subsoil nutrients, high pesticide burden, pest cycle risk.',
    typicalRegion: 'indo_gangetic',
  },
  {
    id: 'millet_fallow',
    label: 'Pearl Millet / Sorghum ➔ Dry Fallow',
    previousCropId: 'pearl_millet',
    currentCropId: 'fallow',
    description: 'Rainfed semi-arid profile with low water consumption and bare soil erosion risks.',
    typicalRegion: 'sahel',
  },
  {
    id: 'cereal_rye_sunflower',
    label: 'Winter Cereal ➔ Sunflower / Oilseed',
    previousCropId: 'barley',
    currentCropId: 'sunflower',
    description: 'Mediterranean or dryland rotation with moderate water deficit.',
    typicalRegion: 'mediterranean',
  },
];

export function generateFieldId(): string {
  return 'field_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
}

export function getDefaultFieldProfile(region: AgroRegion, customName?: string): FarmerFieldProfile {
  let defaultPattern = COMMON_CROP_ROTATION_PATTERNS[0];
  if (region.id === 'us_midwest') {
    defaultPattern = COMMON_CROP_ROTATION_PATTERNS[1];
  } else if (region.id === 'sahel_semiarid') {
    defaultPattern = COMMON_CROP_ROTATION_PATTERNS[3];
  } else if (region.id === 'mediterranean') {
    defaultPattern = COMMON_CROP_ROTATION_PATTERNS[4];
  }

  const baseName = customName || `${region.name.split(' (')[0]} Farm`;

  return {
    id: generateFieldId(),
    isConfigured: false,
    hasCompletedOnboarding: false,
    farmName: baseName,
    farmerName: 'Hamid Shahid',
    placeName: region.name.split(' (')[0],
    latitude: region.latitude,
    longitude: region.longitude,
    currentCropHistory: {
      previousCropId: defaultPattern.previousCropId,
      currentCropId: defaultPattern.currentCropId,
      patternLabel: defaultPattern.label,
    },
    irrigationMethod: 'groundwater_borewell',
    soilTexture: 'loam',
    soilOrganicMatter: 1.5,
    fieldSizeAcres: 5,
    createdAt: new Date().toISOString(),
    sowingDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default: ~18 days into season
  };
}

/**
 * Calculates days elapsed since sowing date
 */
export function calculateDaysSinceSowing(sowingDate?: string): number {
  if (!sowingDate) return 0;
  try {
    const sown = new Date(sowingDate).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - sown) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch {
    return 0;
  }
}

/**
 * Derives agronomic growth stage from days after sowing and typical crop duration
 */
export function getCropGrowthStage(days: number, totalDurationDays = 120): {
  stageName: string;
  stageCategory: 'early' | 'vegetative' | 'flowering' | 'maturing' | 'harvest_ready';
  progressPercent: number;
} {
  const progressPercent = Math.min(100, Math.round((days / Math.max(30, totalDurationDays)) * 100));

  if (progressPercent <= 15) {
    return { stageName: 'Germination & Emergence', stageCategory: 'early', progressPercent };
  } else if (progressPercent <= 45) {
    return { stageName: 'Vegetative & Tillering', stageCategory: 'vegetative', progressPercent };
  } else if (progressPercent <= 75) {
    return { stageName: 'Flowering & Heading', stageCategory: 'flowering', progressPercent };
  } else if (progressPercent < 100) {
    return { stageName: 'Grain Filling & Pod Development', stageCategory: 'maturing', progressPercent };
  } else {
    return { stageName: 'Physiological Maturity (Harvest Window)', stageCategory: 'harvest_ready', progressPercent: 100 };
  }
}

/**
 * Returns human-readable label for irrigation regime
 */
export function formatIrrigationMethod(method?: string): string {
  switch (method) {
    case 'hybrid_conjunctive':
      return 'Hybrid (Canal + Tubewell)';
    case 'canal_surface':
      return 'Canal (Nehri Pani)';
    case 'groundwater_borewell':
      return 'Tubewell (Groundwater)';
    case 'rainfed':
      return 'Rainfed (Barani)';
    case 'drip_precision':
      return 'Drip Precision';
    default:
      return method ? method.replace('_', ' ') : 'Tubewell (Groundwater)';
  }
}

export function checkIsOnboardingCompleted(): boolean {
  try {
    // Check multiple fields storage first
    const savedFields = localStorage.getItem(STORAGE_KEY_FIELDS);
    if (savedFields) {
      const parsed = JSON.parse(savedFields);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.some((f) => Boolean(f.isConfigured || f.hasCompletedOnboarding));
      }
    }

    // Fallback to legacy single profile
    const savedSingle = localStorage.getItem(STORAGE_KEY_SINGLE);
    if (savedSingle) {
      const parsed = JSON.parse(savedSingle);
      return Boolean(parsed?.isConfigured || parsed?.hasCompletedOnboarding);
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Loads all farmer fields from localStorage, automatically migrating legacy single-profile if present.
 */
export function loadAllFields(defaultRegion: AgroRegion): FarmerFieldProfile[] {
  try {
    const savedFields = localStorage.getItem(STORAGE_KEY_FIELDS);
    if (savedFields) {
      const parsed = JSON.parse(savedFields);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((field: Partial<FarmerFieldProfile>, idx: number) => ({
          ...getDefaultFieldProfile(defaultRegion, `Field ${idx + 1}`),
          ...field,
          id: field.id || generateFieldId(),
        }));
      }
    }

    // Check legacy single-profile and migrate to fields array
    const savedLegacy = localStorage.getItem(STORAGE_KEY_SINGLE);
    if (savedLegacy) {
      const parsed = JSON.parse(savedLegacy);
      if (parsed && typeof parsed === 'object') {
        const migrated: FarmerFieldProfile = {
          ...getDefaultFieldProfile(defaultRegion, parsed.farmName || 'Main Field'),
          ...parsed,
          id: parsed.id || generateFieldId(),
        };
        const initialList = [migrated];
        saveAllFields(initialList);
        setActiveFieldId(migrated.id);
        return initialList;
      }
    }
  } catch (err) {
    console.warn('Error reading farmer fields from localStorage:', err);
  }

  const initialField = getDefaultFieldProfile(defaultRegion, 'Main Field');
  return [initialField];
}

/**
 * Persists all fields to localStorage and keeps active field synced to legacy storage for backwards compatibility.
 */
export function saveAllFields(fields: FarmerFieldProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(fields));

    // Also sync the active or first field to legacy single storage key
    const activeId = getActiveFieldId(fields);
    const activeField = fields.find((f) => f.id === activeId) || fields[0];
    if (activeField) {
      localStorage.setItem(STORAGE_KEY_SINGLE, JSON.stringify(activeField));
    }
  } catch (err) {
    console.warn('Error saving farmer fields to localStorage:', err);
  }
}

/**
 * Gets the active field ID from localStorage, falling back to first field.
 */
export function getActiveFieldId(fields: FarmerFieldProfile[]): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (saved && fields.some((f) => f.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return fields[0]?.id || '';
}

/**
 * Sets the active field ID in localStorage.
 */
export function setActiveFieldId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.warn('Error saving active field ID:', err);
  }
}

/**
 * Legacy single-field loader: returns active field from multi-field storage or creates default.
 */
export function loadSavedFieldProfile(region: AgroRegion): FarmerFieldProfile {
  const fields = loadAllFields(region);
  const activeId = getActiveFieldId(fields);
  return fields.find((f) => f.id === activeId) || fields[0] || getDefaultFieldProfile(region);
}

/**
 * Legacy single-field saver: upserts active field into multi-field storage.
 */
export function saveFieldProfile(profile: FarmerFieldProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_SINGLE, JSON.stringify(profile));
    const fields = loadAllFields({
      id: 'template',
      name: profile.placeName,
      subTitle: '',
      country: '',
      latitude: profile.latitude,
      longitude: profile.longitude,
      elevationMeters: 0,
      climateZone: '',
      dominantDegradedMonoculture: '',
      primaryDegradationRisk: '',
      typicalSoil: {
        texture: profile.soilTexture,
        ph: 7,
        organicMatterPercent: profile.soilOrganicMatter,
        totalAvailableWaterCapacityMm: 140,
        fieldCapacityVolPercent: 28,
        permanentWiltingPointVolPercent: 14,
        drainageClass: 'moderate',
        salinityHazardDsm: 1.2,
      },
      cachedClimate: {} as any,
      seasons: [],
    });

    const existingIdx = fields.findIndex((f) => f.id === profile.id);
    let updated: FarmerFieldProfile[];
    if (existingIdx >= 0) {
      updated = [...fields];
      updated[existingIdx] = profile;
    } else {
      updated = [...fields, profile];
    }
    saveAllFields(updated);
    setActiveFieldId(profile.id);
  } catch (err) {
    console.warn('Error saving field profile:', err);
  }
}

/**
 * Creates and returns a new field parcel template.
 */
export function createNewField(templateRegion: AgroRegion, existingCount: number): FarmerFieldProfile {
  const fieldNum = existingCount + 1;
  const newProfile = getDefaultFieldProfile(templateRegion, `Field ${fieldNum}`);
  newProfile.isConfigured = false;
  return newProfile;
}
