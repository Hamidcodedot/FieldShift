import React from 'react';
import { AgroRegion, NasaClimateData, RotationStrategy } from '../types';
import { Language, TRANSLATIONS, CROP_LOCALIZED_NAMES } from '../data/translations';
import { ClimateDashboard } from './ClimateDashboard';
import { AppTab } from './BottomNavigation';
import { speakFarmerResponse } from '../services/voiceAssistant';
import { Mic, ArrowRight, Zap, Droplets, TrendingUp, ShieldCheck, CloudSun, Volume2 } from 'lucide-react';

interface FarmerHomeTabProps {
  region: AgroRegion;
  climate: NasaClimateData;
  activeStrategy: RotationStrategy;
  onNavigateTab: (tab: AppTab) => void;
  lang: Language;
}

export const FarmerHomeTab: React.FC<FarmerHomeTabProps> = ({
  region,
  climate,
  activeStrategy,
  onNavigateTab,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const ureaBagsSaved = Math.max(0, Math.round(activeStrategy.total3YearNitrogenNetKgPerHa / 23));

  // Speech summary generator for uneducated farmers
  const handlePlayVoiceSummary = () => {
    let summary = '';
    if (lang === 'ur') {
      summary = `السلام علیکم کسان بھائی۔ ناسا کے سیٹلائٹ ڈیٹا کے مطابق آپ کے علاقے کا اوسط درجہ حرارت ${climate.meanAnnualTemperatureC} ڈگری سینٹی گریڈ ہے۔ اس فصل کے چکر سے آپ کے کھیت میں ${ureaBagsSaved} بوری یوریا کھاد اور ${activeStrategy.total3YearWaterSavedM3PerHa} مکعب میٹر پانی کی بچت ہوگی۔`;
    } else if (lang === 'pa') {
      summary = `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ। ਨਾਸਾ ਡਾਟਾ ਅਨੁਸਾਰ ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਤਾਪਮਾਨ ${climate.meanAnnualTemperatureC} ਡਿਗਰੀ ਹੈ। ਸਾਡੀ ਸਲਾਹ ਅਨੁਸਾਰ ਫ਼ਸਲ ਚੱਕਰ ਬਦਲਣ ਨਾਲ ਪ੍ਰਤੀ ਹੈਕਟੇਅਰ ${ureaBagsSaved} ਬੋਰੀਆਂ ਯੂਰੀਆ ਖਾਦ ਅਤੇ ${activeStrategy.total3YearWaterSavedM3PerHa} ਘਣ ਮੀਟਰ ਪਾਣੀ ਬਚੇਗਾ।`;
    } else if (lang === 'hi') {
      summary = `नमस्ते किसान भाई। नासा उपग्रह के अनुसार आपके क्षेत्र का तापमान ${climate.meanAnnualTemperatureC} डिग्री है। इस फसल चक्र से आपके खेत में ${ureaBagsSaved} बोरी यूरिया खाद और ${activeStrategy.total3YearWaterSavedM3PerHa} घन मीटर पानी बचेगा।`;
    } else if (lang === 'es') {
      summary = `Bienvenido amigo agricultor. La temperatura media es de ${climate.meanAnnualTemperatureC} grados. Con este plan ahorrarás ${ureaBagsSaved} sacos de urea y ${activeStrategy.total3YearWaterSavedM3PerHa} metros cúbicos de agua.`;
    } else if (lang === 'pt') {
      summary = `Bem-vindo produtor. A temperatura média da sua região é de ${climate.meanAnnualTemperatureC} graus. Este plano economiza ${ureaBagsSaved} sacas de adubo e ${activeStrategy.total3YearWaterSavedM3PerHa} metros cúbicos de água.`;
    } else if (lang === 'fr') {
      summary = `Bienvenue cher agriculteur. La température moyenne est de ${climate.meanAnnualTemperatureC} degrés. Ce plan permet d'économiser ${ureaBagsSaved} sacs d'urée et ${activeStrategy.total3YearWaterSavedM3PerHa} mètres cubes d'eau.`;
    } else {
      summary = `Welcome farmer. The average temperature in your region is ${climate.meanAnnualTemperatureC} degrees Celsius. Adopting this rotation will save ${ureaBagsSaved} bags of urea and ${activeStrategy.total3YearWaterSavedM3PerHa} cubic meters of water.`;
    }

    speakFarmerResponse(summary, lang);
  };

  return (
    <div className="space-y-5">
      {/* 1. Farmer Welcome & Voice Action Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-linear-to-b from-emerald-950/40 via-zinc-900/80 to-zinc-900/90 p-5 shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                {region.country} • {region.name.split(' (')[0]}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <CloudSun className="h-3.5 w-3.5 text-amber-400" />
                {climate.meanAnnualTemperatureC}°C
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-zinc-100 sm:text-2xl">
                {t.welcomeFarmer}
              </h1>
              {/* Audio Listen Button */}
              <button
                onClick={handlePlayVoiceSummary}
                className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/60 active:scale-95"
                title={t.listenAudio}
              >
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t.listenAudio}</span>
              </button>
            </div>

            <p className="mt-1 max-w-lg text-xs text-zinc-300 leading-relaxed">
              {lang === 'ur'
                ? 'ناسا کے سیٹلائٹ مشاہدات کے مطابق فصلوں کے چکر سے کھاد کا خرچ اور ٹیوب ویل کا پانی دونوں بچائے جا سکتے ہیں۔'
                : lang === 'pa'
                ? 'ਨਾਸਾ ਸੈਟੇਲਾਈਟ ਅਨੁਸਾਰ ਖੇਤ ਵਿੱਚ ਫ਼ਸਲ ਚੱਕਰ ਬਦਲ ਕੇ ਖਾਦ ਅਤੇ ਟਿਊਬਵੈੱਲ ਦਾ ਪਾਣੀ ਦੋਵੇਂ ਬਚਾਏ ਜਾ ਸਕਦੇ ਹਨ।'
                : lang === 'hi'
                ? 'नासा उपग्रह डेटा के अनुसार आपके खेत में फसल चक्र बदलकर खाद और पानी दोनों बचाया जा सकता है।'
                : 'NASA Earth observations indicate rotating your crops will significantly restore soil nitrogen and cut irrigation expenses.'}
            </p>
          </div>

          {/* Large Voice Action Button */}
          <button
            onClick={() => onNavigateTab('voice')}
            className="flex items-center justify-center gap-2.5 rounded-2xl border border-emerald-400/50 bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl transition active:scale-95 hover:bg-emerald-500 shrink-0"
          >
            <Mic className="h-5 w-5 animate-pulse" />
            <span>{t.tapToSpeak}</span>
          </button>
        </div>

        {/* 4 Quick Value Badges */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 border-t border-zinc-800/80 pt-4">
          {/* Urea saved */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Zap className="h-4 w-4" />
              <span>{t.ureaSaved}</span>
            </div>
            <p className="mt-1 text-lg font-black text-zinc-100">
              +{ureaBagsSaved}
            </p>
            <span className="text-[10px] text-zinc-400">{t.bagsOfUrea}</span>
          </div>

          {/* Water saved */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
              <Droplets className="h-4 w-4" />
              <span>{t.waterSaved}</span>
            </div>
            <p className="mt-1 text-lg font-black text-zinc-100">
              +{activeStrategy.total3YearWaterSavedM3PerHa.toLocaleString()}
            </p>
            <span className="text-[10px] text-zinc-400">{t.cubicMeters}</span>
          </div>

          {/* Soil Health */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <TrendingUp className="h-4 w-4" />
              <span>{t.soilHealth}</span>
            </div>
            <p className="mt-1 text-lg font-black text-zinc-100">
              {activeStrategy.soilHealthIndex} / 100
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">
              {activeStrategy.soilHealthIndex > 75 ? 'Very Good (उत्तम)' : 'Moderate'}
            </span>
          </div>

          {/* Disease Shield */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>{t.diseaseShield}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-emerald-400">
              {t.diseaseShieldActive}
            </p>
            <span className="text-[10px] text-zinc-400">Breaks Take-all/SCN</span>
          </div>
        </div>
      </div>

      {/* 2. Active Crop Sequence Quick Card with Localized Vernacular Names */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">
              {activeStrategy.archetype === 'soil_builder'
                ? t.planSoilBuilder
                : activeStrategy.archetype === 'climate_shield'
                ? t.planDroughtShield
                : activeStrategy.archetype === 'balanced_profit'
                ? t.planProfit
                : activeStrategy.title}
            </h2>
            <p className="text-xs text-zinc-400">
              {activeStrategy.seasons.length} {t.seasonsCount}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('rotation')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <span>{t.viewFullDetails}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
          </button>
        </div>

        {/* Horizontal Mini Badges with Localized Names */}
        <div className="mt-3 flex flex-wrap gap-2">
          {activeStrategy.seasons.map((s, idx) => {
            const locName = CROP_LOCALIZED_NAMES[s.crop.id]?.[lang] || s.crop.name;
            const isPulse = s.crop.family === 'Fabaceae';

            return (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs"
              >
                <span className="text-zinc-400 font-mono text-[10px]">#{idx + 1}</span>
                <span className="font-bold text-zinc-100">{locName}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                    isPulse
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isPulse ? t.cropPulse : t.cropGrain}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. NASA Weather & Climate Panel */}
      <ClimateDashboard climate={climate} region={region} />
    </div>
  );
};
