import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { AgroRegion, SoilProfile } from '../types';
import { Language, TRANSLATIONS, SUPPORTED_LANGUAGES } from '../data/translations';
import { processFarmerVoiceQuery, speakFarmerResponse, VoiceAnswer } from '../services/voiceAssistant';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';

interface VoiceAssistantTabProps {
  region: AgroRegion;
  soil: SoilProfile;
  lang: Language;
}

export const VoiceAssistantTab: React.FC<VoiceAssistantTabProps> = ({
  region,
  soil,
  lang,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [answer, setAnswer] = useState<VoiceAnswer | null>(null);
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const webRecognitionRef = useRef<any>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    async function checkAvailability() {
      if (Capacitor.isNativePlatform()) {
        try {
          const avail = await SpeechRecognition.available();
          setRecognitionSupported(avail.available);
        } catch {
          // If check fails, keep supported so user can attempt and prompt permissions
          setRecognitionSupported(true);
        }
      } else {
        const WebSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        setRecognitionSupported(!!WebSR);
      }
    }
    checkAvailability();
  }, []);

  const handleStartListening = async () => {
    setPermissionError(null);

    // If currently listening, stop it immediately on user tap
    if (isListening) {
      if (Capacitor.isNativePlatform()) {
        try {
          await SpeechRecognition.stop();
        } catch (e) {
          console.warn('Error stopping speech:', e);
        }
      } else if (webRecognitionRef.current) {
        try {
          webRecognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping web speech:', e);
        }
      }
      setIsListening(false);
      return;
    }

    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    const speechCode = langConfig ? langConfig.speechCode : 'en-US';

    // 1. Native Android / iOS execution via Capacitor
    if (Capacitor.isNativePlatform()) {
      try {
        const permStatus = await SpeechRecognition.checkPermissions();
        if (permStatus.speechRecognition !== 'granted') {
          const req = await SpeechRecognition.requestPermissions();
          if (req.speechRecognition !== 'granted') {
            const msg =
              lang === 'ur'
                ? 'مائیکروفون کی اجازت درکار ہے۔ براہ کرم اپنے فون کی سیٹنگز میں اجازت دیں۔'
                : lang === 'hi'
                ? 'माइक्रोफ़ोन की अनुमति आवश्यक है। कृपया फ़ोन सेटिंग्स में अनुमति दें।'
                : lang === 'pa'
                ? 'ਮਾਈਕ੍ਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਲੋੜੀਂਦੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਇਜਾਜ਼ਤ ਦਿਓ।'
                : 'Microphone permission is required for voice guidance. Please enable it in Settings.';
            setPermissionError(msg);
            return;
          }
        }

        setIsListening(true);
        setTranscript(t.listeningNow);

        const promptText =
          lang === 'ur'
            ? 'اپنا زرعی سوال بولیں...'
            : lang === 'hi'
            ? 'अपना खेती का सवाल बोलें...'
            : lang === 'pa'
            ? 'ਆਪਣਾ ਖੇਤੀ ਦਾ ਸਵਾਲ ਬੋਲੋ...'
            : 'Speak your farming question...';

        const result = await SpeechRecognition.start({
          language: speechCode,
          maxResults: 1,
          prompt: promptText,
          popup: true,
          partialResults: false,
        });

        setIsListening(false);

        if (result && result.matches && result.matches.length > 0) {
          const spoken = result.matches[0];
          setTranscript(spoken);
          const resolved = processFarmerVoiceQuery(spoken, region, soil, lang);
          setAnswer(resolved);
          await speakFarmerResponse(resolved.response, lang);
        }
      } catch (err: any) {
        console.error('Native speech recognition error:', err);
        setIsListening(false);
        // Don't alert if user simply cancelled the Android speech dialog
        if (err?.message && !err.message.includes('cancel')) {
          setPermissionError(err.message);
        }
      }
      return;
    }

    // 2. Browser fallback (Desktop & Mobile Web)
    const WebSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!WebSR) {
      alert(
        lang === 'ur'
          ? 'آپ کے براؤزر میں مائیکروفون دستیاب نہیں ہے۔ براہ کرم نیچے دیے گئے سوالات پر ٹیپ کریں۔'
          : lang === 'hi'
          ? 'आपके ब्राउज़र में वॉइस माइक उपलब्ध नहीं है। कृपया नीचे दिए गए प्रश्नों पर टैप करें।'
          : lang === 'pa'
          ? 'ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਮਾਈਕ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਹੇਠਾਂ ਦਿੱਤੇ ਸਵਾਲਾਂ ਤੇ ਟੈਪ ਕਰੋ।'
          : 'Speech recognition is not available in this browser. Please tap the quick questions below.'
      );
      return;
    }

    try {
      const recognition = new WebSR();
      webRecognitionRef.current = recognition;
      recognition.lang = speechCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setTranscript(t.listeningNow);

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        const resolved = processFarmerVoiceQuery(spoken, region, soil, lang);
        setAnswer(resolved);
        setIsListening(false);
        speakFarmerResponse(resolved.response, lang);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleQuickQuestion = (questionText: string) => {
    setTranscript(questionText);
    const resolved = processFarmerVoiceQuery(questionText, region, soil, lang);
    setAnswer(resolved);
    speakFarmerResponse(resolved.response, lang);
  };

  // Localized quick questions
  const getQuickQuestions = () => {
    if (lang === 'ur') {
      return [
        { num: '1', text: 'گندم کی کٹائی کے بعد کون سی دال کاشت کرنی چاہیے؟' },
        { num: '2', text: 'ٹیوب ویل میں پانی کم ہے، کم پانی والی کون سی فصل بہتر ہے؟' },
        { num: '3', text: 'فصل کے چکر سے یوریا کھاد کا خرچ کیسے کم کریں؟' },
        { num: '4', text: 'زمین کمزور ہو چکی ہے، نامیاتی مادہ اور زرخیزی کیسے بڑھائیں؟' },
      ];
    }
    if (lang === 'pa') {
      return [
        { num: '1', text: 'ਕਣਕ ਦੀ ਕਟਾਈ ਤੋਂ ਬਾਅਦ ਕਿਹੜੀ ਦਾਲ ਲਗਾਈਏ?' },
        { num: '2', text: 'ਟਿਊਬਵੈੱਲ ਦਾ ਪਾਣੀ ਘੱਟ ਹੈ, ਕਿਹੜੀ ਫ਼ਸਲ ਲਗਾਈਏ?' },
        { num: '3', text: 'ਯੂਰੀਆ ਖਾਦ ਦਾ ਖਰਚਾ ਕਿਵੇਂ ਘਟਾਈਏ?' },
        { num: '4', text: 'ਖੇਤ ਦੀ ਜ਼ਮੀਨ ਕਮਜ਼ੋਰ ਹੋ ਗਈ ਹੈ, ਉਪਜਾਊ ਕਿਵੇਂ ਕਰੀਏ?' },
      ];
    }
    if (lang === 'hi') {
      return [
        { num: '1', text: 'गेहूं की कटाई के बाद कौन सी दाल लगानी चाहिए?' },
        { num: '2', text: 'ट्यूबवेल में पानी कम है, कम पानी वाली कौन सी फसल सही है?' },
        { num: '3', text: 'यूरिया और डीएपी खाद का खर्चा कैसे कम करें?' },
        { num: '4', text: 'खेत की मिट्टी कमजोर हो गई है, उपजाऊ शक्ति कैसे बढ़ाएं?' },
      ];
    }
    if (lang === 'es') {
      return [
        { num: '1', text: '¿Qué cultivo o leguminosa sembrar después del trigo?' },
        { num: '2', text: 'Tengo poca agua subterránea, ¿qué cultivos consumen menos?' },
        { num: '3', text: '¿Cómo reducir el gasto en fertilizante nitrogenado?' },
        { num: '4', text: '¿Cómo mejorar la materia orgánica y fertilidad del suelo?' },
      ];
    }
    if (lang === 'pt') {
      return [
        { num: '1', text: 'Qual leguminosa plantar após a colheita de grãos?' },
        { num: '2', text: 'Com pouca água de irrigação, quais culturas são mais resistentes?' },
        { num: '3', text: 'Como economizar na adubação nitrogenada com rotação?' },
        { num: '4', text: 'Como recuperar a fertilidade e a palhada do solo?' },
      ];
    }
    if (lang === 'fr') {
      return [
        { num: '1', text: 'Quelle légumineuse semer après la récolte de céréales ?' },
        { num: '2', text: 'Avec peu d’eau d’irrigation, quelles cultures choisir ?' },
        { num: '3', text: 'Comment réduire les dépenses d’engrais azoté ?' },
        { num: '4', text: 'Comment restaurer la fertilité biologique du sol ?' },
      ];
    }
    return [
      { num: '1', text: 'What pulse crop should I plant after wheat harvest?' },
      { num: '2', text: 'I have limited borewell water, which crops use the least water?' },
      { num: '3', text: 'How can crop rotation cut synthetic urea fertilizer expenses?' },
      { num: '4', text: 'How can I restore organic humus and break soil compaction?' },
    ];
  };

  const quickQuestions = getQuickQuestions();

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="rounded-2xl border border-amber-900/15 bg-white p-5 text-center shadow-none dark:border-stone-800 dark:bg-stone-900/90">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          {t.tabVoice}
        </span>
        <h2 className="mt-2 text-lg font-bold text-stone-900 sm:text-xl dark:text-stone-100">
          {t.tagline}
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-xs text-stone-600 leading-relaxed dark:text-stone-400">
          {t.voiceSubtitle}
        </p>

        {/* Permission Alert if Denied on Android */}
        {permissionError && (
          <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Large Central Microphone Touch Button */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <button
            onClick={handleStartListening}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all active:scale-95 shadow-sm ${
              isListening
                ? 'border-rose-500 bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/30'
                : 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 ring-4 ring-emerald-600/20'
            }`}
          >
            {isListening ? (
              <MicOff className="h-10 w-10 animate-bounce" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </button>

          <p className="mt-3 text-xs font-medium text-stone-700 dark:text-stone-300">
            {isListening ? (
              <span className="text-rose-600 font-semibold dark:text-rose-400">{t.listeningNow}</span>
            ) : (
              <span>{t.voiceTapPrompt}</span>
            )}
          </p>

          {transcript && (
            <div className="mt-3 max-w-md rounded-lg border border-stone-200 bg-stone-50 px-4 py-2 text-xs text-emerald-800 font-medium italic dark:border-stone-800 dark:bg-stone-950 dark:text-emerald-300">
              "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Answer Card with Voice Playback */}
      {answer && (
        <div className="rounded-xl border border-amber-900/15 bg-white p-5 shadow-none dark:border-emerald-500/40 dark:bg-stone-900/90">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-stone-800">
            <h3 className="font-montserrat text-base font-bold text-stone-900 dark:text-stone-100">
              {answer.title}
            </h3>
            <button
              onClick={() => speakFarmerResponse(answer.response, lang)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 active:scale-95 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              <Volume2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.listenAgain}</span>
            </button>
          </div>

          <p className="mt-3 text-sm text-stone-700 leading-relaxed dark:text-stone-200">
            {answer.response}
          </p>

          <div className="mt-4 rounded-lg border border-amber-900/15 bg-amber-50/50 p-3 text-xs text-amber-900 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300">
            <strong className="font-montserrat font-medium text-yellow-800 dark:text-orange-100">
              {lang === 'ur' ? 'تجویز:' : lang === 'hi' ? 'सलाह:' : lang === 'pa' ? 'ਸਲਾਹ:' : 'Next Step:'}
            </strong>{' '}
            {answer.recommendedAction}
          </div>
        </div>
      )}

      {/* Quick Common Farmer Questions */}
      <div className="rounded-xl border border-amber-900/15 bg-white p-5 shadow-none dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-stone-800 dark:text-stone-300">
          <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.quickQuestionsTitle}</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {quickQuestions.map((q) => (
            <button
              key={q.num}
              onClick={() => handleQuickQuestion(q.text)}
              className="flex items-start text-start rounded-lg border border-stone-200 bg-stone-50/60 p-3 text-xs text-stone-800 transition hover:border-emerald-600/40 hover:bg-white active:scale-98 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-emerald-500/50"
            >
              <span className="text-emerald-700 font-bold me-2 dark:text-emerald-400">{q.num}.</span>
              <span>{q.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
