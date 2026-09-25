import React from 'react';
import { RotationStrategy, AgroRegion, SoilProfile, NasaClimateData } from '../types';
import { Printer, Download, X, CheckCircle, FileText, Satellite } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-y-auto print:max-h-none print:w-full print:border-none print:bg-white print:text-black print:shadow-none">
        {/* Header (No print buttons in print view) */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">
              Printable Farmer Action Plan & Agronomic Brief
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="mt-4 space-y-6 text-zinc-200 print:text-black">
          {/* Document Header */}
          <div className="border-b border-zinc-800 pb-4 print:border-zinc-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100 print:text-black">
                  FieldShift: Agro-Ecological Farm Action Plan
                </h1>
                <p className="text-xs text-zinc-400 print:text-zinc-600">
                  Formulated via NASA Earth Observations (POWER & MERRA-2) • Generated on{' '}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="rounded border border-emerald-500/40 bg-emerald-950/40 px-2 py-1 text-xs font-semibold text-emerald-400 print:border-emerald-600 print:text-emerald-800">
                NASA Space Apps 2026
              </div>
            </div>
          </div>

          {/* Farm & Climate Context Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 print:grid-cols-4">
            <div className="rounded-lg border border-zinc-800 p-2.5 print:border-zinc-300">
              <span className="text-[10px] uppercase text-zinc-400 print:text-zinc-600">Location</span>
              <p className="font-semibold text-zinc-200 print:text-black">{region.name}</p>
              <p className="font-mono text-[10px] text-zinc-400 print:text-zinc-600">
                {climate.latitude.toFixed(2)}°N, {climate.longitude.toFixed(2)}°E
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-2.5 print:border-zinc-300">
              <span className="text-[10px] uppercase text-zinc-400 print:text-zinc-600">Soil Baseline</span>
              <p className="font-semibold text-zinc-200 print:text-black">
                {soil.texture.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-[10px] text-zinc-400 print:text-zinc-600">
                pH: {soil.ph} • SOM: {soil.organicMatterPercent}%
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-2.5 print:border-zinc-300">
              <span className="text-[10px] uppercase text-zinc-400 print:text-zinc-600">Annual Rainfall</span>
              <p className="font-semibold text-zinc-200 print:text-black">
                {climate.annualPrecipitationMm} mm/year
              </p>
              <p className="text-[10px] text-zinc-400 print:text-zinc-600">NASA PRECTOTCORR</p>
            </div>

            <div className="rounded-lg border border-zinc-800 p-2.5 print:border-zinc-300">
              <span className="text-[10px] uppercase text-zinc-400 print:text-zinc-600">Selected Strategy</span>
              <p className="font-semibold text-emerald-400 print:text-emerald-700">
                {strategy.title}
              </p>
              <p className="text-[10px] text-zinc-400 print:text-zinc-600">Score: {strategy.overallScore}/100</p>
            </div>
          </div>

          {/* Sequential Crop Rotation Schedule Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800">
              Multi-Year Cropping Sequence & Agronomic Invariants
            </h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] uppercase text-zinc-400 print:border-zinc-300 print:text-zinc-700">
                    <th className="py-2">Season</th>
                    <th className="py-2">Crop & Botanical Family</th>
                    <th className="py-2">Root Depth</th>
                    <th className="py-2">Water Need</th>
                    <th className="py-2">Net Nitrogen</th>
                    <th className="py-2">Disease Interruption</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200">
                  {strategy.seasons.map((slot, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40 print:hover:bg-transparent">
                      <td className="py-2 font-medium text-zinc-200 print:text-black">
                        {slot.seasonName}
                      </td>
                      <td className="py-2">
                        <span className="font-semibold text-zinc-100 print:text-black">
                          {slot.crop.name}
                        </span>{' '}
                        <span className="text-[10px] text-zinc-400 print:text-zinc-600">
                          ({slot.crop.family})
                        </span>
                      </td>
                      <td className="py-2 font-mono text-zinc-300 print:text-black">
                        {slot.crop.maxRootingDepthMeters} m
                      </td>
                      <td className="py-2 font-mono text-zinc-300 print:text-black">
                        {slot.crop.waterRequirementMm} mm
                      </td>
                      <td className="py-2 font-mono">
                        <span
                          className={
                            slot.soilNitrogenBalanceKg >= 0
                              ? 'text-emerald-400 font-semibold print:text-emerald-700'
                              : 'text-rose-400 font-semibold print:text-rose-700'
                          }
                        >
                          {slot.soilNitrogenBalanceKg > 0 ? '+' : ''}
                          {slot.soilNitrogenBalanceKg} kg/ha
                        </span>
                      </td>
                      <td className="py-2">
                        {slot.pestCycleBroken ? (
                          <span className="text-emerald-400 print:text-emerald-700">Active</span>
                        ) : (
                          <span className="text-rose-400 print:text-rose-700">Family Repeated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Field Implementation Guidelines */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 print:border-zinc-300 print:bg-zinc-50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800">
              Actionable Field Agronomic Advisory
            </h4>
            <div className="mt-2 space-y-2 text-xs text-zinc-300 print:text-zinc-800">
              <p>
                <strong>1. Symbiotic Inoculation:</strong> Inoculate all legume slots with certified Rhizobium bio-fertilizer strains (e.g. <em>Bradyrhizobium</em> for soy/cowpea, <em>Mesorhizobium</em> for chickpea) to ensure biological atmospheric nitrogen fixation rates reach expected targets.
              </p>
              <p>
                <strong>2. Cover Crop Termination:</strong> Terminate green manure and cover crops at 10–20% bloom stage to prevent moisture depletion of following cash crop roots, and incorporate residue to accelerate active microbial humification.
              </p>
              <p>
                <strong>3. NASA Soil Moisture Calibration:</strong> In seasons with sub-25% root-zone wetness (NASA GWETROOT), delay planting until the first 35 mm infiltration event to safeguard germination from soil crusting.
              </p>
              <p>
                <strong>4. Chemical Fertilizer Reduction:</strong> Due to cumulative biological nitrogen credits (+{strategy.total3YearNitrogenNetKgPerHa} kg/ha), synthetic urea top-dressing can be scaled back by 30–45% without yield compromise.
              </p>
            </div>
          </div>

          {/* Environmental Savings Summary */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-3 text-xs text-zinc-400 print:border-zinc-300 print:text-zinc-600">
            <span>Water Conserved: +{strategy.total3YearWaterSavedM3PerHa.toLocaleString()} m³/ha</span>
            <span>Organic Carbon Accrual: +{strategy.total3YearCarbonSequestrationTonPerHa} t/ha</span>
            <span>Break-even Window: ~{strategy.breakEvenMonths} Months</span>
          </div>
        </div>
      </div>
    </div>
  );
};
