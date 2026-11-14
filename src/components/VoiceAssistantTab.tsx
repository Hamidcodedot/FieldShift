import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';
import { AgroRegion, SoilProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { processFarmerVoiceQuery, speakFarmerResponse, VoiceAnswer } from '../services/voiceAssistant';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';

interface VoiceAssistantTabProps {
  region: AgroRegion;
  soil: SoilProfile;
}

export const VoiceAssistantTab: React.FC<VoiceAssistantTabProps> = ({
  region,
  soil,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [answer, setAnswer] = useState<VoiceAnswer | null>(null);
  const [_recognitionSupported, setRecognitionSupported] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const webRecognitionRef = useRef<any>(null);

  const t = TRANSLATIONS.en;

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

    const speechCode = 'en-US';

    // 1. Native Android / iOS execution via Capacitor
    if (Capacitor.isNativePlatform()) {
      try {
        const permStatus = await SpeechRecognition.checkPermissions();
        if (permStatus.speechRecognition !== 'granted') {
          const req = await SpeechRecognition.requestPermissions();
          if (req.speechRecognition !== 'granted') {
            setPermissionError('Microphone permission is required for voice guidance. Please enable it in Settings.');
            return;
          }
        }

        setIsListening(true);
        setTranscript(t.listeningNow);

        const result = await SpeechRecognition.start({
          language: speechCode,
          maxResults: 1,
          prompt: 'Speak your farming question...',
          popup: true,
          partialResults: false,
        });

        setIsListening(false);

        if (result && result.matches && result.matches.length > 0) {
          const spoken = result.matches[0];
          setTranscript(spoken);
          const resolved = processFarmerVoiceQuery(spoken, region, soil);
          setAnswer(resolved);
          await speakFarmerResponse(resolved.response);
        }
      } catch (err: any) {
        console.error('Native speech recognition error:', err);
        setIsListening(false);
        if (err?.message && !err.message.includes('cancel')) {
          setPermissionError(err.message);
        }
      }
      return;
    }

    // 2. Browser fallback (Desktop & Mobile Web)
    const WebSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!WebSR) {
      alert('Speech recognition is not available in this browser. Please tap the quick questions below.');
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
        const resolved = processFarmerVoiceQuery(spoken, region, soil);
        setAnswer(resolved);
        setIsListening(false);
        speakFarmerResponse(resolved.response);
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
    const resolved = processFarmerVoiceQuery(questionText, region, soil);
    setAnswer(resolved);
    speakFarmerResponse(resolved.response);
  };

  const quickQuestions = [
    { num: '1', text: 'What pulse crop should I plant after wheat harvest?' },
    { num: '2', text: 'I have limited borewell water, which crops use the least water?' },
    { num: '3', text: 'How can crop rotation cut synthetic urea fertilizer expenses?' },
    { num: '4', text: 'How can I restore organic humus and break soil compaction?' },
  ];

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="card-chai p-5 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-100/70 px-3 py-1 font-montserrat text-[11px] font-medium text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
          <Sparkles className="h-3.5 w-3.5" />
          {t.tabVoice}
        </span>
        <h2 className="mt-2 font-montserrat text-lg font-semibold text-stone-900 sm:text-xl dark:text-stone-100">
          {t.tagline}
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-xs text-stone-600 leading-relaxed dark:text-stone-400">
          Ask questions in plain English to receive <span className="highlight">instant agronomic advisory</span> based on your field's NASA climate profile.
        </p>

        {/* Permission Alert if Denied on Android */}
        {permissionError && (
          <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Central Microphone Touch Button */}
        <div className="mt-6 flex flex-col items-center justify-center">
          <button
            onClick={handleStartListening}
            className={`relative flex h-20 w-20 items-center justify-center rounded-full border transition-all active:scale-95 ${
              isListening
                ? 'border-stone-900 bg-stone-900 text-white animate-pulse ring-4 ring-amber-900/10 dark:border-white dark:bg-white dark:text-stone-900 dark:ring-orange-100/10'
                : 'border-stone-300 bg-stone-100 text-stone-900 hover:bg-stone-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700'
            }`}
          >
            {isListening ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </button>

          <p className="mt-3 font-montserrat text-xs font-medium text-stone-700 dark:text-stone-300">
            {isListening ? (
              <span className="text-stone-900 font-semibold dark:text-stone-100">{t.listeningNow}</span>
            ) : (
              <span>{t.voiceTapPrompt}</span>
            )}
          </p>

          {transcript && (
            <div className="mt-3 max-w-md rounded-lg border border-stone-200/80 bg-stone-50/70 px-4 py-2 text-xs text-stone-800 font-medium italic dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-200">
              "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Answer Card with Voice Playback */}
      {answer && (
        <div className="card-chai p-5">
          <div className="flex items-center justify-between border-b border-stone-200/70 pb-3 dark:border-stone-800">
            <h3 className="font-montserrat text-sm font-semibold text-stone-900 dark:text-stone-100">
              {answer.title}
            </h3>
            <button
              onClick={() => speakFarmerResponse(answer.response)}
              className="btn-asym-mirror flex items-center gap-1.5 border border-stone-300 bg-transparent px-3 py-1.5 font-montserrat text-xs font-medium text-stone-800 hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Volume2 className="h-4 w-4 text-stone-700 dark:text-stone-300" />
              <span>{t.listenAgain}</span>
            </button>
          </div>

          <p className="mt-3 text-sm text-stone-700 leading-relaxed dark:text-stone-300">
            {answer.response}
          </p>

          <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300">
            <span className="highlight">
              Recommended action:
            </span>{' '}
            {answer.recommendedAction}
          </div>
        </div>
      )}

      {/* Quick Common Farmer Questions */}
      <div className="card-chai p-5">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-stone-800 dark:text-stone-300">
          <HelpCircle className="h-4 w-4 text-stone-700 dark:text-stone-300" />
          <span className="font-montserrat">{t.quickQuestionsTitle}</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {quickQuestions.map((q) => (
            <button
              key={q.num}
              onClick={() => handleQuickQuestion(q.text)}
              className="flex items-start text-start rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 text-xs text-stone-800 transition hover:border-stone-400 hover:bg-white active:scale-98 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-200 dark:hover:border-stone-600"
            >
              <span className="font-montserrat font-bold me-2 text-stone-600 dark:text-stone-400">{q.num}.</span>
              <span>{q.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
