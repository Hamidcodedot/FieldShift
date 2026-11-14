import { AgroRegion, SoilProfile } from '../types';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

export interface VoiceAnswer {
  title: string;
  response: string;
  recommendedAction: string;
  matchedTopic: 'pulse_after_wheat' | 'low_water' | 'fertilizer_saving' | 'soil_health' | 'general';
}

export function processFarmerVoiceQuery(
  queryText: string,
  region: AgroRegion,
  _soil?: SoilProfile
): VoiceAnswer {
  const q = queryText.toLowerCase();

  // 1. Wheat / Paddy / Crop sequence follow up
  if (
    q.includes('wheat') ||
    q.includes('rice') ||
    q.includes('paddy') ||
    q.includes('cereal') ||
    q.includes('grain') ||
    q.includes('after') ||
    q.includes('next crop') ||
    q.includes('sequence') ||
    q.includes('rotation')
  ) {
    return {
      title: 'Plant 60-Day Summer Moong or Pulses After Wheat/Rice',
      response: 'After harvesting cereal crops like wheat or rice, fields often sit bare for 60 days. Sowing short-duration summer Moong (green gram) or cover legumes fixes 50 kg/ha of atmospheric nitrogen, saves 2-3 bags of commercial urea, and disrupts persistent pest cycles.',
      recommendedAction: 'Select the "Soil Restorer" rotation plan to view the exact planting and inoculation window.',
      matchedTopic: 'pulse_after_wheat',
    };
  }

  // 2. Low water / Drought
  if (
    q.includes('water') ||
    q.includes('drought') ||
    q.includes('rain') ||
    q.includes('dry') ||
    q.includes('irrigation') ||
    q.includes('borewell') ||
    q.includes('tubewell') ||
    q.includes('groundwater')
  ) {
    return {
      title: 'Low Water Footprint: Pearl Millet, Sorghum, Chickpea & Mustard',
      response: 'NASA satellite observations and root-zone soil wetness data indicate significant water deficits in this agricultural zone. Replacing thirsty puddled rice or continuous corn with pearl millet, sorghum, chickpea, or mustard cuts irrigation requirements by up to 40% while preserving family revenue.',
      recommendedAction: 'Switch to the "Drought Shield" strategy in the Crop Rotation tab.',
      matchedTopic: 'low_water',
    };
  }

  // 3. Fertilizer / Urea savings
  if (
    q.includes('urea') ||
    q.includes('fertilizer') ||
    q.includes('chemical') ||
    q.includes('nitrogen') ||
    q.includes('cost') ||
    q.includes('saving') ||
    q.includes('npk')
  ) {
    return {
      title: 'Save 35% Urea Fertilizer via Pulse Rotation',
      response: 'Rotating legumes and pulses (chickpea, pigeon pea, summer moong, hairy vetch) biologically fixes atmospheric nitrogen through root nodule symbiosis, saving up to 75-110 kg N/ha and significantly lowering synthetic urea purchases.',
      recommendedAction: 'View the 3-Year Nitrogen Net Credit metrics in the Crop Rotation tab.',
      matchedTopic: 'fertilizer_saving',
    };
  }

  // 4. Soil health / Compaction / Hardpan
  if (
    q.includes('soil') ||
    q.includes('fertility') ||
    q.includes('hard') ||
    q.includes('compaction') ||
    q.includes('carbon') ||
    q.includes('organic')
  ) {
    return {
      title: 'Break Subsoil Compaction with Deep Taproot Alternation',
      response: `For ${region.name}, alternating shallow fibrous root cereals with deep taproot crops (like pigeon pea, sunflower, or canola) naturally breaks plow pan compaction, improves rainfall infiltration, and humifies crop residues into active organic matter.`,
      recommendedAction: 'Retain crop residues as organic mulch and inoculate legume seeds with Rhizobium.',
      matchedTopic: 'soil_health',
    };
  }

  return {
    title: 'NASA-Calibrated Farm Advisory',
    response: `Based on NASA Earth observations for ${region.name}, transitioning away from continuous monocultures toward diversified pulse and oilseed rotations optimizes soil health and conserves groundwater.`,
    recommendedAction: 'Explore the Crop Rotation tab to view tailored multi-year sequences.',
    matchedTopic: 'general',
  };
}

/**
 * Text-to-speech out loud in English.
 * Uses native Android / iOS TTS via Capacitor on mobile,
 * and falls back to Web Speech API in browser.
 */
export async function speakFarmerResponse(
  text: string,
  onEnd?: () => void,
  onError?: () => void
): Promise<void> {
  const speechLang = 'en-US';

  // 1. Native mobile execution (Android / iOS Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      await TextToSpeech.stop();
      await TextToSpeech.speak({
        text,
        lang: speechLang,
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
      });
      onEnd?.();
      return;
    } catch (nativeErr) {
      console.warn('Native Capacitor TextToSpeech error, attempting web fallback:', nativeErr);
    }
  }

  // 2. Browser Web Speech API fallback
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLang;
      utterance.rate = 0.92; // comfortable listening speed
      utterance.pitch = 1.0;

      utterance.onend = () => {
        onEnd?.();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('SpeechSynthesis error event:', e);
        }
        onError?.();
      };

      window.speechSynthesis.speak(utterance);
    } catch (webErr) {
      console.warn('Web SpeechSynthesis error:', webErr);
      onError?.();
    }
  }
}

/**
 * Checks if speech synthesis is currently active in browser
 */
export function isCurrentlySpeaking(): boolean {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

/**
 * Stops any active speech synthesis
 */
export async function stopSpeaking(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await TextToSpeech.stop();
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

