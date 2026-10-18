import React, { useState, useEffect } from 'react';
import { AGRO_REGIONS } from './data/regions';
import { AgroRegion, SoilProfile, FarmerPriorities, NasaClimateData, RotationStrategy } from './types';
import { fetchNasaClimatology } from './services/nasaService';
import { generateCuratedStrategies } from './engine/rotationSolver';
import { Language } from './data/translations';
import {
  detectLanguageFromCoordinates,
  getInitialLanguage,
  persistUserLanguage,
} from './services/geoLanguage';
import { getCurrentFarmLocation, findNearestAgroRegion } from './services/geolocationService';

import { Header } from './components/Header';
import { BottomNavigation, AppTab } from './components/BottomNavigation';
import { FarmerHomeTab } from './components/FarmerHomeTab';
import { FarmerFieldTab } from './components/FarmerFieldTab';
import { StrategyComparison } from './components/StrategyComparison';
import { TimelineGantt } from './components/TimelineGantt';
import { VoiceAssistantTab } from './components/VoiceAssistantTab';
import { CustomRotationBuilder } from './components/CustomRotationBuilder';
import { ExportModal } from './components/ExportModal';

export function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<AppTab>('home');

  // Coordinates State
  const [currentRegion, setCurrentRegion] = useState<AgroRegion>(AGRO_REGIONS[0]);
  const [selectedLat, setSelectedLat] = useState<number>(AGRO_REGIONS[0].latitude);
  const [selectedLon, setSelectedLon] = useState<number>(AGRO_REGIONS[0].longitude);

  // Language & Auto-Detection State
  const [langState, setLangState] = useState(() =>
    getInitialLanguage(AGRO_REGIONS[0].latitude, AGRO_REGIONS[0].longitude)
  );
  const lang = langState.lang;
  const isAutoDetectedLang = langState.isAuto;

  // NASA Climate & Soil State
  const [climateData, setClimateData] = useState<NasaClimateData>(AGRO_REGIONS[0].cachedClimate);
  const [apiSource, setApiSource] = useState<'live' | 'cached' | 'fallback'>('cached');
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

  // Theme State: Default to ChaiUI White/Light Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fieldshift_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('fieldshift_theme', theme);
  }, [theme]);

  // Effect: Automatic GPS detection on app launch
  useEffect(() => {
    let active = true;
    getCurrentFarmLocation()
      .then((res) => {
        if (!active) return;
        if (res.latitude !== 0 && res.longitude !== 0 && !res.error) {
          setSelectedLat(res.latitude);
          setSelectedLon(res.longitude);

          const nearest = findNearestAgroRegion(res.latitude, res.longitude, AGRO_REGIONS);
          if (nearest) {
            setCurrentRegion(nearest);
            setSoil(nearest.typicalSoil);
          }
        }
      })
      .catch(() => {
        // Graceful fallback to initial default region
      });

    return () => {
      active = false;
    };
  }, []);

  // Handler: Select Region
  const handleSelectRegion = (region: AgroRegion) => {
    setCurrentRegion(region);
    setSelectedLat(region.latitude);
    setSelectedLon(region.longitude);
    setSoil(region.typicalSoil);
  };

  // Handler: User manual language selection
  const handleManualLanguageSelect = (newLang: Language) => {
    setLangState({ lang: newLang, isAuto: false });
    persistUserLanguage(newLang, false);
  };

  // Effect: Auto-switch language based on coordinates if in auto-mode
  useEffect(() => {
    if (isAutoDetectedLang) {
      const detected = detectLanguageFromCoordinates(selectedLat, selectedLon);
      if (detected !== lang) {
        setLangState({ lang: detected, isAuto: true });
      }
    }
  }, [selectedLat, selectedLon, isAutoDetectedLang]);

  // Effect: Fetch NASA data when coordinates update
  useEffect(() => {
    let isCancelled = false;

    fetchNasaClimatology(selectedLat, selectedLon)
      .then((res) => {
        if (!isCancelled) {
          setClimateData(res.data);
          setApiSource(res.source);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Error fetching NASA climatology:', err);
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

    if (activeStrategy.archetype === 'climate_shield') {
      setActiveStrategy(updated.climateShield);
    } else if (activeStrategy.archetype === 'balanced_profit') {
      setActiveStrategy(updated.balancedProfit);
    } else if (activeStrategy.archetype === 'soil_builder') {
      setActiveStrategy(updated.soilBuilder);
    } else if (activeStrategy.archetype === 'custom') {
      // Retain custom
    } else {
      setActiveStrategy(updated.conventional);
    }
  }, [currentRegion, climateData, soil, priorities]);

  return (
    <div
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#fafafa] text-stone-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-24 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-stone-100 dark:selection:bg-emerald-950 dark:selection:text-emerald-300 ${
        lang === 'ur' ? 'font-urdu' : ''
      }`}
    >
      {/* Top Mobile Application Header */}
      <Header
        currentRegion={currentRegion}
        allRegions={AGRO_REGIONS}
        onSelectRegion={handleSelectRegion}
        apiSource={apiSource}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        lang={lang}
        onSelectLanguage={handleManualLanguageSelect}
        isAutoDetectedLang={isAutoDetectedLang}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Tabbed Container */}
      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-6">
        {/* TAB 1: HOME */}
        {currentTab === 'home' && (
          <FarmerHomeTab
            region={currentRegion}
            climate={climateData}
            activeStrategy={activeStrategy}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            lang={lang}
          />
        )}

        {/* TAB 2: MY FIELD */}
        {currentTab === 'field' && (
          <FarmerFieldTab
            region={currentRegion}
            allRegions={AGRO_REGIONS}
            soil={soil}
            priorities={priorities}
            onUpdateSoil={setSoil}
            onUpdatePriorities={setPriorities}
            onSelectRegion={handleSelectRegion}
            onSelectCoordinates={(lat, lon) => {
              setSelectedLat(lat);
              setSelectedLon(lon);
            }}
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            lang={lang}
          />
        )}

        {/* TAB 3: CROP ROTATION */}
        {currentTab === 'rotation' && (
          <div className="space-y-6">
            <StrategyComparison
              strategies={strategies}
              selectedStrategyId={activeStrategy.id}
              onSelectStrategy={(strat) => setActiveStrategy(strat)}
              lang={lang}
            />

            <TimelineGantt
              strategy={activeStrategy}
              onOpenCustomBuilder={() => setIsCustomBuilderOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: VOICE ASSISTANT */}
        {currentTab === 'voice' && (
          <VoiceAssistantTab
            region={currentRegion}
            soil={soil}
            lang={lang}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (Mobile Native Ergonomics) */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        lang={lang}
      />

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
