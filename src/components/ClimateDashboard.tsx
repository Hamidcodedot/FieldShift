import React, { useState } from 'react';
import { NasaClimateData, AgroRegion } from '../types';
import { CloudRain, Thermometer, Droplets, AlertTriangle, Layers } from 'lucide-react';

interface ClimateDashboardProps {
  climate: NasaClimateData;
  region: AgroRegion;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ClimateDashboard: React.FC<ClimateDashboardProps> = ({ climate }) => {
  const [activeTab, setActiveTab] = useState<'rainfall' | 'temperature' | 'soil_moisture'>('rainfall');

  const maxRain = Math.max(...climate.precipitationMonthlyMm, 50);
  const maxTemp = Math.max(...climate.temperatureMonthlyMaxC, 35);
  const minTemp = Math.min(...climate.temperatureMonthlyMinC, 0);

  return (
    <div className="card-chai p-4 sm:p-5">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/70 pb-3 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <h2 className="font-montserrat text-xs sm:text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            12-Month Agroclimatology Cycles
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
          <span className="font-mono text-[10px]">
            {climate.latitude.toFixed(2)}°, {climate.longitude.toFixed(2)}°
          </span>
          <span>•</span>
          <span>30-Year Satellite Normals</span>
        </div>
      </div>

      {/* KPI Stats Grid - Fixed Uniform Heights */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {/* Annual Rainfall */}
        <div className="flex flex-col justify-between h-28 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium">Annual rainfall</span>
            <CloudRain className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-montserrat text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {climate.annualPrecipitationMm}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">mm/yr</span>
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {climate.annualPrecipitationMm < 500
              ? 'Arid deficit zone'
              : climate.annualPrecipitationMm < 900
              ? 'Moderate monsoon'
              : 'High rainfall'}
          </div>
        </div>

        {/* Mean Temperature */}
        <div className="flex flex-col justify-between h-28 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium">Mean temperature</span>
            <Thermometer className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-montserrat text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {climate.meanAnnualTemperatureC}°
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">C</span>
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            Peak: {Math.max(...climate.temperatureMonthlyMaxC)}°C • Low: {Math.min(...climate.temperatureMonthlyMinC)}°C
          </div>
        </div>

        {/* Root-Zone Moisture */}
        <div className="flex flex-col justify-between h-28 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium">Root-zone wetness</span>
            <Droplets className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-montserrat text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {(
                (climate.rootZoneSoilMoistureMonthly.reduce((a, b) => a + b, 0) / 12) *
                100
              ).toFixed(0)}
              %
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">avg</span>
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            0-100 cm root layer
          </div>
        </div>

        {/* Drought Probability */}
        <div className="flex flex-col justify-between h-28 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
            <span className="text-[11px] font-medium">Drought risk</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-montserrat text-lg font-bold tracking-tight text-rose-700 dark:text-rose-400">
              {climate.historicalDroughtProbabilityPercent}%
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">risk</span>
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            Historical cycle
          </div>
        </div>
      </div>

      {/* Monthly Chart Segmented Control Tabs - Fluid Mobile Layout */}
      <div className="mt-4 flex items-center justify-start border-b border-stone-200/70 pb-2 dark:border-stone-800">
        <div className="flex w-full rounded-lg border border-stone-200/80 bg-stone-100/80 p-0.5 text-xs dark:border-stone-800 dark:bg-stone-900/80">
          <button
            onClick={() => setActiveTab('rainfall')}
            className={`flex-1 min-h-[32px] rounded-md px-2 py-1 font-montserrat text-[11px] transition text-center ${
              activeTab === 'rainfall'
                ? 'bg-white text-stone-900 font-semibold dark:bg-stone-800 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Rainfall
          </button>
          <button
            onClick={() => setActiveTab('temperature')}
            className={`flex-1 min-h-[32px] rounded-md px-2 py-1 font-montserrat text-[11px] transition text-center ${
              activeTab === 'temperature'
                ? 'bg-white text-stone-900 font-semibold dark:bg-stone-800 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => setActiveTab('soil_moisture')}
            className={`flex-1 min-h-[32px] rounded-md px-2 py-1 font-montserrat text-[11px] transition text-center ${
              activeTab === 'soil_moisture'
                ? 'bg-white text-stone-900 font-semibold dark:bg-stone-800 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            Soil Wetness
          </button>
        </div>
      </div>

      {/* Responsive 12-Month Bar / Curve Chart */}
      <div className="mt-3">
        {activeTab === 'rainfall' && (
          <div>
            <div className="flex h-36 items-end gap-1 sm:gap-1.5 pt-4">
              {climate.precipitationMonthlyMm.map((val, idx) => {
                const heightPercent = Math.max(8, (val / maxRain) * 100);
                return (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 hidden rounded bg-stone-900 px-1.5 py-0.5 text-[10px] text-stone-100 group-hover:block border border-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-300 pointer-events-none z-10">
                      {val} mm
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-sm bg-sky-600/70 transition-all group-hover:bg-sky-600 dark:bg-sky-500/60 dark:group-hover:bg-sky-400"
                    />
                    <span className="mt-1 text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                      {MONTHS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-stone-600 dark:text-stone-400">
              Monthly precipitation (NASA PRECTOTCORR) indicates <span className="highlight">optimal monsoonal planting windows</span> for resilient scheduling.
            </p>
          </div>
        )}

        {activeTab === 'temperature' && (
          <div>
            <div className="flex h-36 items-end gap-1 sm:gap-1.5 pt-4">
              {climate.temperatureMonthlyMaxC.map((max, idx) => {
                const min = climate.temperatureMonthlyMinC[idx];
                const normalizedHeight = Math.max(10, ((max - minTemp) / (maxTemp - minTemp)) * 100);
                return (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                    <div className="absolute -top-7 hidden rounded bg-stone-900 px-1.5 py-0.5 text-[10px] text-stone-100 group-hover:block border border-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-300 pointer-events-none z-10">
                      {min}°C - {max}°C
                    </div>
                    <div
                      style={{ height: `${normalizedHeight}%` }}
                      className="w-full rounded-t-sm bg-amber-600/70 transition-all group-hover:bg-amber-600 dark:bg-amber-500/60 dark:group-hover:bg-amber-400"
                    />
                    <span className="mt-1 text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                      {MONTHS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-stone-600 dark:text-stone-400">
              Thermal envelope determines <span className="highlight">crop flowering safety</span> and prevents heat sterility risk.
            </p>
          </div>
        )}

        {activeTab === 'soil_moisture' && (
          <div>
            <div className="flex h-36 items-end gap-1 sm:gap-1.5 pt-4">
              {climate.rootZoneSoilMoistureMonthly.map((wetness, idx) => {
                const pct = Math.round(wetness * 100);
                return (
                  <div key={idx} className="group relative flex flex-1 flex-col items-center h-full justify-end">
                    <div className="absolute -top-7 hidden rounded bg-stone-900 px-1.5 py-0.5 text-[10px] text-stone-100 group-hover:block border border-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-300 pointer-events-none z-10">
                      {pct}% saturation
                    </div>
                    <div
                      style={{ height: `${Math.max(10, pct)}%` }}
                      className="w-full rounded-t-sm bg-emerald-600/70 transition-all group-hover:bg-emerald-600 dark:bg-emerald-500/60 dark:group-hover:bg-emerald-400"
                    />
                    <span className="mt-1 text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                      {MONTHS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-stone-600 dark:text-stone-400">
              NASA MERRA-2 root-zone wetness (GWETROOT) gauges <span className="highlight">subsoil water reserves</span> for drought buffering.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
