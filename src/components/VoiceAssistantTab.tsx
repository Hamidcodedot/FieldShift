import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Sparkles, HelpCircle } from 'lucide-react';
import { AgroRegion, SoilProfile } from '../types';
import { Language, TRANSLATIONS, SUPPORTED_LANGUAGES } from '../data/translations';
import { processFarmerVoiceQuery, speakFarmerResponse, VoiceAnswer } from '../services/voiceAssistant';

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

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
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
      const recognition = new SpeechRecognition();
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
      recognition.lang = langConfig ? langConfig.speechCode : 'en-US';
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
      <div className="rounded-2xl border border-emerald-500/20 bg-linear-to-b from-emerald-950/30 to-zinc-900/60 p-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          {t.tabVoice}
        </span>
        <h2 className="mt-2 text-lg font-bold text-zinc-100 sm:text-xl">
          {t.tagline}
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-xs text-zinc-400">
          {t.voiceSubtitle}
        </p>

        {/* Large Central Microphone Touch Button */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <button
            onClick={handleStartListening}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all active:scale-95 shadow-xl ${
              isListening
                ? 'border-rose-500 bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/30'
                : 'border-emerald-500/50 bg-emerald-600 text-white hover:bg-emerald-500 hover:border-emerald-400 ring-4 ring-emerald-500/20'
            }`}
          >
            {isListening ? (
              <MicOff className="h-10 w-10 animate-bounce" />
            ) : (
              <Mic className="h-10 w-10" />
            )}
          </button>

          <p className="mt-3 text-xs font-medium text-zinc-300">
            {isListening ? (
              <span className="text-rose-400 font-semibold">{t.listeningNow}</span>
            ) : (
              <span>{t.voiceTapPrompt}</span>
            )}
          </p>

          {transcript && (
            <div className="mt-3 max-w-md rounded-lg border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-xs text-emerald-300 italic">
              "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Answer Card with Voice Playback */}
      {answer && (
        <div className="rounded-xl border border-emerald-500/40 bg-zinc-900/90 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-zinc-100">
              {answer.title}
            </h3>
            <button
              onClick={() => speakFarmerResponse(answer.response, lang)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-900/60"
            >
              <Volume2 className="h-4 w-4" />
              <span>{t.listenAgain}</span>
            </button>
          </div>

          <p className="mt-3 text-sm text-zinc-200 leading-relaxed">
            {answer.response}
          </p>

          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <strong>{lang === 'ur' ? 'تجویز:' : lang === 'hi' ? 'सलाह:' : lang === 'pa' ? 'ਸਲਾਹ:' : 'Next Step:'}</strong> {answer.recommendedAction}
          </div>
        </div>
      )}

      {/* Quick Common Farmer Questions */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-zinc-300">
          <HelpCircle className="h-4 w-4 text-emerald-400" />
          <span>{t.quickQuestionsTitle}</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {quickQuestions.map((q) => (
            <button
              key={q.num}
              onClick={() => handleQuickQuestion(q.text)}
              className="flex items-start text-start rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200 transition hover:border-emerald-500/50 hover:bg-zinc-900 active:scale-98"
            >
              <span className="text-emerald-400 font-bold me-2">{q.num}.</span>
              <span>{q.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
