import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  MapPin,
  Sprout,
  Droplets,
  AlertCircle,
} from 'lucide-react';
import { FarmerFieldProfile, AgroRegion, NasaClimateData, SoilProfile, RotationStrategy } from '../types';
import { getCropById } from '../data/crops';
import { generateFieldAiResponse, ChatMessage, ChatbotContext } from '../services/aiChatbotService';
import { speakFarmerResponse, stopSpeaking } from '../services/voiceAssistant';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';
import { NasaLogo } from './NasaLogo';

interface FieldAIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  activeField: FarmerFieldProfile;
  allFields: FarmerFieldProfile[];
  onSelectActiveField: (fieldId: string) => void;
  region: AgroRegion;
  climate: NasaClimateData;
  soil: SoilProfile;
  activeStrategy?: RotationStrategy;
}

function calculateDaysSinceSowing(dateStr?: string): number | null {
  if (!dateStr) return null;
  const sowing = new Date(dateStr);
  if (isNaN(sowing.getTime())) return null;
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)));
}

function createWelcomeMessage(
  activeField: FarmerFieldProfile,
  climate: NasaClimateData,
  soil: SoilProfile
): ChatMessage {
  const currentCropId = activeField.currentCropHistory?.currentCropId || 'wheat';
  let cropName = 'Wheat';
  try {
    const c = getCropById(currentCropId);
    cropName = c.name;
  } catch {
    // fallback
  }

  const daysSince = calculateDaysSinceSowing(activeField.sowingDate);
  const wetnessPercent = climate.currentMonthRootZoneWetnessPercent ?? 38;

  return {
    id: `msg-init-${activeField.id}`,
    sender: 'assistant',
    text: `**Welcome! I am your AI Field Assistant for "${activeField.farmName}".**\n\n` +
      `I am calibrated to your live coordinates (**${activeField.latitude.toFixed(4)}°N, ${activeField.longitude.toFixed(4)}°E**) and NASA Earth observations.\n\n` +
      `• **Standing Crop:** ${cropName} ${daysSince !== null ? `(Day ${daysSince})` : ''}\n` +
      `• **NASA Root-Zone Wetness:** ${wetnessPercent}% (${(wetnessPercent / 100).toFixed(2)} m³/m³)\n` +
      `• **Soil Texture:** ${(activeField.soilTexture || soil.texture || 'loam').toUpperCase()}\n\n` +
      `Ask me anything about **what to plant next**, **saving urea fertilizer**, **irrigation timing**, or **crop disease protection**!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    matchedTopic: 'general',
    fieldId: activeField.id,
    fieldName: activeField.farmName,
  };
}

export const FieldAIChatbot: React.FC<FieldAIChatbotProps> = ({
  isOpen,
  onClose,
  activeField,
  allFields,
  onSelectActiveField,
  region,
  climate,
  soil,
  activeStrategy,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createWelcomeMessage(activeField, climate, soil),
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webRecognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Standing crop metadata
  const currentCropId = activeField.currentCropHistory?.currentCropId || 'wheat';
  let standingCrop = null;
  try {
    standingCrop = getCropById(currentCropId);
  } catch {
    // fallback
  }

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Stop speech playback when closing chatbot
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      setPlayingMessageId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const context: ChatbotContext = {
    activeField,
    allFields,
    region,
    climate,
    soil,
    activeStrategy,
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setPermissionError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fieldId: activeField.id,
      fieldName: activeField.farmName,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await generateFieldAiResponse(text, context, messages);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error('Error generating AI response:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an error retrieving field guidance. Please check your network or try asking again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAudio = async (msg: ChatMessage) => {
    if (playingMessageId === msg.id) {
      await stopSpeaking();
      setPlayingMessageId(null);
    } else {
      await stopSpeaking();
      setPlayingMessageId(msg.id);
      // Strip markdown asterisks and bullets for clear natural speech
      const plainText = msg.text
        .replace(/\*\*/g, '')
        .replace(/•/g, '')
        .replace(/#/g, '')
        .replace(/\n\n/g, '. ')
        .replace(/\n/g, ' ');
      await speakFarmerResponse(
        plainText,
        () => setPlayingMessageId(null),
        () => setPlayingMessageId(null)
      );
    }
  };

  const handleStartListening = async () => {
    setPermissionError(null);

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

    // 1. Native mobile via Capacitor
    if (Capacitor.isNativePlatform()) {
      try {
        const permStatus = await SpeechRecognition.checkPermissions();
        if (permStatus.speechRecognition !== 'granted') {
          const req = await SpeechRecognition.requestPermissions();
          if (req.speechRecognition !== 'granted') {
            setPermissionError('Microphone permission required for voice queries.');
            return;
          }
        }

        setIsListening(true);
        const result = await SpeechRecognition.start({
          language: speechCode,
          maxResults: 1,
          prompt: `Ask about field "${activeField.farmName}"...`,
          popup: true,
          partialResults: false,
        });

        setIsListening(false);

        if (result && result.matches && result.matches.length > 0) {
          const spoken = result.matches[0];
          handleSendMessage(spoken);
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

    // 2. Web Speech API fallback in browser
    const WebSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!WebSR) {
      setPermissionError('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    try {
      const recognition = new WebSR();
      webRecognitionRef.current = recognition;
      recognition.lang = speechCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setIsListening(false);
        handleSendMessage(spoken);
      };

      recognition.onerror = (e: any) => {
        console.warn('Web speech error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Error starting web speech:', e);
      setIsListening(false);
    }
  };

  const quickQuestions = [
    `What should I plant after ${standingCrop?.name || 'my crop'}?`,
    'How much urea fertilizer will I save?',
    'Do I need to irrigate today based on NASA data?',
    'What pests does this crop face?',
    'Explain the recommended 6-season rotation',
    'How does my soil texture affect my fertilizer?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 backdrop-blur-xs sm:items-end sm:justify-end sm:p-6 transition-all duration-300">
      <div className="flex h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-stone-200/90 bg-white shadow-2xl transition-colors duration-200 dark:border-stone-800 dark:bg-[#0c0c0c] sm:h-[680px] sm:rounded-2xl overflow-hidden">
        
        {/* Chatbot Header */}
        <div className="border-b border-stone-200/80 bg-stone-50/80 px-4 py-3 dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-brand text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    Field AI Assistant
                  </h3>
                  <span className="flex items-center gap-1 rounded border border-emerald-300/80 bg-emerald-50 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <NasaLogo className="h-3 w-3" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    NASA Live
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-montserrat">
                  Grounded in satellite agroclimatology & soil physics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition"
                aria-label="Close chatbot"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Active Field Context Selector Bar */}
          <div className="mt-2.5 flex items-center justify-between rounded-lg border border-stone-200/80 bg-white px-2.5 py-1.5 dark:border-stone-800 dark:bg-stone-950/60 text-xs">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFieldDropdownOpen(!isFieldDropdownOpen)}
                className="flex items-center gap-1.5 font-montserrat font-bold text-stone-900 hover:text-stone-700 dark:text-stone-100 dark:hover:text-stone-300 transition"
              >
                <MapPin className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
                <span className="truncate max-w-[150px] sm:max-w-[190px]">{activeField.farmName}</span>
                <ChevronDown className="h-3 w-3 text-stone-400" />
              </button>

              {/* Field Selector Dropdown */}
              {isFieldDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-800 dark:bg-stone-900 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-wider font-montserrat">
                    Switch Focused Field
                  </div>
                  {allFields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onSelectActiveField(f.id);
                        setIsFieldDropdownOpen(false);
                        const crop = f.currentCropHistory?.currentCropId || 'crop';
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `switch-${Date.now()}`,
                            sender: 'assistant',
                            text: `Switched focus to **"${f.farmName}"** (${crop.toUpperCase()}, ${f.soilTexture || 'loam'} soil). What would you like to know about this parcel?`,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            fieldId: f.id,
                            fieldName: f.farmName,
                          },
                        ]);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs transition flex items-center justify-between ${
                        f.id === activeField.id
                          ? 'bg-stone-100 font-bold text-stone-900 dark:bg-stone-800 dark:text-stone-100'
                          : 'text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800/60'
                      }`}
                    >
                      <div className="truncate">
                        <div>{f.farmName}</div>
                        <div className="text-[10px] text-stone-400">
                          {f.placeName || 'Local Farm'} • {f.fieldSizeAcres || 5} acres
                        </div>
                      </div>
                      {f.id === activeField.id && (
                        <span className="h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-stone-100 shrink-0"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Field Attributes */}
            <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1 font-medium">
                <Sprout className="h-3 w-3 text-stone-600 dark:text-stone-300" />
                {standingCrop?.name || 'Crop'}
              </span>
              <span className="h-3 w-px bg-stone-200 dark:bg-stone-800"></span>
              <span className="flex items-center gap-1 font-medium">
                <Droplets className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                {climate.currentMonthRootZoneWetnessPercent ?? 38}% wet
              </span>
            </div>
          </div>
        </div>

        {/* Permission / Listening Banner */}
        {permissionError && (
          <div className="flex items-center gap-2 border-b border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{permissionError}</span>
            <button
              onClick={() => setPermissionError(null)}
              className="text-rose-500 hover:text-rose-800 text-[11px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {isListening && (
          <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse">
            <div className="flex items-center gap-2 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              Listening to your voice... Speak now
            </div>
            <button
              onClick={handleStartListening}
              className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900 dark:text-amber-200"
            >
              Stop
            </button>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isPlaying = playingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-br-xs font-montserrat'
                      : 'border border-stone-200/80 bg-stone-50/90 text-stone-900 dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-100 rounded-bl-xs'
                  }`}
                >
                  {/* AI Message Content with formatted markdown */}
                  {!isUser ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 pb-1 border-b border-stone-200/60 dark:border-stone-800">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 dark:text-stone-400 font-montserrat uppercase tracking-wider">
                          <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          Field Advisory
                        </div>
                        <button
                          onClick={() => handleToggleAudio(msg)}
                          className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition ${
                            isPlaying
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
                          }`}
                          title={isPlaying ? 'Stop audio' : 'Listen to answer'}
                        >
                          {isPlaying ? (
                            <>
                              <VolumeX className="h-3 w-3" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3 w-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Render text with markdown bullet parsing */}
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.text.split('\n').map((line, idx) => {
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return (
                              <h4 key={idx} className="font-montserrat font-bold text-stone-900 dark:text-stone-100 mt-2 mb-1">
                                {line.replace(/\*\*/g, '')}
                              </h4>
                            );
                          }
                          if (line.startsWith('• ')) {
                            const content = line.substring(2);
                            return (
                              <div key={idx} className="flex items-start gap-1.5 my-0.5">
                                <span className="text-stone-400 dark:text-stone-500">•</span>
                                <div>
                                  {content.split(/(\*\*.*?\*\*)/).map((seg, sIdx) =>
                                    seg.startsWith('**') && seg.endsWith('**') ? (
                                      <strong key={sIdx} className="font-bold text-stone-900 dark:text-stone-100">
                                        {seg.replace(/\*\*/g, '')}
                                      </strong>
                                    ) : (
                                      seg
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <p key={idx} className="my-1">
                              {line.split(/(\*\*.*?\*\*)/).map((seg, sIdx) =>
                                seg.startsWith('**') && seg.endsWith('**') ? (
                                  <strong key={sIdx} className="font-bold text-stone-900 dark:text-stone-100">
                                    {seg.replace(/\*\*/g, '')}
                                  </strong>
                                ) : (
                                  seg
                                )
                              )}
                            </p>
                          );
                        })}
                      </div>

                      {/* Recommended action footer if present */}
                      {msg.recommendedAction && (
                        <div className="mt-2 rounded-lg border border-amber-900/15 bg-stone-100/70 p-2 text-[11px] text-stone-800 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300">
                          <strong className="font-montserrat font-semibold text-stone-900 dark:text-stone-100">
                            Recommended Action:
                          </strong>{' '}
                          {msg.recommendedAction}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>

                <span className="mt-1 px-1 font-montserrat text-[10px] text-stone-400 dark:text-stone-500">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="rounded-2xl rounded-bl-xs border border-stone-200/80 bg-stone-50 px-4 py-3 text-xs dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[11px] font-montserrat font-medium">Analyzing field & NASA data...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="border-t border-stone-200/60 bg-stone-50/50 px-3 py-2 dark:border-stone-800 dark:bg-stone-900/30 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100 active:scale-95 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-stone-700 shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="border-t border-stone-200/80 bg-white p-3 dark:border-stone-800 dark:bg-[#0c0c0c]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button (Speech-to-Text) */}
            <button
              type="button"
              onClick={handleStartListening}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition active:scale-95 ${
                isListening
                  ? 'border-rose-400 bg-rose-50 text-rose-600 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your question'}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask about "${activeField.farmName}"...`}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50/70 px-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:bg-white focus:outline-hidden dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-stone-100"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="btn-asym flex h-10 items-center justify-center gap-1.5 bg-stone-900 px-4 text-xs font-bold text-white transition active:scale-95 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
