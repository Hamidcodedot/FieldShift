import React, { useState, useEffect } from 'react';
import { AGRO_REGIONS, getRegionById } from './data/regions';
import { AgroRegion, SoilProfile, FarmerPriorities, NasaClimateData, RotationStrategy } from './types';
import { fetchNasaClimatology } from './services/nasaService';
import { generateCuratedStrategies } from './engine/rotationSolver';

import { Header } from './components/Header';
import { MapSelector } from './components/MapSelector';
import { ClimateDashboard } from './components/ClimateDashboard';
import { SoilAndPriorities } from './components/SoilAndPriorities';
import { StrategyComparison } from './components/StrategyComparison';
import { TimelineGantt } from './components/TimelineGantt';
import { CustomRotationBuilder } from './components/CustomRotationBuilder';
import { ExportModal } from './components/ExportModal';

import { Shield, Sparkles, Database, Layers, ArrowUpRight } from 'lucide-react';

export function App() {
  // Current Region & Coordinates State
  const [currentRegion, setCurrentRegion] = useState<AgroRegion>(AGRO_REGIONS[0]);
  const [selectedLat, setSelectedLat] = useState<number>(AGRO_REGIONS[0].latitude);
  const [selectedLon, setSelectedLon] = useState<number>(AGRO_REGIONS[0].longitude);

  // NASA Climate & Soil State
  const [climateData, setClimateData] = useState<NasaClimateData>(AGRO_REGIONS[0].cachedClimate);
  const [apiSource, setApiSource] = useState<'live' | 'cached' | 'fallback'>('cached');
  const [loadingClimate, setLoadingClimate] = useState<boolean>(false);
  const [soil, setSoil] = useState<SoilProfile>(AGRO_REGIONS[0].typicalSoil);

  // Farmer Priorities Optimization Weights
  const [priorities, setPriorities] = useState<FarmerPriorities>({
    soilHealthWeight: 80,
    waterConservationWeight: 75,
    economicProfitWeight: 65,
    climateResilienceWeight: 70,
    waterAccessType: 'groundwater_borewell',
  });

  // Generated Strategies State
  const [strategies, setStrategies] = useState(() =>
    generateCuratedStrategies(currentRegion, climateData, soil, priorities)
  );
  const [activeStrategy, setActiveStrategy] = useState<RotationStrategy>(strategies.soilBuilder);

  // Modals State
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Effect: When region is switched from dropdown or presets
  const handleSelectRegion = (region: AgroRegion) => {
    setCurrentRegion(region);
    setSelectedLat(region.latitude);
    setSelectedLon(region.longitude);
    setSoil(region.typicalSoil);
  };

  // Effect: Fetch NASA data when coordinates update
  useEffect(() => {
    let isCancelled = false;
    setLoadingClimate(true);

    fetchNasaClimatology(selectedLat, selectedLon)
      .then((res) => {
        if (!isCancelled) {
          setClimateData(res.data);
          setApiSource(res.source);
          setLoadingClimate(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error fetching NASA climatology:', err);
          setLoadingClimate(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedLat, selectedLon]);

  // Effect: Recalculate strategies when climate, soil, or priorities change
  useEffect(() => {
    const updated = generateCuratedStrategies(currentRegion, climateData, soil, priorities);
    setStrategies(updated);

    // Keep active strategy updated to corresponding archetype
    if (activeStrategy.archetype === 'climate_shield') {
      setActiveStrategy(updated.climateShield);
    } else if (activeStrategy.archetype === 'balanced_profit') {
      setActiveStrategy(updated.balancedProfit);
    } else if (activeStrategy.archetype === 'soil_builder') {
      setActiveStrategy(updated.soilBuilder);
    } else if (activeStrategy.archetype === 'custom') {
      // Keep existing custom strategy unless reset
    } else {
      setActiveStrategy(updated.conventional);
    }
  }, [currentRegion, climateData, soil, priorities]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Application Header */}
      <Header
        currentRegion={currentRegion}
        allRegions={AGRO_REGIONS}
        onSelectRegion={handleSelectRegion}
        apiSource={apiSource}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Challenge Context Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-linear-to-r from-emerald-950/40 via-zinc-900/60 to-zinc-900/40 p-4 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-emerald-500/30 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  2026 NASA Space Apps Challenge
                </span>
                <span className="text-xs text-zinc-400">
                  Field Shift: Adapting Farms with NASA Data
                </span>
              </div>
              <h1 className="mt-1.5 text-base sm:text-lg font-bold text-zinc-100">
                {currentRegion.name} — Decision Support System
              </h1>
              <p className="mt-1 max-w-3xl text-xs text-zinc-300 leading-relaxed">
                Addressing {currentRegion.primaryDegradationRisk} Through predictive NASA Earth
                observations (POWER & MERRA-2) and botanical crop rotation science, this system
                simulates 3-year soil nitrogen restoration, root-zone water budgets, and climate risk.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => setIsCustomBuilderOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Open Rotation Sandbox</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Geospatial Map + NASA Agroclimatology */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Map Selector (5 Cols) */}
          <div className="lg:col-span-5">
            <MapSelector
              currentRegion={currentRegion}
              allRegions={AGRO_REGIONS}
              onSelectCoordinates={(lat, lon) => {
                setSelectedLat(lat);
                setSelectedLon(lon);
              }}
              onSelectRegion={handleSelectRegion}
              selectedLat={selectedLat}
              selectedLon={selectedLon}
            />
          </div>

          {/* NASA Observations Dashboard (7 Cols) */}
          <div className="lg:col-span-7">
            <ClimateDashboard climate={climateData} region={currentRegion} />
          </div>
        </div>

        {/* Section 2: Soil Baseline & Optimization Priorities */}
        <SoilAndPriorities
          soil={soil}
          priorities={priorities}
          onUpdateSoil={setSoil}
          onUpdatePriorities={setPriorities}
        />

        {/* Section 3: Comparative Multi-Objective Strategies */}
        <StrategyComparison
          strategies={strategies}
          selectedStrategyId={activeStrategy.id}
          onSelectStrategy={(strat) => setActiveStrategy(strat)}
        />

        {/* Section 4: Active Strategy Sequential Timeline & Invariants */}
        <TimelineGantt
          strategy={activeStrategy}
          onOpenCustomBuilder={() => setIsCustomBuilderOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-zinc-800/80 bg-zinc-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-300">FieldShift</span>
              <span>•</span>
              <span>Open-Science Agronomic Decision-Support Engine</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span>Data: NASA POWER API v2 (MERRA-2)</span>
              <span>•</span>
              <span>ISRIC SoilGrids v2 (250m)</span>
              <span>•</span>
              <span>FAO-56 Penman-Monteith Evapotranspiration</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isCustomBuilderOpen && (
        <CustomRotationBuilder
          region={currentRegion}
          climate={climateData}
          soil={soil}
          priorities={priorities}
          initialCrops={activeStrategy.seasons.map((s) => s.crop)}
          onSaveCustomStrategy={(customStrat) => {
            setActiveStrategy(customStrat);
          }}
          onClose={() => setIsCustomBuilderOpen(false)}
        />
      )}

      {isExportModalOpen && (
        <ExportModal
          strategy={activeStrategy}
          region={currentRegion}
          soil={soil}
          climate={climateData}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
