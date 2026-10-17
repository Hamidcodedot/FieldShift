import React, { useState } from 'react';
import { Crop, AgroRegion, SoilProfile, FarmerPriorities, NasaClimateData, RotationStrategy } from '../types';
import { CROPS_DATABASE } from '../data/crops';
import { evaluateRotationPlan } from '../engine/rotationSolver';
import { Sparkles, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';

interface CustomRotationBuilderProps {
  region: AgroRegion;
  climate: NasaClimateData;
  soil: SoilProfile;
  priorities: FarmerPriorities;
  initialCrops: Crop[];
  onSaveCustomStrategy: (strategy: RotationStrategy) => void;
  onClose: () => void;
}

export const CustomRotationBuilder: React.FC<CustomRotationBuilderProps> = ({
  region,
  climate,
  soil,
  priorities,
  initialCrops,
  onSaveCustomStrategy,
  onClose,
}) => {
  const [selectedCrops, setSelectedCrops] = useState<Crop[]>(initialCrops.slice(0, 6));

  const updateSlotCrop = (index: number, cropId: string) => {
    const found = CROPS_DATABASE.find(c => c.id === cropId);
    if (!found) return;
    const next = [...selectedCrops];
    next[index] = found;
    setSelectedCrops(next);
  };

  // Evaluate the custom plan live
  const customStrategy = evaluateRotationPlan(
    selectedCrops,
    region,
    climate,
    soil,
    priorities,
    'custom',
    'Custom Farmer Sequence',
    'User-configured custom crop rotation sequence.'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-amber-900/15 bg-white p-6 shadow-xl overflow-y-auto dark:border-stone-800 dark:bg-stone-950">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-montserrat text-base font-bold text-stone-900 dark:text-stone-100">
              Interactive Crop Rotation Sandbox
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-xs text-stone-600 leading-relaxed dark:text-stone-400">
          Design your own 6-season rotation sequence. The algorithmic engine evaluates soil nitrogen replenishment, water budget against NASA observations, and botanical disease cycle breaks in real-time.
        </p>

        {/* 6-Slot Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {selectedCrops.map((crop, idx) => {
            const seasonInfo = region.seasons[idx % region.seasons.length];
            const yearNum = Math.floor(idx / region.seasons.length) + 1;
            const prevCrop = idx > 0 ? selectedCrops[idx - 1] : null;
            const isFamilyViolation = prevCrop && prevCrop.family === crop.family;

            return (
              <div
                key={idx}
                className={`rounded-xl border p-3 ${
                  isFamilyViolation
                    ? 'border-rose-300 bg-rose-50/70 dark:border-rose-500/50 dark:bg-rose-950/20'
                    : 'border-stone-200 bg-stone-50/60 dark:border-stone-800 dark:bg-stone-900/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span>Slot {idx + 1}: {seasonInfo.name} (Yr {yearNum})</span>
                  <span className="font-mono text-[10px] text-stone-400">{crop.family}</span>
                </div>

                {/* Dropdown selector */}
                <select
                  value={crop.id}
                  onChange={(e) => updateSlotCrop(idx, e.target.value)}
                  className="mt-2 w-full rounded-md border border-stone-200 bg-white px-2 py-1.5 text-xs font-medium text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                >
                  {CROPS_DATABASE.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.family} - {c.waterRequirementMm}mm)
                    </option>
                  ))}
                </select>

                {/* Warnings or Validations */}
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  {isFamilyViolation ? (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-3 w-3" />
                      Repeated Family
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Disease Cycle Broken
                    </span>
                  )}
                  <span className="font-mono text-stone-500 dark:text-stone-400">
                    {crop.nitrogenFixationKgPerHa > 0
                      ? `+${crop.nitrogenFixationKgPerHa} kg N`
                      : `-${Math.round(crop.nitrogenUptakeKgPerHa * 0.4)} kg N`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Live Simulation Output
              </span>
              <div className="mt-1 flex flex-wrap items-baseline gap-4 text-xs text-stone-700 dark:text-stone-300">
                <span>Overall Score: <strong className="text-emerald-700 text-sm dark:text-emerald-400">{customStrategy.overallScore}/100</strong></span>
                <span>Soil Health: <strong className="text-stone-900 dark:text-stone-100">{customStrategy.soilHealthIndex}/100</strong></span>
                <span>Water Resilience: <strong className="text-sky-700 dark:text-sky-400">{customStrategy.waterResilienceIndex}/100</strong></span>
                <span>3-Yr Nitrogen: <strong className={customStrategy.total3YearNitrogenNetKgPerHa >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{customStrategy.total3YearNitrogenNetKgPerHa > 0 ? '+' : ''}{customStrategy.total3YearNitrogenNetKgPerHa} kg/ha</strong></span>
                <span>Water Saved: <strong className="text-sky-700 dark:text-sky-300">+{customStrategy.total3YearWaterSavedM3PerHa.toLocaleString()} m³</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSaveCustomStrategy(customStrategy);
                  onClose();
                }}
                className="btn-asym bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 shadow-none"
              >
                Apply As Active Strategy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
