import { Language, SUPPORTED_LANGUAGES } from '../data/translations';

const STORAGE_KEY_USER_LANG = 'fieldshift_preferred_language';
const STORAGE_KEY_AUTO_MODE = 'fieldshift_auto_lang_mode';

/**
 * Automatically determine the farmer's native language based on geospatial coordinates
 */
export function detectLanguageFromCoordinates(lat: number, lon: number): Language {
  // 1. Pakistan (Punjab, Sindh, KPK, Balochistan)
  if (lat >= 23.5 && lat <= 37.0 && lon >= 60.5 && lon <= 75.2) {
    return 'ur'; // Urdu
  }

  // 2. India (Punjab, Haryana, Indo-Gangetic, South Asia)
  if (lat >= 8 && lat <= 37 && lon >= 75.3 && lon <= 97) {
    // Punjab, Northern region
    if (lat >= 29.5 && lat <= 32.5 && lon >= 74.0 && lon <= 77.0) {
      return 'pa'; // Punjabi
    }
    return 'hi'; // Hindi for rest of Northern/Central India
  }

  // 2. Brazil (Cerrado, Mato Grosso, Sao Paulo)
  if (lat >= -34 && lat <= 5 && lon >= -74 && lon <= -34) {
    // Brazil roughly
    if (lon >= -60 && lat <= 2 && lat >= -30) {
      return 'pt'; // Portuguese
    }
    return 'es'; // Spanish for Spanish-speaking South America
  }

  // 3. Spain / Mediterranean
  if (lat >= 35 && lat <= 44 && lon >= -10 && lon <= 4) {
    return 'es'; // Spanish
  }

  // 4. West Africa / Sahel (Burkina Faso, Mali, Niger, Senegal) or France
  if ((lat >= 10 && lat <= 25 && lon >= -18 && lon <= 15) || (lat >= 42 && lat <= 51 && lon >= -5 && lon <= 8)) {
    return 'fr'; // French
  }

  // 5. Default worldwide
  return 'en';
}

/**
 * Get initial language: checks localStorage first, otherwise defaults to English,
 * and enables auto-detection based on the initial farm coordinates.
 */
export function getInitialLanguage(initialLat: number, initialLon: number): {
  lang: Language;
  isAuto: boolean;
} {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_USER_LANG) as Language | null;
    const isAutoSaved = localStorage.getItem(STORAGE_KEY_AUTO_MODE);

    // If user explicitly chose a language and turned off auto
    if (saved && isAutoSaved === 'false') {
      const valid = SUPPORTED_LANGUAGES.some((l) => l.code === saved);
      if (valid) {
        return { lang: saved, isAuto: false };
      }
    }
  } catch (err) {
    console.warn('LocalStorage error reading language:', err);
  }

  // Auto-detect based on coordinates
  const detected = detectLanguageFromCoordinates(initialLat, initialLon);
  return { lang: detected, isAuto: true };
}

/**
 * Save manual user selection
 */
export function persistUserLanguage(lang: Language, isAuto: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY_USER_LANG, lang);
    localStorage.setItem(STORAGE_KEY_AUTO_MODE, isAuto ? 'true' : 'false');
  } catch (err) {
    console.warn('LocalStorage error saving language:', err);
  }
}
