import React from 'react';
import {
  Wheat,
  Bean,
  Flower2,
  Clover,
  LeafyGreen,
  Carrot,
  Sprout,
  Sun,
} from 'lucide-react';
import { BotanicalFamily } from '../types';

// ============================================================================
// Specialized Lucide-compatible SVG Vector Crop Icons (Zero-Emoji, 2px stroke)
// ============================================================================

/**
 * Rice Panicle Icon: Distinctive wetland drooping grain spikelet
 */
export const RiceIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Arching wetland stalk */}
    <path d="M5 21c2.5-6 6.5-12 14-14" />
    {/* Hanging rice grains */}
    <path d="M16 8c1.5-1 3 0 3 1.5s-1.5 2-3 1" />
    <path d="M13 11c1.5-1 3 0 3 1.5s-1.5 2-3 1" />
    <path d="M10 14c1.5-1 3 0 3 1.5s-1.5 2-3 1" />
    <path d="M8 17c1.5-1 3 0 3 1.5s-1.5 2-3 1" />
    {/* Opposite grains */}
    <path d="M18 5c-1 1.5-2.5 1-3 0s0-2.5 1.5-2.5" />
    <path d="M15 8c-1 1.5-2.5 1-3 0s0-2.5 1.5-2.5" />
    <path d="M12 11c-1 1.5-2.5 1-3 0s0-2.5 1.5-2.5" />
  </svg>
);

/**
 * Pea / Legume Pod Icon: Distinctive Fabaceae pulse pod with enclosed seeds
 */
export const PeaPodIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Legume pod hull */}
    <path d="M4 19c4-1 12-4 16-14-6 1-13 7-16 14z" />
    {/* Attachment stem */}
    <path d="M20 5c1-1 2-1.5 2-2" />
    {/* Nitrogen-fixing seeds inside */}
    <circle cx="9" cy="15" r="1.5" fill="currentColor" fillOpacity="0.25" />
    <circle cx="13" cy="12" r="1.5" fill="currentColor" fillOpacity="0.25" />
    <circle cx="16.5" cy="8.5" r="1.5" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

/**
 * Cotton Boll Icon: Distinctive 4-lobed fiber boll on calyx
 */
export const CottonIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Stem & bracts */}
    <path d="M12 21v-3" />
    <path d="M7 17c2-1 5-1 5-2" />
    <path d="M17 17c-2-1-5-1-5-2" />
    {/* Cotton fiber lobes */}
    <path d="M9 13.5a3 3 0 0 1-2.5-4.8A3 3 0 0 1 10.5 5a3 3 0 0 1 5 1.2 3 3 0 0 1 1.5 5.5A3 3 0 0 1 12 15c-1 0-2-.5-3-1.5z" />
  </svg>
);

/**
 * Maize / Corn Ear Icon: Characteristic ear with husks
 */
export const CornIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Husks */}
    <path d="M6 21c2-5 5-8 5-13" />
    <path d="M18 21c-2-5-5-8-5-13" />
    {/* Corn Ear */}
    <ellipse cx="12" cy="10" rx="3.5" ry="6" />
    <line x1="12" y1="5" x2="12" y2="15" />
    <line x1="9.5" y1="8" x2="14.5" y2="8" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);

// ============================================================================
// Comprehensive Crop Theme & Icon Resolution Engine
// ============================================================================

export interface CropThemeConfig {
  icon: React.ReactElement;
  boxClass: string;
  badgeClass: string;
  themeName: string;
}

/**
 * Returns the exact, scientifically calibrated icon and color theme for ANY crop.
 * Uses exact crop ID matching, with intelligent botanical family and category fallbacks.
 */
export function getCropThemeConfig(
  cropId?: string,
  family?: BotanicalFamily | string,
  category?: string,
  iconClassName = 'h-5 w-5'
): CropThemeConfig {
  const normalizedId = (cropId || '').toLowerCase().trim();
  const normalizedFamily = (family || '').toLowerCase().trim();
  const normalizedCategory = (category || '').toLowerCase().trim();

  // 1. EXACT CROP ID RESOLUTION
  // --------------------------------------------------------------------------
  // Rice / Wetland Cereals
  if (normalizedId.includes('rice') || normalizedId.includes('puddle') || normalizedId.includes('paddy')) {
    return {
      icon: <RiceIcon className={iconClassName} />,
      boxClass: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-300',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300',
      themeName: 'wetland_rice',
    };
  }

  // Wheat, Barley, Cereal Rye
  if (
    normalizedId.includes('wheat') ||
    normalizedId.includes('gandum') ||
    normalizedId.includes('barley') ||
    normalizedId.includes('cereal_rye') ||
    normalizedId.includes('rye')
  ) {
    return {
      icon: <Wheat className={iconClassName} />,
      boxClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      themeName: 'cereal_wheat',
    };
  }

  // Corn / Maize
  if (normalizedId.includes('corn') || normalizedId.includes('maize') || normalizedId.includes('makki')) {
    return {
      icon: <CornIcon className={iconClassName} />,
      boxClass: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300',
      themeName: 'cereal_maize',
    };
  }

  // Millets / Sorghum
  if (normalizedId.includes('millet') || normalizedId.includes('sorghum') || normalizedId.includes('jowar') || normalizedId.includes('bajra')) {
    return {
      icon: <Wheat className={iconClassName} />,
      boxClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      themeName: 'millet',
    };
  }

  // Legumes & Pulses (Peas, Chickpeas, Moong, Cowpeas, Lentils, Beans, Soybeans)
  if (
    normalizedId.includes('pigeon_pea') ||
    normalizedId.includes('arhar') ||
    normalizedId.includes('chickpea') ||
    normalizedId.includes('chana') ||
    normalizedId.includes('moong') ||
    normalizedId.includes('mung') ||
    normalizedId.includes('cowpea') ||
    normalizedId.includes('lentil') ||
    normalizedId.includes('soybean')
  ) {
    return {
      icon: <PeaPodIcon className={iconClassName} />,
      boxClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
      themeName: 'pulse_legume',
    };
  }

  // Clovers & Vetches
  if (normalizedId.includes('clover') || normalizedId.includes('vetch')) {
    return {
      icon: <Clover className={iconClassName} />,
      boxClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
      themeName: 'clover_cover',
    };
  }

  // Mustard, Canola, Brassicas (Bio-fumigation)
  if (
    normalizedId.includes('mustard') ||
    normalizedId.includes('raya') ||
    normalizedId.includes('sarson') ||
    normalizedId.includes('canola') ||
    normalizedId.includes('brassica')
  ) {
    return {
      icon: <Flower2 className={iconClassName} />,
      boxClass: 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300',
      themeName: 'brassica_oilseed',
    };
  }

  // Sunflower
  if (normalizedId.includes('sunflower')) {
    return {
      icon: <Sun className={iconClassName} />,
      boxClass: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      themeName: 'sunflower',
    };
  }

  // Cotton / Fiber
  if (normalizedId.includes('cotton') || normalizedId.includes('kapas')) {
    return {
      icon: <CottonIcon className={iconClassName} />,
      boxClass: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
      themeName: 'fiber_cotton',
    };
  }

  // Cassava & Root Tubers
  if (normalizedId.includes('cassava') || normalizedId.includes('manioc') || normalizedId.includes('potato')) {
    return {
      icon: <Carrot className={iconClassName} />,
      boxClass: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300',
      themeName: 'root_tuber',
    };
  }

  // Pasture Grasses & Cover
  if (normalizedId.includes('grass') || normalizedId.includes('brachiaria')) {
    return {
      icon: <LeafyGreen className={iconClassName} />,
      boxClass: 'border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-800 dark:bg-lime-950/50 dark:text-lime-300',
      badgeClass: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-950 dark:text-lime-300',
      themeName: 'grass_mulch',
    };
  }

  // 2. BOTANICAL FAMILY FALLBACKS
  // --------------------------------------------------------------------------
  if (normalizedFamily.includes('fabaceae')) {
    return {
      icon: <PeaPodIcon className={iconClassName} />,
      boxClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
      themeName: 'family_fabaceae',
    };
  }

  if (normalizedFamily.includes('poaceae')) {
    return {
      icon: <Wheat className={iconClassName} />,
      boxClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      themeName: 'family_poaceae',
    };
  }

  if (normalizedFamily.includes('brassicaceae')) {
    return {
      icon: <Flower2 className={iconClassName} />,
      boxClass: 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300',
      themeName: 'family_brassicaceae',
    };
  }

  if (normalizedFamily.includes('malvaceae')) {
    return {
      icon: <CottonIcon className={iconClassName} />,
      boxClass: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
      themeName: 'family_malvaceae',
    };
  }

  if (normalizedFamily.includes('asteraceae')) {
    return {
      icon: <Sun className={iconClassName} />,
      boxClass: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      themeName: 'family_asteraceae',
    };
  }

  // 3. CATEGORY FALLBACKS
  // --------------------------------------------------------------------------
  if (normalizedCategory.includes('pulse') || normalizedCategory.includes('legume')) {
    return {
      icon: <Bean className={iconClassName} />,
      boxClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
      themeName: 'category_pulse',
    };
  }

  if (normalizedCategory.includes('cereal')) {
    return {
      icon: <Wheat className={iconClassName} />,
      boxClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300',
      themeName: 'category_cereal',
    };
  }

  if (normalizedCategory.includes('oilseed')) {
    return {
      icon: <Flower2 className={iconClassName} />,
      boxClass: 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300',
      themeName: 'category_oilseed',
    };
  }

  if (normalizedCategory.includes('fiber')) {
    return {
      icon: <CottonIcon className={iconClassName} />,
      boxClass: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300',
      themeName: 'category_fiber',
    };
  }

  // 4. GENERAL HIGH-RES DEFAULT
  // --------------------------------------------------------------------------
  return {
    icon: <Sprout className={iconClassName} />,
    boxClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
    themeName: 'default_sprout',
  };
}

export interface CropIconProps {
  cropId?: string;
  family?: BotanicalFamily | string;
  category?: string;
  className?: string;
}

export const CropIcon: React.FC<CropIconProps> = ({
  cropId,
  family,
  category,
  className = 'h-5 w-5',
}) => {
  const { icon } = getCropThemeConfig(cropId, family, category, className);
  return icon;
};

export default CropIcon;
