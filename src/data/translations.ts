export type Language = 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-US' },
];

export interface TranslationDict {
  appName: string;
  tagline: string;
  tabHome: string;
  tabField: string;
  tabRotation: string;
  tabWeather: string;
  tabVoice: string;
  listenAudio: string;
  listenAgain: string;
  welcomeFarmer: string;
  voiceActionPrompt: string;
  tapToSpeak: string;
  listeningNow: string;
  voiceSubtitle: string;
  voiceTapPrompt: string;
  quickQuestionsTitle: string;
  ureaSaved: string;
  waterSaved: string;
  soilHealth: string;
  diseaseShield: string;
  diseaseShieldActive: string;
  bagsOfUrea: string;
  cubicMeters: string;
  myField: string;
  soilType: string;
  waterSource: string;
  soilClay: string;
  soilClayDesc: string;
  soilLoam: string;
  soilLoamDesc: string;
  soilSandy: string;
  soilSandyDesc: string;
  waterBorewell: string;
  waterCanal: string;
  waterRainfed: string;
  waterDrip: string;
  planSoilBuilder: string;
  planDroughtShield: string;
  planProfit: string;
  planBaseline: string;
  selectThisPlan: string;
  activePlan: string;
  viewFullDetails: string;
  printParcha: string;
  nasaLiveBadge: string;
  seasonsCount: string;
  cropPulse: string;
  cropGrain: string;
  cropOilseed: string;
  cropCover: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  en: {
    appName: 'FieldShift',
    tagline: 'NASA Earth Data Farmer Advisory',
    tabHome: 'Home',
    tabField: 'My Field',
    tabRotation: 'Crop Rotation',
    tabWeather: 'Weather',
    tabVoice: 'Voice Help',
    listenAudio: 'Listen to Advice',
    listenAgain: 'Listen Again',
    welcomeFarmer: 'Welcome, Farmer Friend',
    voiceActionPrompt: 'Tap mic & ask your farming question',
    tapToSpeak: 'Ask by Voice',
    listeningNow: 'Listening to your voice... Speak now',
    voiceSubtitle: 'Speak naturally to get instant NASA satellite advice for your crops.',
    voiceTapPrompt: 'Tap microphone and ask any question about your farm',
    quickQuestionsTitle: 'Or tap a question to listen to the answer:',
    ureaSaved: 'Urea Fertilizer Saved',
    waterSaved: 'Tubewell Water Saved',
    soilHealth: 'Soil Fertility Status',
    diseaseShield: 'Crop Disease Shield',
    diseaseShieldActive: 'Protected (Pest Cycle Broken)',
    bagsOfUrea: 'bags of Urea / hectare',
    cubicMeters: 'cubic meters water',
    myField: 'My Field & Soil',
    soilType: 'What kind of soil do you have?',
    waterSource: 'How do you irrigate your field?',
    soilClay: 'Heavy Clay Soil',
    soilClayDesc: 'Holds high water, heavy texture, needs good aeration.',
    soilLoam: 'Rich Loam Soil',
    soilLoamDesc: 'Most fertile soil, holds organic compost and balanced water.',
    soilSandy: 'Sandy / Light Soil',
    soilSandyDesc: 'Drains water fast, excellent for deep pulses and millets.',
    waterBorewell: 'Groundwater Tubewell / Borewell',
    waterCanal: 'Canal Water Network',
    waterRainfed: 'Strictly Rainfed (Dependent on Rain)',
    waterDrip: 'Drip / Sprinkler Irrigation',
    planSoilBuilder: 'Soil Restorer (Max Fertilizer Savings)',
    planDroughtShield: 'Drought Shield (Survives Low Water)',
    planProfit: 'Balanced Market (High Family Profit)',
    planBaseline: 'Traditional Practice (Monoculture)',
    selectThisPlan: 'Select This Plan',
    activePlan: 'Active Plan Selected',
    viewFullDetails: 'View Full Plan',
    printParcha: 'Print Field Plan',
    nasaLiveBadge: 'NASA Earth Data Active',
    seasonsCount: 'Seasons Plan',
    cropPulse: 'Pulse / Legume',
    cropGrain: 'Grain / Cereal',
    cropOilseed: 'Oilseed',
    cropCover: 'Green Manure Cover',
  },
};

export const CROP_LOCALIZED_NAMES: Record<string, Record<Language, string>> = {
  chickpea: { en: 'Chickpea (Desi Gram)' },
  green_gram_moong: { en: 'Summer Moong (Green Gram)' },
  pigeon_pea: { en: 'Pigeon Pea (Arhar / Red Gram)' },
  cowpea: { en: 'Cowpea (Lobia / Black-eyed Pea)' },
  lentil: { en: 'Lentil (Masoor)' },
  hairy_vetch: { en: 'Hairy Vetch (Bio-Cover)' },
  crimson_clover: { en: 'Crimson Clover (Nitrogen Cover)' },
  wheat: { en: 'Bread Wheat' },
  rice: { en: 'Paddy Rice' },
  corn: { en: 'Maize / Field Corn' },
  pearl_millet: { en: 'Pearl Millet (Bajra)' },
  sorghum: { en: 'Sorghum (Jowar)' },
  barley: { en: 'Feed / Malt Barley' },
  cereal_rye: { en: 'Cereal Rye Cover' },
  mustard: { en: 'Indian Mustard (Raya)' },
  canola: { en: 'Canola' },
  sunflower: { en: 'Sunflower' },
  cotton: { en: 'Cotton' },
  cassava: { en: 'Cassava' },
  brachiaria_grass: { en: 'Brachiaria Grass (Mulch)' },
};
