import React from 'react';
import { RotationStrategy, AgroRegion, SoilProfile, NasaClimateData } from '../types';
import { Printer, X, FileText } from 'lucide-react';
import { NasaLogo } from './NasaLogo';

interface ExportModalProps {
  strategy: RotationStrategy;
  region: AgroRegion;
  soil: SoilProfile;
  climate: NasaClimateData;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  strategy,
  region,
  soil,
  climate,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md print:p-0 print:bg-white">
      <div className="card-chai relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col p-6 overflow-y-auto print:max-h-none print:w-full print:border-none print:bg-white print:text-black bg-white dark:border-stone-800 dark:bg-stone-950 shadow-2xl">
        {/* Header (No print buttons in print view) */}
        <div className="flex items-center justify-between border-b border-stone-200/70 pb-3 print:hidden dark:border-stone-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-montserrat text-base font-semibold text-stone-900 dark:text-stone-100">
              Printable farmer action plan and agronomic brief
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-asym inline-flex min-h-[36px] items-center gap-1.5 bg-stone-900 px-3.5 py-1.5 font-montserrat text-xs font-semibold text-white transition hover:bg-stone-800 active:scale-95 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="mt-4 space-y-6 text-stone-800 print:text-black dark:text-stone-200">
          {/* Document Header */}
          <div className="border-b border-stone-200/70 pb-4 print:border-stone-300 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-montserrat text-xl font-bold tracking-tight text-stone-900 print:text-black dark:text-stone-100">
                  FieldShift: Agro-Ecological Farm Action Plan
                </h1>
                <p className="text-xs text-stone-500 print:text-stone-600 dark:text-stone-400">
                  Formulated via NASA Earth Observations (POWER and MERRA-2) • Generated on{' '}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded border border-stone-300 bg-stone-100 px-2 py-1 font-montserrat text-xs font-medium text-stone-800 print:border-stone-400 print:text-black dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
                <NasaLogo className="h-4 w-4" />
                <span>NASA Space Apps 2026</span>
              </div>
            </div>
          </div>

          {/* Farm & Climate Context Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 print:grid-cols-4">
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5 print:border-stone-300 dark:border-stone-800 dark:bg-stone-900/40">
              <span className="text-[10px] uppercase font-medium text-stone-500 print:text-stone-600 dark:text-stone-400">Location</span>
              <p className="font-montserrat font-semibold text-stone-900 print:text-black dark:text-stone-100">{region.name}</p>
              <p className="font-mono text-[10px] text-stone-500 print:text-stone-600 dark:text-stone-400">
                {climate.latitude.toFixed(2)}°N, {climate.longitude.toFixed(2)}°E
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5 print:border-stone-300 dark:border-stone-800 dark:bg-stone-900/40">
              <span className="text-[10px] uppercase font-medium text-stone-500 print:text-stone-600 dark:text-stone-400">Soil baseline</span>
              <p className="font-montserrat font-semibold text-stone-900 print:text-black dark:text-stone-100 capitalize">
                {soil.texture.replace('_', ' ')}
              </p>
              <p className="text-[10px] text-stone-500 print:text-stone-600 dark:text-stone-400">
                pH: {soil.ph} • SOM: {soil.organicMatterPercent}%
              </p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5 print:border-stone-300 dark:border-stone-800 dark:bg-stone-900/40">
              <span className="text-[10px] uppercase font-medium text-stone-500 print:text-stone-600 dark:text-stone-400">Annual rainfall</span>
              <p className="font-montserrat font-semibold text-stone-900 print:text-black dark:text-stone-100">
                {climate.annualPrecipitationMm} mm/year
              </p>
              <p className="text-[10px] text-stone-500 print:text-stone-600 dark:text-stone-400">NASA PRECTOTCORR</p>
            </div>

            <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5 print:border-stone-300 dark:border-stone-800 dark:bg-stone-900/40">
              <span className="text-[10px] uppercase font-medium text-stone-500 print:text-stone-600 dark:text-stone-400">Selected strategy</span>
              <p className="font-montserrat font-semibold text-stone-900 print:text-black dark:text-stone-100">
                {strategy.title}
              </p>
              <p className="text-[10px] text-stone-500 print:text-stone-600 dark:text-stone-400">Score: {strategy.overallScore}/100</p>
            </div>
          </div>

          {/* Sequential Crop Rotation Schedule Table */}
          <div>
            <h3 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-stone-900 print:text-black dark:text-stone-100">
              Multi-year cropping sequence and agronomic invariants
            </h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] uppercase text-stone-500 print:border-stone-300 print:text-stone-700 dark:border-stone-800 dark:text-stone-400">
                    <th className="py-2">Season</th>
                    <th className="py-2">Crop & Botanical Family</th>
                    <th className="py-2">Root Depth</th>
                    <th className="py-2">Water Need</th>
                    <th className="py-2">Net Nitrogen</th>
                    <th className="py-2">Disease Interruption</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/60 print:divide-stone-200 dark:divide-stone-800/60">
                  {strategy.seasons.map((slot, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/60 print:hover:bg-transparent dark:hover:bg-stone-900/30">
                      <td className="py-2 font-medium text-stone-900 print:text-black dark:text-stone-100">
                        {slot.seasonName}
                      </td>
                      <td className="py-2">
                        <span className="font-semibold text-stone-900 print:text-black dark:text-stone-100">
                          {slot.crop.name}
                        </span>{' '}
                        <span className="text-[10px] text-stone-500 print:text-stone-600 dark:text-stone-400">
                          ({slot.crop.family})
                        </span>
                      </td>
                      <td className="py-2 font-mono text-stone-600 print:text-black dark:text-stone-300">
                        {slot.crop.maxRootingDepthMeters} m
                      </td>
                      <td className="py-2 font-mono text-stone-600 print:text-black dark:text-stone-300">
                        {slot.crop.waterRequirementMm} mm
                      </td>
                      <td className="py-2 font-mono">
                        <span
                          className={
                            slot.soilNitrogenBalanceKg >= 0
                              ? 'text-emerald-700 font-semibold print:text-emerald-800 dark:text-emerald-400'
                              : 'text-rose-600 font-semibold print:text-rose-800 dark:text-rose-400'
                          }
                        >
                          {slot.soilNitrogenBalanceKg > 0 ? '+' : ''}
                          {slot.soilNitrogenBalanceKg} kg/ha
                        </span>
                      </td>
                      <td className="py-2">
                        {slot.pestCycleBroken ? (
                          <span className="text-emerald-700 font-medium print:text-emerald-800 dark:text-emerald-400">Active</span>
                        ) : (
                          <span className="text-rose-600 font-medium print:text-rose-800 dark:text-rose-400">Family repeated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Field Implementation Guidelines */}
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 print:border-stone-300 print:bg-stone-50 dark:border-stone-800 dark:bg-stone-900/40">
            <h4 className="font-montserrat text-xs font-semibold uppercase tracking-wider text-stone-900 print:text-black dark:text-stone-100">
              Actionable field agronomic advisory
            </h4>
            <div className="mt-2 space-y-2 text-xs text-stone-700 print:text-black dark:text-stone-300">
              <p>
                <strong>1. Symbiotic Inoculation:</strong> Inoculate all legume slots with certified Rhizobium bio-fertilizer strains to ensure biological atmospheric nitrogen fixation rates reach expected targets.
              </p>
              <p>
                <strong>2. Cover Crop Termination:</strong> Terminate green manure and cover crops at 10 to 20% bloom stage to prevent moisture depletion of following cash crop roots, and incorporate residue to accelerate active microbial humification.
              </p>
              <p>
                <strong>3. NASA Soil Moisture Calibration:</strong> In seasons with sub-25% root-zone wetness (NASA GWETROOT), delay planting until the first 35 mm infiltration event to safeguard germination from soil crusting.
              </p>
              <p>
                <strong>4. Chemical Fertilizer Reduction:</strong> Due to cumulative biological nitrogen credits (+{strategy.total3YearNitrogenNetKgPerHa} kg/ha), synthetic urea top-dressing can be scaled back by 30 to 45% without yield compromise.
              </p>
            </div>
          </div>

          {/* Environmental Savings Summary */}
          <div className="flex items-center justify-between border-t border-stone-200/70 pt-3 text-xs text-stone-500 print:border-stone-300 print:text-stone-600 dark:border-stone-800 dark:text-stone-400 font-montserrat">
            <span>Water conserved: +{strategy.total3YearWaterSavedM3PerHa.toLocaleString()} m³/ha</span>
            <span>Organic carbon accrual: +{strategy.total3YearCarbonSequestrationTonPerHa} t/ha</span>
            <span>Break-even window: ~{strategy.breakEvenMonths} months</span>
          </div>
        </div>
      </div>
    </div>
  );
};
