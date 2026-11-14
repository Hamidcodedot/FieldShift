import React from 'react';
import { SoilProfile, FarmerPriorities } from '../types';
import { Sprout, Sliders, Droplet, Award, DollarSign, ShieldAlert } from 'lucide-react';

interface SoilAndPrioritiesProps {
  soil: SoilProfile;
  priorities: FarmerPriorities;
  onUpdateSoil: (updated: SoilProfile) => void;
  onUpdatePriorities: (updated: FarmerPriorities) => void;
}

export const SoilAndPriorities: React.FC<SoilAndPrioritiesProps> = ({
  soil,
  priorities,
  onUpdateSoil,
  onUpdatePriorities,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 1. Local Soil Baseline Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
              Local Soil Baseline (ISRIC SoilGrids)
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Field Parameters</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Soil Texture */}
          <div>
            <label className="text-xs font-medium text-zinc-300">Soil Texture</label>
            <select
              value={soil.texture}
              onChange={(e) =>
                onUpdateSoil({
                  ...soil,
                  texture: e.target.value as SoilProfile['texture'],
                })
              }
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="silt_loam">Silt Loam (High Fertility)</option>
              <option value="clay_loam">Clay Loam (Moderate Drainage)</option>
              <option value="clay">Heavy Clay (High Water Capacity)</option>
              <option value="loam">Loam (Balanced)</option>
              <option value="sandy_loam">Sandy Loam (Rapid Infiltration)</option>
              <option value="sand">Sand (Low Water Retention)</option>
            </select>
          </div>

          {/* Water Access Source */}
          <div>
            <label className="text-xs font-medium text-zinc-300">Irrigation / Water Source</label>
            <select
              value={priorities.waterAccessType}
              onChange={(e) =>
                onUpdatePriorities({
                  ...priorities,
                  waterAccessType: e.target.value as FarmerPriorities['waterAccessType'],
                })
              }
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="groundwater_borewell">Groundwater Tubewell / Borewell</option>
              <option value="canal_surface">Canal Surface Network (Nehri Pani)</option>
              <option value="hybrid_conjunctive">Hybrid Conjunctive (Canal + Tubewell)</option>
              <option value="rainfed">Strictly Rainfed (Barani)</option>
              <option value="drip_precision">Precision Drip / Micro-irrigation</option>
            </select>
          </div>

          {/* Organic Matter Slider */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-zinc-300">Soil Organic Matter (SOM)</span>
              <span className="font-mono font-semibold text-emerald-400">
                {soil.organicMatterPercent.toFixed(2)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="5.0"
              step="0.1"
              value={soil.organicMatterPercent}
              onChange={(e) =>
                onUpdateSoil({
                  ...soil,
                  organicMatterPercent: parseFloat(e.target.value),
                })
              }
              className="mt-2 w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>0.2% (Degraded)</span>
              <span>2.5% (Good)</span>
              <span>5.0% (Rich)</span>
            </div>
          </div>

          {/* Soil pH Slider */}
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-zinc-300">Soil Reaction (pH)</span>
              <span className="font-mono font-semibold text-amber-400">
                {soil.ph.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="4.5"
              max="9.0"
              step="0.1"
              value={soil.ph}
              onChange={(e) =>
                onUpdateSoil({
                  ...soil,
                  ph: parseFloat(e.target.value),
                })
              }
              className="mt-2 w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>4.5 (Acidic)</span>
              <span>7.0 (Neutral)</span>
              <span>9.0 (Alkaline)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Farmer Priorities Optimization Sliders */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
              Farmer Priorities & Trade-Offs
            </h2>
          </div>
          <span className="text-xs text-zinc-400">Optimization Weights</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {/* Soil Health Weight */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                <Award className="h-3.5 w-3.5 text-emerald-400" />
                Soil Regeneration
              </span>
              <span className="font-mono font-semibold text-zinc-200">
                {priorities.soilHealthWeight}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={priorities.soilHealthWeight}
              onChange={(e) =>
                onUpdatePriorities({
                  ...priorities,
                  soilHealthWeight: parseInt(e.target.value, 10),
                })
              }
              className="mt-2 w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Water Conservation Weight */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-sky-300">
                <Droplet className="h-3.5 w-3.5 text-sky-400" />
                Water Conservation
              </span>
              <span className="font-mono font-semibold text-zinc-200">
                {priorities.waterConservationWeight}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={priorities.waterConservationWeight}
              onChange={(e) =>
                onUpdatePriorities({
                  ...priorities,
                  waterConservationWeight: parseInt(e.target.value, 10),
                })
              }
              className="mt-2 w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Profit Weight */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-amber-300">
                <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                Economic Return
              </span>
              <span className="font-mono font-semibold text-zinc-200">
                {priorities.economicProfitWeight}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={priorities.economicProfitWeight}
              onChange={(e) =>
                onUpdatePriorities({
                  ...priorities,
                  economicProfitWeight: parseInt(e.target.value, 10),
                })
              }
              className="mt-2 w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Climate Shield Weight */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-rose-300">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                Climate Risk Shield
              </span>
              <span className="font-mono font-semibold text-zinc-200">
                {priorities.climateResilienceWeight}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={priorities.climateResilienceWeight}
              onChange={(e) =>
                onUpdatePriorities({
                  ...priorities,
                  climateResilienceWeight: parseInt(e.target.value, 10),
                })
              }
              className="mt-2 w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
