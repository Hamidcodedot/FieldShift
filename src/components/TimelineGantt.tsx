import React from 'react';
import { RotationStrategy } from '../types';
import { Calendar, ShieldCheck, AlertTriangle, ArrowRight, Zap, Droplets, Sprout } from 'lucide-react';

interface TimelineGanttProps {
  strategy: RotationStrategy;
  onOpenCustomBuilder: () => void;
}

export const TimelineGantt: React.FC<TimelineGanttProps> = ({
  strategy,
  onOpenCustomBuilder,
}) => {
  return (
    <div className="rounded-xl border border-amber-900/15 bg-white p-4 shadow-none dark:border-stone-800 dark:bg-stone-900/60">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="font-montserrat text-sm font-bold tracking-wide text-stone-900 dark:text-stone-100">
            {strategy.title} — Seasonal Sequencing Timeline
          </h2>
        </div>
        <button
          onClick={onOpenCustomBuilder}
          className="btn-asym flex items-center gap-1.5 border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-200 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
        >
          <Sprout className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>Customize Rotation</span>
        </button>
      </div>

      {/* Sequential Horizontal Flow / Responsive Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {strategy.seasons.map((slot, idx) => {
          const isLegume = slot.crop.family === 'Fabaceae';
          const isCover = slot.isCoverCrop;

          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-lg border p-3 transition-all ${
                isLegume
                  ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-950/20'
                  : isCover
                  ? 'border-sky-300 bg-sky-50/70 dark:border-sky-500/30 dark:bg-sky-950/20'
                  : 'border-stone-200 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-950/50'
              }`}
            >
              {/* Top Season Label */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400">
                  <span>{slot.seasonName}</span>
                  <span className="font-mono text-stone-400">#{idx + 1}</span>
                </div>

                {/* Crop Name */}
                <h4 className="mt-2 font-montserrat text-sm font-bold text-stone-900 dark:text-stone-100">
                  {slot.crop.name}
                </h4>
                <p className="italic text-[10px] text-zinc-400">
                  {slot.crop.scientificName}
                </p>

                {/* Botanical Family Badge */}
                <div className="mt-2 flex flex-wrap gap-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      slot.crop.family === 'Fabaceae'
                        ? 'border border-emerald-500/30 bg-emerald-950/60 text-emerald-300'
                        : slot.crop.family === 'Poaceae'
                        ? 'border border-amber-500/30 bg-amber-950/60 text-amber-300'
                        : slot.crop.family === 'Brassicaceae'
                        ? 'border border-purple-500/30 bg-purple-950/60 text-purple-300'
                        : 'border border-zinc-700 bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {slot.crop.family}
                  </span>
                  <span className="rounded border border-zinc-700/60 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {slot.crop.rootArchitecture.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Agronomic Invariants & Indicators */}
              <div className="mt-3 border-t border-zinc-800/80 pt-2 text-[11px] space-y-1">
                {/* Nitrogen */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Zap className="h-3 w-3 text-emerald-400" />
                    Nitrogen:
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      slot.soilNitrogenBalanceKg >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {slot.soilNitrogenBalanceKg > 0 ? '+' : ''}
                    {slot.soilNitrogenBalanceKg} kg
                  </span>
                </div>

                {/* Water Balance */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Droplets className="h-3 w-3 text-sky-400" />
                    Water Deficit:
                  </span>
                  <span
                    className={`font-mono font-semibold ${
                      slot.waterBalanceMm >= 0 ? 'text-sky-300' : 'text-amber-400'
                    }`}
                  >
                    {slot.waterBalanceMm} mm
                  </span>
                </div>

                {/* Disease / Pathogen Cycle Break */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400">Disease Cycle:</span>
                  {slot.pestCycleBroken ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <ShieldCheck className="h-3 w-3" />
                      Interrupted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      Repeated
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agroecological Benefits Summary */}
      <div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Strategy Agronomic & Environmental Impacts
        </h3>
        <ul className="mt-2 space-y-1.5 text-xs text-zinc-300">
          {strategy.agroecologicalBenefits.map((benefit, bIdx) => (
            <li key={bIdx} className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
