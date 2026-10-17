import React from 'react';
import { RotationStrategy } from '../types';
import { Language, TRANSLATIONS } from '../data/translations';
import { CheckCircle2, TrendingUp, Droplets, Zap, Shield, AlertCircle } from 'lucide-react';

interface StrategyComparisonProps {
  strategies: {
    conventional: RotationStrategy;
    soilBuilder: RotationStrategy;
    climateShield: RotationStrategy;
    balancedProfit: RotationStrategy;
  };
  selectedStrategyId: string;
  onSelectStrategy: (strat: RotationStrategy) => void;
  lang: Language;
}

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const strategyList = [
    {
      key: 'soilBuilder',
      data: strategies.soilBuilder,
      title: t.planSoilBuilder,
      tag:
        lang === 'ur'
          ? 'زمین سدھار (نائٹروجن بحالی)'
          : lang === 'hi'
          ? 'मिट्टी सुधारक (खाद बचत)'
          : lang === 'pa'
          ? 'ਜ਼ਮੀਨ ਸੁਧਾਰਕ'
          : 'Recommended for Soil Restoration',
    },
    {
      key: 'climateShield',
      data: strategies.climateShield,
      title: t.planDroughtShield,
      tag:
        lang === 'ur'
          ? 'کم پانی اور خشک سالی کے لیے'
          : lang === 'hi'
          ? 'कम पानी / सूखा रक्षक'
          : lang === 'pa'
          ? 'ਸੋਕਾ ਰੱਖਿਅਕ'
          : 'Recommended for Water Deficit',
    },
    {
      key: 'balancedProfit',
      data: strategies.balancedProfit,
      title: t.planProfit,
      tag:
        lang === 'ur'
          ? 'منافع بخش اور غذائی تحفظ'
          : lang === 'hi'
          ? 'संतुलित मुनाफा व सुरक्षा'
          : lang === 'pa'
          ? 'ਮੁਨਾਫੇ ਵਾਲਾ ਚੱਕਰ'
          : 'Recommended for Cash Flow',
    },
    {
      key: 'conventional',
      data: strategies.conventional,
      title: t.planBaseline,
      tag:
        lang === 'ur'
          ? 'روایتی کاشتکاری (پرانا طریقہ)'
          : lang === 'hi'
          ? 'पारंपरिक पुरानी खेती'
          : lang === 'pa'
          ? 'ਰਵਾਇਤੀ ਪੁਰਾਣੀ ਖੇਤੀ'
          : 'Current Conventional Baseline',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-montserrat text-sm font-bold tracking-wide text-stone-900 dark:text-stone-100">
            {lang === 'ur'
              ? 'ناسا ڈیٹا کی بنیاد پر کثیر سالہ فصلی چکر'
              : lang === 'hi'
              ? 'नासा डेटा आधारित बहु-वर्षीय फसल चक्र'
              : 'Explored Multi-Year Rotation Strategies'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {lang === 'ur'
              ? 'ناسا سیٹلائٹ مشاہدات اور مقامی مٹی کی بنیاد پر تقابلی جائزہ'
              : lang === 'hi'
              ? 'नासा उपग्रह डेटा और मिट्टी के आधार पर तुलनात्मक विश्लेषण'
              : 'Comparative analysis evaluated against NASA Earth Observations & Local Soil Invariants'}
          </p>
        </div>
      </div>

      {/* Grid of Strategy Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {strategyList.map(({ key, data, title, tag }) => {
          const isSelected = selectedStrategyId === data.id;
          const isConventional = key === 'conventional';

          return (
            <div
              key={data.id}
              onClick={() => onSelectStrategy(data)}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 shadow-none ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/20'
                  : isConventional
                  ? 'border-stone-200 bg-stone-50/50 opacity-80 hover:opacity-100 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-950/40'
                  : 'border-amber-900/15 bg-white hover:border-amber-900/30 hover:bg-stone-50/50 dark:border-stone-800 dark:bg-stone-900/60'
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                    isConventional
                      ? 'border border-stone-200 bg-stone-100 text-stone-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      : isSelected
                      ? 'border border-emerald-600/30 bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : 'border border-stone-200 bg-stone-100 text-stone-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {tag}
                </span>

                {/* Score Pill */}
                <div
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                    data.overallScore >= 80
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40'
                      : data.overallScore >= 60
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40'
                      : 'bg-stone-100 text-stone-600 border border-stone-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                  }`}
                >
                  <span>{data.overallScore}</span>
                  <span className="text-[10px] text-stone-500 font-normal dark:text-zinc-400">/100</span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="mt-3 font-montserrat text-sm font-bold text-stone-900 dark:text-stone-100">
                {title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-stone-600 leading-relaxed dark:text-stone-400">
                {data.description}
              </p>

              {/* Core Agronomic Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-200 pt-3 text-xs dark:border-stone-800">
                {/* Nitrogen Balance */}
                <div>
                  <span className="text-[11px] text-stone-500 flex items-center gap-1 dark:text-stone-400">
                    <Zap className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
                    {lang === 'ur' ? 'نائٹروجن بچت' : lang === 'hi' ? 'नाइट्रोजन बचत' : '3-Yr Nitrogen'}
                  </span>
                  <p
                    className={`font-mono font-semibold ${
                      data.total3YearNitrogenNetKgPerHa >= 0
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {data.total3YearNitrogenNetKgPerHa > 0 ? '+' : ''}
                    {data.total3YearNitrogenNetKgPerHa} kg/ha
                  </p>
                </div>

                {/* Water Conserved */}
                <div>
                  <span className="text-[11px] text-stone-500 flex items-center gap-1 dark:text-stone-400">
                    <Droplets className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                    {t.waterSaved}
                  </span>
                  <p className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                    {data.total3YearWaterSavedM3PerHa > 0
                      ? `+${data.total3YearWaterSavedM3PerHa.toLocaleString()} m³`
                      : '0 m³'}
                  </p>
                </div>

                {/* Soil Health Index */}
                <div>
                  <span className="text-[11px] text-stone-500 flex items-center gap-1 dark:text-stone-400">
                    <TrendingUp className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    {t.soilHealth}
                  </span>
                  <p className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                    {data.soilHealthIndex} / 100
                  </p>
                </div>

                {/* Climate Risk */}
                <div>
                  <span className="text-[11px] text-stone-500 flex items-center gap-1 dark:text-stone-400">
                    <Shield className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                    {lang === 'ur' ? 'موسمی خطرہ' : lang === 'hi' ? 'मौसम जोखिम' : 'Climate Risk'}
                  </span>
                  <p
                    className={`font-mono font-semibold ${
                      data.climateRiskPenalty > 35 ? 'text-rose-600 dark:text-rose-400' : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    {data.climateRiskPenalty} / 100
                  </p>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-2 text-[11px] dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400">
                  {data.seasons.length} {t.seasonsCount}
                </span>
                <span
                  className={`font-medium ${
                    isSelected ? 'text-emerald-700 font-bold dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {isSelected ? t.activePlan : t.selectThisPlan}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
