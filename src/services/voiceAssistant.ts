import { Language, SUPPORTED_LANGUAGES } from '../data/translations';
import { AgroRegion, SoilProfile } from '../types';

export interface VoiceAnswer {
  title: string;
  response: string;
  recommendedAction: string;
  matchedTopic: 'pulse_after_wheat' | 'low_water' | 'fertilizer_saving' | 'soil_health' | 'general';
}

export function processFarmerVoiceQuery(
  queryText: string,
  region: AgroRegion,
  _soil: SoilProfile,
  lang: Language
): VoiceAnswer {
  const q = queryText.toLowerCase();

  // 1. Wheat / Paddy / Crop sequence follow up
  if (
    q.includes('wheat') ||
    q.includes('gehu') ||
    q.includes('गेहूं') ||
    q.includes('ਕਣਕ') ||
    q.includes('trigo') ||
    q.includes('blé') ||
    q.includes('rice') ||
    q.includes('dhan') ||
    q.includes('धान') ||
    q.includes('ਝੋਨਾ') ||
    q.includes('arroz') ||
    q.includes('riz') ||
    q.includes('after') ||
    q.includes('bad') ||
    q.includes('ਬਾਅਦ') ||
    q.includes('después') ||
    q.includes('après') ||
    q.includes('گندم') ||
    q.includes('چاول') ||
    q.includes('دھان') ||
    q.includes('بعد') ||
    q.includes('مونگ')
  ) {
    if (lang === 'ur') {
      return {
        title: 'گندم کی کٹائی کے بعد 60 روزہ مونگ لگائیں',
        response: 'گندم کی کٹائی کے بعد زمین 60 دن تک خالی رہتی ہے۔ اس دوران قلیل المدتی گرمائی مونگ (SML-668) لگائیں۔ یہ زمین میں قدرتی طور پر 50 کلو فی ہیکٹر نائٹروجن شامل کرے گی اور 2 سے 3 بوری یوریا کی بچت کرائے گی۔',
        recommendedAction: 'فصل کے چکر والے مینو میں "زمین کی بحالی" والا پلان منتخب کریں۔',
        matchedTopic: 'pulse_after_wheat',
      };
    }
    if (lang === 'pa') {
      return {
        title: 'ਕਣਕ ਦੀ ਕਟਾਈ ਤੋਂ ਬਾਅਦ 60 ਦਿਨਾਂ ਮੂੰਗੀ ਲਗਾਓ',
        response: 'ਕਣਕ ਵੱਢਣ ਤੋਂ ਬਾਅਦ ਖੇਤ 60 ਦਿਨ ਖਾਲੀ ਰਹਿੰਦਾ ਹੈ। ਇਸ ਸਮੇਂ 60 ਦਿਨਾਂ ਵਾਲੀ ਗਰਮ ਰੁੱਤ ਦੀ ਮੂੰਗੀ (SML-668) ਬੀਜੋ। ਇਹ ਜ਼ਮੀਨ ਵਿੱਚ 50 ਕਿਲੋ ਨਾਈਟ੍ਰੋਜਨ ਕੁਦਰਤੀ ਤੌਰ ਤੇ ਜੋੜੇਗੀ ਅਤੇ 2 ਤੋਂ 3 ਬੋਰੀਆਂ ਯੂਰੀਆ ਖਾਦ ਦਾ ਖਰਚਾ ਬਚਾਏਗੀ।',
        recommendedAction: 'ਫ਼ਸਲ ਚੱਕਰ ਵਿੱਚ "ਜ਼ਮੀਨ ਸੁਧਾਰਕ" ਪਲਾਨ ਚੁਣੋ।',
        matchedTopic: 'pulse_after_wheat',
      };
    }
    if (lang === 'hi') {
      return {
        title: 'गेहूं के बाद 60 दिन वाली मूंग लगाएं',
        response: 'गेहूं की कटाई के बाद 60 दिन का खाली समय मिलता है। इस समय 60 दिन वाली जायद मूंग (SML-668) लगाएं। यह खेत में 50 किलो प्रति हेक्टेयर नाइट्रोजन प्राकृतिक रूप से जोड़ेगी और 2 से 3 बोरी यूरिया का खर्चा बचाएगी।',
        recommendedAction: 'फसल चक्र में "मिट्टी सुधारक" प्लान चुनें जिसमें गेहूं के बाद मूंग और सरसों शामिल है।',
        matchedTopic: 'pulse_after_wheat',
      };
    }
    if (lang === 'es') {
      return {
        title: 'Sembrar Leguminosa (Garbanzo / Caupí) Después del Trigo',
        response: 'Después de cosechar el trigo, sembrar una leguminosa de ciclo corto fija 50 kg/ha de nitrógeno biológico, ahorrando 3 sacos de urea y rompiendo el ciclo de hongos de raíz.',
        recommendedAction: 'Selecciona la estrategia "Regenerador de Suelo" en la pestaña Rotación.',
        matchedTopic: 'pulse_after_wheat',
      };
    }
    if (lang === 'pt') {
      return {
        title: 'Plantar Leguminosa ou Braquiária após a Colheita',
        response: 'A rotação com leguminosas (como feijão guandu ou feijão-caupi) adiciona 50 a 80 kg/ha de nitrogênio ao solo, gerando economia expressiva de adubação química.',
        recommendedAction: 'Selecione a estratégia "Regenerador de Solo" no menu.',
        matchedTopic: 'pulse_after_wheat',
      };
    }
    if (lang === 'fr') {
      return {
        title: 'Semer une Légumineuse (Niébé / Pois Chiche) après les Céréales',
        response: 'La rotation après céréales avec une légumineuse fixe 50 kg/ha d’azote atmosphérique et réduit les achats d’engrais urée de 30% tout en brisant les cycles parasitaires.',
        recommendedAction: 'Activez la stratégie "Rénovateur de Sol" dans l’onglet Rotation.',
        matchedTopic: 'pulse_after_wheat',
      };
    }
    return {
      title: 'Plant 60-Day Summer Moong After Wheat',
      response: 'After harvesting wheat, planting short-duration summer Moong (green gram) fixes 50 kg/ha of biological nitrogen and saves 2-3 bags of commercial urea while breaking cereal pest cycles.',
      recommendedAction: 'Select the Soil Restorer rotation plan to view the exact planting window.',
      matchedTopic: 'pulse_after_wheat',
    };
  }

  // 2. Low water / Drought
  if (
    q.includes('water') ||
    q.includes('pani') ||
    q.includes('पानी') ||
    q.includes('ਪਾਣੀ') ||
    q.includes('agua') ||
    q.includes('eau') ||
    q.includes('drought') ||
    q.includes('sukha') ||
    q.includes('sequía') ||
    q.includes('seca') ||
    q.includes('sécheresse') ||
    q.includes('پانی') ||
    q.includes('سوکھا') ||
    q.includes('خشک') ||
    q.includes('قحط')
  ) {
    if (lang === 'ur') {
      return {
        title: 'کم پانی والی فصلیں: باجرہ، چنا اور سرسوں',
        response: 'ناسا کے سیٹلائٹ ڈیٹا کے مطابق اس خطے میں زیر زمین پانی تیزی سے کم ہو رہا ہے۔ دھان کی جگہ باجرہ یا مکئی اور گندم کی جگہ چنا یا سرسوں لگائیں۔ اس سے ٹیوب ویل کا 40 فیصد پانی اور بجلی/ڈیزل بچے گا۔',
        recommendedAction: 'فصل کے چکر والے مینو میں "خشک سالی سے بچاؤ" (Drought Shield) منتخب کریں۔',
        matchedTopic: 'low_water',
      };
    }
    if (lang === 'pa') {
      return {
        title: 'ਘੱਟ ਪਾਣੀ ਵਾਲੀਆਂ ਫ਼ਸਲਾਂ: ਬਾਜਰਾ, ਛੋਲੇ ਤੇ ਸਰ੍ਹੋਂ',
        response: 'ਨਾਸਾ ਡਾਟਾ ਅਨੁਸਾਰ ਧਰਤੀ ਹੇਠਲਾ ਪਾਣੀ ਬਹੁਤ ਡੂੰਘਾ ਜਾ ਰਿਹਾ ਹੈ। ਝੋਨੇ ਦੀ ਥਾਂ ਬਾਜਰਾ ਜਾਂ ਮੱਕੀ ਅਤੇ ਕਣਕ ਦੀ ਥਾਂ ਸਰ੍ਹੋਂ ਜਾਂ ਛੋਲੇ ਲਗਾਓ। ਇਸ ਨਾਲ 40% ਟਿਊਬਵੈੱਲ ਦਾ ਪਾਣੀ ਤੇ ਬਿਜਲੀ ਬਚੇਗੀ।',
        recommendedAction: 'ਫ਼ਸਲ ਚੱਕਰ ਵਿੱਚ "ਸੋਕਾ ਰੱਖਿਅਕ" ਪਲਾਨ ਚੁਣੋ।',
        matchedTopic: 'low_water',
      };
    }
    if (lang === 'hi') {
      return {
        title: 'कम पानी वाली फसलें: बाजरा, चना और सरसों',
        response: 'नासा उपग्रह डेटा के अनुसार आपके क्षेत्र में पानी की बचत बहुत जरूरी है। धान की जगह बाजरा या मक्का और गेहूं की जगह चना या सरसों लगाएं। इससे 40% ट्यूबवेल का पानी और बिजली का खर्च बचेगा।',
        recommendedAction: 'फसल चक्र में "सूखा रक्षक" (Drought Shield) प्लान चुनें।',
        matchedTopic: 'low_water',
      };
    }
    if (lang === 'es') {
      return {
        title: 'Cultivos Resistentes a la Sequía: Mijo, Sorgo y Garbanzo',
        response: 'Los datos de la NASA muestran estrés hídrico en la zona radicular. Cultivos como el sorgo, mijo perla y garbanzo consumen 40% menos agua de riego manteniendo rendimientos seguros.',
        recommendedAction: 'Activa la estrategia "Escudo contra Sequía" en la pestaña Rotación.',
        matchedTopic: 'low_water',
      };
    }
    if (lang === 'pt') {
      return {
        title: 'Cultivos de Baixa Exigência Hídrica: Sorgo e Braquiária',
        response: 'Satélites da NASA indicam estiagem prolongada. O sorgo e a braquiária possuem raízes profundas que acessam a umidade do subsolo, economizando recursos hídricos.',
        recommendedAction: 'Selecione o plano "Escudo contra a Seca".',
        matchedTopic: 'low_water',
      };
    }
    if (lang === 'fr') {
      return {
        title: 'Cultures Tolérantes à la Sécheresse: Sorgho, Mil et Niébé',
        response: 'Les observations satellitaires de la NASA révèlent un déficit hydrique. Le sorgho et le mil nécessitent moitié moins d’eau que les cultures irriguées classiques.',
        recommendedAction: 'Choisissez la stratégie "Bouclier Sécheresse".',
        matchedTopic: 'low_water',
      };
    }
    return {
      title: 'Low Water Footprint: Pearl Millet, Chickpea & Mustard',
      response: 'NASA observations show high groundwater draft in this region. Replacing puddled rice with pearl millet or sorghum, and wheat with chickpea or mustard cuts irrigation requirements by 40%.',
      recommendedAction: 'Switch to the "Drought Shield" strategy in the Crop Rotation tab.',
      matchedTopic: 'low_water',
    };
  }

  // 3. Fertilizer / Urea savings
  if (
    q.includes('khad') ||
    q.includes('खाद') ||
    q.includes('ਖਾਦ') ||
    q.includes('urea') ||
    q.includes('यूरिया') ||
    q.includes('ਯੂਰੀਆ') ||
    q.includes('fertilizer') ||
    q.includes('abono') ||
    q.includes('adubo') ||
    q.includes('engrais') ||
    q.includes('کھاد') ||
    q.includes('یوریا') ||
    q.includes('زرخیزی')
  ) {
    if (lang === 'ur') {
      return {
        title: 'دالوں کی کاشت سے 35 فیصد یوریا کھاد بچائیں',
        response: 'مسلسل گندم اور چاول لگانے سے مٹی کمزور ہو جاتی ہے۔ فصل کے چکر میں دالیں (چنا، مونگ، ماش) شامل کریں۔ دالوں کی جڑوں میں موجود جراثیم ہوا سے قدرتی نائٹروجن بنا کر زمین کو دیتے ہیں۔',
        recommendedAction: 'دالوں کے بیج کو رائزوبیم ٹیکہ لگا کر کاشت کریں۔',
        matchedTopic: 'fertilizer_saving',
      };
    }
    if (lang === 'pa') {
      return {
        title: 'ਦਾਲਾਂ ਬੀਜ ਕੇ 35% ਯੂਰੀਆ ਖਾਦ ਬਚਾਓ',
        response: 'ਲਗਾਤਾਰ ਅਨਾਜ ਬੀਜਣ ਨਾਲ ਜ਼ਮੀਨ ਕਮਜ਼ੋਰ ਹੋ ਗਈ ਹੈ। ਫ਼ਸਲ ਚੱਕਰ ਵਿੱਚ ਦਾਲਾਂ (ਛੋਲੇ, ਮੂੰਗੀ, ਅਰਹਰ) ਜ਼ਰੂਰ ਲਗਾਓ। ਦਾਲਾਂ ਦੀਆਂ ਜੜ੍ਹਾਂ ਹਵਾ ਵਿੱਚੋਂ ਮੁਫ਼ਤ ਨਾਈਟ੍ਰੋਜਨ ਬਣਾ ਕੇ ਜ਼ਮੀਨ ਵਿੱਚ ਜਮ੍ਹਾਂ ਕਰਦੀਆਂ ਹਨ।',
        recommendedAction: 'ਦਾਲਾਂ ਦੇ ਬੀਜ ਨੂੰ ਰਾਈਜ਼ੋਬੀਅਮ ਟੀਕੇ ਨਾਲ ਸੋਧ ਕੇ ਬੀਜੋ।',
        matchedTopic: 'fertilizer_saving',
      };
    }
    if (lang === 'hi') {
      return {
        title: 'दालों की फसल से 35% यूरिया खाद बचाएं',
        response: 'हर साल केवल अनाज (गेहूं-धान) बोने से मिट्टी की जान निकल जाती है। फसल चक्र में दालें (चना, अरहर, मूंग) शामिल करें। दालों की जड़ों में राइजोबियम बैक्टीरिया हवा से मुफ्त नाइट्रोजन बनाकर मिट्टी में जमा करते हैं।',
        recommendedAction: 'दालों के बीज को राइजोबियम कल्चर से उपचारित करके बोएं।',
        matchedTopic: 'fertilizer_saving',
      };
    }
    if (lang === 'es') {
      return {
        title: 'Ahorro del 35% en Fertilizante Nitrogenado con Leguminosas',
        response: 'La rotación con leguminosas como garbanzo o vicia incorpora bacterias fijadoras de nitrógeno en los nódulos radicales, reduciendo la compra de urea comercial.',
        recommendedAction: 'Consulta el índice de balance de nitrógeno en el plan.',
        matchedTopic: 'fertilizer_saving',
      };
    }
    return {
      title: 'Save 35% Urea Fertilizer via Pulse Rotation',
      response: 'Rotating pulses (chickpea, pigeon pea, moong) fixes atmospheric nitrogen biologically through root nodules, saving up to 75-110 kg N/ha and significantly lowering synthetic urea purchases.',
      recommendedAction: 'View the 3-Year Nitrogen Net Credit graph in the Rotation tab.',
      matchedTopic: 'fertilizer_saving',
    };
  }

  // 4. Soil health / Fertility
  if (lang === 'ur') {
    return {
      title: 'گہری جڑوں والی فصلیں لگائیں اور زمین کی زرخیزی بڑھائیں',
      response: `آپ کے خطے ${region.name} میں گہری جڑوں والی فصلیں (جیسے ارہر، سرسوں یا سورج مکھی) لگائیں جو سخت زمین کو نرم کرتی ہیں اور نامیاتی مادہ بڑھاتی ہیں۔`,
      recommendedAction: 'زمین میں نامیاتی مادہ بڑھانے کے لیے فصلوں کی باقیات جلانے سے گریز کریں۔',
      matchedTopic: 'soil_health',
    };
  }
  if (lang === 'pa') {
    return {
      title: 'ਡੂੰਘੀਆਂ ਜੜ੍ਹਾਂ ਵਾਲੀਆਂ ਫ਼ਸਲਾਂ ਲਗਾਓ ਅਤੇ ਜ਼ਮੀਨ ਸੁਧਾਰੋ',
      response: `ਤੁਹਾਡੇ ${region.name} ਦੇ ਖੇਤ ਵਿੱਚ ਅਰਹਰ, ਸਰ੍ਹੋਂ ਜਾਂ ਵੇਚ ਵਰਗੀਆਂ ਡੂੰਘੀਆਂ ਜੜ੍ਹਾਂ ਵਾਲੀਆਂ ਫ਼ਸਲਾਂ ਲਗਾਓ। ਇਹ ਸਖ਼ਤ ਜ਼ਮੀਨ ਨੂੰ ਪੋਲਾ ਕਰਦੀਆਂ ਹਨ ਅਤੇ ਦੇਸੀ ਖਾਦ ਵਾਂਗ ਜ਼ਮੀਨ ਦੀ ਤਾਕਤ ਵਧਾਉਂਦੀਆਂ ਹਨ।`,
      recommendedAction: 'ਜ਼ਮੀਨ ਵਿੱਚ ਜੈਵਿਕ ਕਾਰਬਨ ਵਧਾਉਣ ਲਈ ਪਰਾਲੀ ਨੂੰ ਅੱਗ ਨਾ ਲਗਾਓ।',
      matchedTopic: 'soil_health',
    };
  }
  if (lang === 'hi') {
    return {
      title: 'गहरी जड़ों वाली फसलें लगाएं और मल्चिंग करें',
      response: `आपके ${region.name} के खेत में गहरी जड़ वाली फसलें (जैसे अरहर, सरसों या वेच) लगाएं जो सख्त जमीन को तोड़कर नीचे से नमी खींचती हैं और देशी खाद जैसा कार्बन बढ़ाती हैं।`,
      recommendedAction: 'मिट्टी में जैविक कार्बन बढ़ाने के लिए फसल अवशेष न जलाएं और हरी खाद का उपयोग करें।',
      matchedTopic: 'soil_health',
    };
  }
  if (lang === 'es') {
    return {
      title: 'Restaurar la Estructura del Suelo con Raíces Profundas',
      response: `Para la región de ${region.name}, alternar cultivos con raíces pivotantes profundas rompe el piso de arado compacto y aumenta la materia orgánica humificada.`,
      recommendedAction: 'Aplica coberturas verdes para proteger el suelo contra la erosión.',
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
 * Text-to-speech out loud in any supported language
 */
export function speakFarmerResponse(text: string, lang: Language) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    utterance.lang = langObj ? langObj.speechCode : 'en-US';
    utterance.rate = 0.92; // comfortable listening speed
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
}
