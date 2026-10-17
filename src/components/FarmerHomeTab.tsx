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
      <div className="relative overflow-hidden rounded-2xl border border-amber-900/15 bg-white p-5 shadow-none dark:border-stone-800 dark:bg-stone-900/90">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 border border-emerald-600/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-300">
                {region.country} • {region.name.split(' (')[0]}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                <CloudSun className="h-3.5 w-3.5 text-amber-500" />
                {climate.meanAnnualTemperatureC}°C
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              <h1 className="font-montserrat text-xl font-bold tracking-tight text-stone-900 sm:text-2xl dark:text-stone-100">
                {t.welcomeFarmer}
              </h1>
              {/* Audio Listen Button */}
              <button
                onClick={handlePlayVoiceSummary}
                className="btn-asym-mirror flex items-center gap-1 border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-800 hover:bg-stone-200 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                title={t.listenAudio}
              >
                <Volume2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{t.listenAudio}</span>
              </button>
            </div>

            <p className="mt-2 max-w-lg text-xs text-stone-600 leading-relaxed dark:text-stone-300">
              {lang === 'ur' ? (
                <>
                  ناسا کے سیٹلائٹ مشاہدات کے مطابق <span className="highlight">فصلوں کے موزوں چکر</span> سے کھاد کا خرچ اور ٹیوب ویل کا پانی دونوں بچائے جا سکتے ہیں۔
                </>
              ) : lang === 'pa' ? (
                <>
                  ਨਾਸਾ ਸੈਟੇਲਾਈਟ ਅਨੁਸਾਰ ਖੇਤ ਵਿੱਚ <span className="highlight">ਵਿਗਿਆਨਕ ਫ਼ਸਲ ਚੱਕਰ</span> ਬਦਲ ਕੇ ਖਾਦ ਅਤੇ ਟਿਊਬਵੈੱਲ ਦਾ ਪਾਣੀ ਦੋਵੇਂ ਬਚਾਏ ਜਾ ਸਕਦੇ ਹਨ।
                </>
              ) : lang === 'hi' ? (
                <>
                  नासा उपग्रह डेटा के अनुसार आपके खेत में <span className="highlight">संतुलित फसल चक्र</span> अपनाकर खाद और पानी दोनों बचाया जा सकता है।
                </>
              ) : (
                <>
                  NASA Earth observations indicate <span className="highlight">adaptive crop rotations</span> significantly restore soil nitrogen and conserve irrigation reserves.
                </>
              )}
            </p>
          </div>

          {/* Large Voice Action Button (Asymmetric Solid Action) */}
          <button
            onClick={() => onNavigateTab('voice')}
            className="btn-asym flex items-center justify-center gap-2.5 bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-none transition active:scale-95 hover:bg-emerald-700 shrink-0"
          >
            <Mic className="h-5 w-5 animate-pulse" />
            <span>{t.tapToSpeak}</span>
          </button>
        </div>

        {/* 4 Quick Value Badges */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 border-t border-stone-200 pt-4 dark:border-stone-800">
          {/* Urea saved */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 shadow-none dark:border-stone-800 dark:bg-stone-950/60">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold dark:text-emerald-400">
              <Zap className="h-4 w-4" />
              <span>{t.ureaSaved}</span>
            </div>
            <p className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">
              +{ureaBagsSaved}
            </p>
            <span className="text-[10px] text-stone-500 dark:text-stone-400">{t.bagsOfUrea}</span>
          </div>

          {/* Water saved */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 shadow-none dark:border-stone-800 dark:bg-stone-950/60">
            <div className="flex items-center gap-1.5 text-xs text-sky-700 font-semibold dark:text-sky-400">
              <Droplets className="h-4 w-4" />
              <span>{t.waterSaved}</span>
            </div>
            <p className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">
              +{activeStrategy.total3YearWaterSavedM3PerHa.toLocaleString()}
            </p>
            <span className="text-[10px] text-stone-500 dark:text-stone-400">{t.cubicMeters}</span>
          </div>

          {/* Soil Health */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 shadow-none dark:border-stone-800 dark:bg-stone-950/60">
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
              <span>{t.soilHealth}</span>
            </div>
            <p className="mt-1 text-lg font-black text-stone-900 dark:text-stone-100">
              {activeStrategy.soilHealthIndex} / 100
            </p>
            <span className="text-[10px] text-emerald-700 font-medium dark:text-emerald-400">
              {activeStrategy.soilHealthIndex > 75 ? 'Optimal Health' : 'Moderate'}
            </span>
          </div>

          {/* Disease Shield */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 shadow-none dark:border-stone-800 dark:bg-stone-950/60">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>{t.diseaseShield}</span>
            </div>
            <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {t.diseaseShieldActive}
            </p>
            <span className="text-[10px] text-stone-500 dark:text-stone-400">Breaks monoculture pests</span>
          </div>
        </div>
      </div>

      {/* 2. Active Crop Sequence Quick Card with Localized Vernacular Names */}
      <div className="rounded-xl border border-amber-900/15 bg-white p-4 shadow-none dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-montserrat text-sm font-bold text-stone-900 dark:text-stone-100">
              {activeStrategy.archetype === 'soil_builder'
                ? t.planSoilBuilder
                : activeStrategy.archetype === 'climate_shield'
                ? t.planDroughtShield
                : activeStrategy.archetype === 'balanced_profit'
                ? t.planProfit
                : activeStrategy.title}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {activeStrategy.seasons.length} {t.seasonsCount}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('rotation')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
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
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-stone-800 dark:bg-stone-950"
              >
                <span className="text-stone-400 font-mono text-[10px]">#{idx + 1}</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{locName}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                    isPulse
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/30'
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
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
