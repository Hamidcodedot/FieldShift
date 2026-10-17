import React, { useState } from 'react';
import { NasaClimateData, AgroRegion } from '../types';
import { CloudRain, Sun, Thermometer, Droplets, AlertTriangle, Layers } from 'lucide-react';

interface ClimateDashboardProps {
  climate: NasaClimateData;
  region: AgroRegion;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ClimateDashboard: React.FC<ClimateDashboardProps> = ({ climate, region }) => {
  const [activeTab, setActiveTab] = useState<'rainfall' | 'temperature' | 'soil_moisture'>('rainfall');

  const maxRain = Math.max(...climate.precipitationMonthlyMm, 50);
  const maxTemp = Math.max(...climate.temperatureMonthlyMaxC, 35);
  const minTemp = Math.min(...climate.temperatureMonthlyMinC, 0);

  return (
    <div className="rounded-xl border border-amber-900/15 bg-white p-4 shadow-none dark:border-stone-800 dark:bg-stone-900/60">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="font-montserrat text-sm font-bold tracking-wide text-stone-900 dark:text-stone-100">
            NASA Earth Observations Agroclimatology
          </h2>
        </div>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          Source: NASA POWER (MERRA-2 + GEOS-FP)
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {/* Annual Rainfall */}
        <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-950/60">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs">Annual Rainfall</span>
            <CloudRain className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {climate.annualPrecipitationMm}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">mm/yr</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            {climate.annualPrecipitationMm < 500
              ? 'Arid / Water-deficit zone'
              : climate.annualPrecipitationMm < 900
              ? 'Moderate monsoonal cycle'
              : 'High rainfall profile'}
          </div>
        </div>

        {/* Mean Temperature */}
        <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-950/60">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs">Mean Temperature</span>
            <Thermometer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {climate.meanAnnualTemperatureC}°
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">C</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            Peak: {Math.max(...climate.temperatureMonthlyMaxC)}°C | Low: {Math.min(...climate.temperatureMonthlyMinC)}°C
          </div>
        </div>

        {/* Root-Zone Moisture */}
        <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-950/60">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs">Root-Zone Wetness</span>
            <Droplets className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {(
                (climate.rootZoneSoilMoistureMonthly.reduce((a, b) => a + b, 0) / 12) *
                100
              ).toFixed(0)}
              %
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">saturation</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            NASA MERRA-2 (0-100 cm depth)
          </div>
        </div>

        {/* Drought Probability */}
        <div className="rounded-lg border border-stone-200 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-950/60">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-xs">Drought Risk</span>
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-tight text-rose-700 dark:text-rose-400">
              {climate.historicalDroughtProbabilityPercent}%
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">historical</span>
          </div>
          <div className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            Requires drought-shield rotations
          </div>
        </div>
      </div>

      {/* Monthly Chart Tabs */}
      <div className="mt-4 flex items-center justify-between border-b border-stone-200 pb-2 dark:border-stone-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('rainfall')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              activeTab === 'rainfall'
                ? 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Precipitation Cycle (mm)
          </button>
          <button
            onClick={() => setActiveTab('temperature')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              activeTab === 'temperature'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Thermal Curve (Tmin - Tmax)
          </button>
          <button
            onClick={() => setActiveTab('soil_moisture')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              activeTab === 'soil_moisture'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            NASA Soil Wetness (GWETROOT)
          </button>
        </div>
      </div>

      {/* SVG Responsive 12-Month Bar / Curve Chart */}
      <div className="mt-3">
        {activeTab === 'rainfall' && (
          <div>
            <div className="flex h-36 items-end gap-1.5 pt-4">
              {climate.precipitationMonthlyMm.map((val, idx) => {
                const heightPercent = Math.max(8, (val / maxRain) * 100);
                return (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 hidden rounded bg-zinc-950 px-1.5 py-0.5 text-[10px] text-zinc-200 group-hover:block border border-zinc-800 shadow">
                      {val} mm
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t bg-sky-500/70 transition-all group-hover:bg-sky-400"
                    />
                    <span className="mt-1 text-[10px] text-zinc-400 font-mono">
                      {MONTHS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-zinc-400">
              Monthly Precipitation (NASA PRECTOTCORR) indicates optimal monsoonal planting windows.
            </p>
          </div>
        )}

        {activeTab === 'temperature' && (
          <div>
            <div className="flex h-36 items-end gap-1.5 pt-4">
              {climate.temperatureMonthlyMaxC.map((max, idx) => {
                const min = climate.temperatureMonthlyMinC[idx];
                const normalizedHeight = Math.max(10, ((max - minTemp) / (maxTemp - minTemp)) * 100);
                return (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                    <div className="absolute -top-7 hidden rounded bg-zinc-950 px-1.5 py-0.5 text-[10px] text-zinc-200 group-hover:block border border-zinc-800 shadow">
                      {min}°C - {max}°C
                    </div>
                    <div
                      style={{ height: `${normalizedHeight}%` }}
                      className="w-full rounded-t bg-amber-500/60 transition-all group-hover:bg-amber-400"
                    />
                    <span className="mt-1 text-[10px] text-zinc-400 font-mono">
                      {MONTHS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-zinc-400">
              Thermal envelope determines crop flowering safety vs sterility risk (&gt;35°C).
            </p>
          </div>
        )}

        {activeTab === 'soil_moisture' && (
          <div>
            <div className="flex h-36 items-end gap-1.5 pt-4">
              {climate.rootZoneSoilMoistureMonthly.map((wetness, idx) => {
                const pct = Math.round(wetness * 100);
                return (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                    <div className="absolute -top-7 hidden rounded bg-zinc-950 px-1.5 py-0.5 text-[10px] text-zinc-200 group-hover:block border border-zinc-800 shadow">
                      {pct}% saturation
                    </div>
                    <div
                      style={{ height: `${Math.max(10, pct)}%` }}
                      className="w-full rounded-t bg-emerald-500/60 transition-all group-hover:bg-emerald-400"
                    />
                    <span className="mt-1 text-[10px] text-zinc-400 font-mono">
                      {MONTHS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-zinc-400">
              NASA MERRA-2 Root-Zone Wetness (GWETROOT) gauges subsoil water reserves for drought buffering.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
