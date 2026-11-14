import { useState, useEffect, useMemo } from 'react';
import { AGRO_REGIONS } from './data/regions';
import { EVALUATION_SCENARIOS } from './data/evaluationScenarios';
import { AgroRegion, SoilProfile, FarmerPriorities, NasaClimateData, RotationStrategy, FarmerFieldProfile } from './types';
import { fetchNasaClimatology } from './services/nasaService';
import { generateCuratedStrategies } from './engine/rotationSolver';
import { getCurrentFarmLocation, findNearestAgroRegion } from './services/geolocationService';
import { getHumanReadableLocation } from './services/reverseGeocodeService';
import {
  loadAllFields,
  saveAllFields,
  getActiveFieldId,
  setActiveFieldId,
  checkIsOnboardingCompleted,
} from './services/fieldProfileService';

import { Header } from './components/Header';
import { BottomNavigation, AppTab } from './components/BottomNavigation';
import { FarmerHomeTab } from './components/FarmerHomeTab';
import { FarmerFieldTab } from './components/FarmerFieldTab';
import { StrategyComparison } from './components/StrategyComparison';
import { TimelineGantt } from './components/TimelineGantt';
import { FieldAIChatbot } from './components/FieldAIChatbot';
import { FarmerWeatherTab } from './components/FarmerWeatherTab';
import { FarmerSettingsTab } from './components/FarmerSettingsTab';
import { CustomRotationBuilder } from './components/CustomRotationBuilder';
import { ExportModal } from './components/ExportModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Bot, X } from 'lucide-react';
import { speakFarmerResponse, stopSpeaking } from './services/voiceAssistant';

export function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<AppTab>('home');

  // Multi-Field Profile State (Stored persistently in localStorage)
  const [fields, setFields] = useState<FarmerFieldProfile[]>(() => loadAllFields(AGRO_REGIONS[0]));
  const [activeFieldId, setActiveFieldIdState] = useState<string>(() => getActiveFieldId(fields));
  const activeField = useMemo(
    () => fields.find((f) => f.id === activeFieldId) || fields[0],
    [fields, activeFieldId]
  );

  // Coordinates & Agro Region State (Derived from activeField)
  const [currentRegion, setCurrentRegion] = useState<AgroRegion>(() => {
    return findNearestAgroRegion(activeField.latitude, activeField.longitude, AGRO_REGIONS) || AGRO_REGIONS[0];
  });
  const [selectedLat, setSelectedLat] = useState<number>(activeField.latitude);
  const [selectedLon, setSelectedLon] = useState<number>(activeField.longitude);

  // First-Time Onboarding Wizard State (Automatically launches if field is unconfigured)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !checkIsOnboardingCompleted());

  // NASA Climate & Soil State
  const [climateData, setClimateData] = useState<NasaClimateData>(currentRegion.cachedClimate);
  const [apiSource, setApiSource] = useState<'live' | 'cached' | 'fallback'>('cached');
  const [soil, setSoil] = useState<SoilProfile>(() => ({
    ...currentRegion.typicalSoil,
    texture: activeField.soilTexture || currentRegion.typicalSoil.texture,
    organicMatterPercent: activeField.soilOrganicMatter ?? currentRegion.typicalSoil.organicMatterPercent,
  }));

  // Farmer Priorities Optimization Weights
  const [priorities, setPriorities] = useState<FarmerPriorities>({
    soilHealthWeight: 80,
    waterConservationWeight: 75,
    economicProfitWeight: 65,
    climateResilienceWeight: 70,
    waterAccessType: activeField.irrigationMethod || 'groundwater_borewell',
  });

  // Generated Strategies State
  const [strategies, setStrategies] = useState(() =>
    generateCuratedStrategies(currentRegion, climateData, soil, priorities, activeField)
  );
  const [activeStrategy, setActiveStrategy] = useState<RotationStrategy>(strategies.soilBuilder);

  // Modals State
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPlayingBriefing, setIsPlayingBriefing] = useState<boolean>(false);

  const handleToggleVoiceBriefing = () => {
    if (isPlayingBriefing) {
      stopSpeaking();
      setIsPlayingBriefing(false);
      return;
    }

    const standingLabel = activeField.currentCropHistory?.patternLabel?.split(' (')[0] || 'Wheat';
    const rootMoist = Math.round(
      climateData.currentMonthRootZoneWetnessPercent ??
        (climateData.rootZoneSoilMoistureMonthly?.[new Date().getMonth()]
          ? climateData.rootZoneSoilMoistureMonthly[new Date().getMonth()] * 100
          : 42)
    );
    const nextCropName = activeStrategy.seasons[0]?.crop.name.split(' (')[0] || 'Chickpea';
    const nextNFix = Math.round(activeStrategy.seasons[0]?.soilNitrogenBalanceKg ?? 38);
    const script = `Field briefing for ${activeField.farmName}. Your standing crop is ${standingLabel}, currently in ${activeField.sowingStage || 'vegetative'} stage. Subsoil root-zone moisture is at ${rootMoist} percent. Recommended next rotation crop after harvest is ${nextCropName}${nextNFix > 0 ? ` to fix ${nextNFix} kilograms of biological nitrogen` : ''}.`;

    setIsPlayingBriefing(true);
    speakFarmerResponse(
      script,
      () => setIsPlayingBriefing(false),
      () => setIsPlayingBriefing(false)
    );
  };

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

  // Effect: Automatic GPS detection on app launch ONLY IF field is not yet configured by farmer
  useEffect(() => {
    if (activeField.isConfigured || activeField.hasCompletedOnboarding) {
      return;
    }

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
  }, [activeField.isConfigured, activeField.hasCompletedOnboarding]);

  // Handler: Select Region
  const handleSelectRegion = (region: AgroRegion) => {
    setCurrentRegion(region);
    setSelectedLat(region.latitude);
    setSelectedLon(region.longitude);
    setSoil(region.typicalSoil);

    handleUpdateField({
      ...activeField,
      latitude: region.latitude,
      longitude: region.longitude,
      placeName: region.name.split(' (')[0],
    });
  };

  // Handler: Switch active field
  const handleSelectActiveField = (fieldId: string, customList?: FarmerFieldProfile[]) => {
    setActiveFieldIdState(fieldId);
    setActiveFieldId(fieldId);

    const listToSearch = customList || fields;
    const targetField = listToSearch.find((f) => f.id === fieldId);
    if (targetField) {
      setSelectedLat(targetField.latitude);
      setSelectedLon(targetField.longitude);

      const nearest = findNearestAgroRegion(targetField.latitude, targetField.longitude, AGRO_REGIONS);
      if (nearest) {
        setCurrentRegion(nearest);
      }

      setSoil((prev) => ({
        ...prev,
        texture: targetField.soilTexture,
        organicMatterPercent: targetField.soilOrganicMatter,
      }));

      setPriorities((prev) => ({
        ...prev,
        waterAccessType: targetField.irrigationMethod,
      }));
    }
  };

  // Handler: Update active field
  const handleUpdateField = (updated: FarmerFieldProfile) => {
    const updatedFields = fields.map((f) => (f.id === updated.id ? updated : f));
    setFields(updatedFields);
    saveAllFields(updatedFields);

    setSelectedLat(updated.latitude);
    setSelectedLon(updated.longitude);

    const nearest = findNearestAgroRegion(updated.latitude, updated.longitude, AGRO_REGIONS);
    if (nearest) {
      setCurrentRegion(nearest);
    }

    setSoil((prev) => ({
      ...prev,
      texture: updated.soilTexture,
      organicMatterPercent: updated.soilOrganicMatter,
    }));

    setPriorities((prev) => ({
      ...prev,
      waterAccessType: updated.irrigationMethod,
    }));
  };

  // Handler: Add new field
  const handleAddNewField = (newField: FarmerFieldProfile) => {
    let updatedFields: FarmerFieldProfile[];
    const placeholderIdx = fields.findIndex((f) => !f.isConfigured && !f.hasCompletedOnboarding);
    if (placeholderIdx >= 0 && fields.length === 1) {
      updatedFields = [newField];
    } else {
      const filtered = fields.filter((f) => f.id !== newField.id);
      updatedFields = [...filtered, newField];
    }
    setFields(updatedFields);
    saveAllFields(updatedFields);
    handleSelectActiveField(newField.id, updatedFields);
  };

  // Handler: Delete field
  const handleDeleteField = (fieldId: string) => {
    if (fields.length <= 1) return; // Keep at least one field
    const remaining = fields.filter((f) => f.id !== fieldId);
    setFields(remaining);
    saveAllFields(remaining);

    if (activeFieldId === fieldId) {
      handleSelectActiveField(remaining[0].id, remaining);
    }
  };

  // Handler: Complete Onboarding and directly apply to My Field & NASA Engine
  const handleCompleteOnboarding = (completedProfile: FarmerFieldProfile) => {
    let updatedFields: FarmerFieldProfile[];
    const existingIndex = fields.findIndex((f) => f.id === completedProfile.id);
    if (existingIndex >= 0) {
      updatedFields = fields.map((f, i) => (i === existingIndex ? completedProfile : f));
    } else if (fields.length === 1 && (!fields[0].isConfigured || !fields[0].hasCompletedOnboarding)) {
      updatedFields = [completedProfile];
    } else {
      const filtered = fields.filter((f) => f.id !== completedProfile.id);
      updatedFields = [completedProfile, ...filtered];
    }

    setFields(updatedFields);
    saveAllFields(updatedFields);
    setActiveFieldIdState(completedProfile.id);
    setActiveFieldId(completedProfile.id);

    setSelectedLat(completedProfile.latitude);
    setSelectedLon(completedProfile.longitude);

    const nearest = findNearestAgroRegion(completedProfile.latitude, completedProfile.longitude, AGRO_REGIONS);
    if (nearest) {
      setCurrentRegion(nearest);
    }

    setSoil((prev) => ({
      ...prev,
      texture: completedProfile.soilTexture,
      organicMatterPercent: completedProfile.soilOrganicMatter,
    }));
    setPriorities((prev) => ({
      ...prev,
      waterAccessType: completedProfile.irrigationMethod,
    }));
    setIsOnboardingOpen(false);
    setCurrentTab('field'); // Direct farmer to My Field where the profile is applied
  };

  const [isQuickLocating, setIsQuickLocating] = useState<boolean>(false);

  const handleQuickGpsSetup = async () => {
    setIsQuickLocating(true);
    try {
      const res = await getCurrentFarmLocation();
      if (res.latitude !== 0 && res.longitude !== 0 && !res.error) {
        const place = await getHumanReadableLocation(res.latitude, res.longitude, AGRO_REGIONS);
        const nearest = findNearestAgroRegion(res.latitude, res.longitude, AGRO_REGIONS);

        const configuredField: FarmerFieldProfile = {
          ...activeField,
          isConfigured: true,
          hasCompletedOnboarding: true,
          latitude: res.latitude,
          longitude: res.longitude,
          placeName: place,
          farmName: `${place.split(',')[0]} Farm`,
        };

        handleUpdateField(configuredField);
        setSelectedLat(res.latitude);
        setSelectedLon(res.longitude);
        if (nearest) {
          setCurrentRegion(nearest);
        }
        setIsOnboardingOpen(false);
      }
    } catch (err) {
      console.warn('Quick GPS locate error:', err);
    } finally {
      setIsQuickLocating(false);
    }
  };

  const handleLoadDemoFarm = (scenarioId?: string) => {
    const scenario =
      EVALUATION_SCENARIOS.find((s) => s.id === scenarioId) || EVALUATION_SCENARIOS[0];
    const demoField: FarmerFieldProfile = {
      ...activeField,
      ...scenario.profile,
    };
    handleUpdateField(demoField);
    setSelectedLat(demoField.latitude);
    setSelectedLon(demoField.longitude);
    setSoil((prev) => ({
      ...prev,
      texture: demoField.soilTexture,
      organicMatterPercent: demoField.soilOrganicMatter,
    }));
    setIsOnboardingOpen(false);
  };

  const handleSkipToDemo = (scenarioId?: string) => {
    handleLoadDemoFarm(scenarioId);
  };

  // State & Handler: Refresh NASA Satellite Observations Directly
  const [isRefreshingSatellite, setIsRefreshingSatellite] = useState<boolean>(false);

  const handleRefreshSatellite = async () => {
    setIsRefreshingSatellite(true);
    try {
      const res = await fetchNasaClimatology(selectedLat, selectedLon, true);
      setClimateData(res.data);
      setApiSource(res.source);
    } catch (err) {
      console.warn('Failed to refresh NASA satellite data:', err);
    } finally {
      setIsRefreshingSatellite(false);
    }
  };

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

  // Effect: Recalculate strategies when climate, soil, priorities, or activeField change
  useEffect(() => {
    const updated = generateCuratedStrategies(currentRegion, climateData, soil, priorities, activeField);
    setStrategies(updated);

    setActiveStrategy((current) => {
      if (current.archetype === 'climate_shield') {
        return updated.climateShield;
      } else if (current.archetype === 'balanced_profit') {
        return updated.balancedProfit;
      } else if (current.archetype === 'soil_builder') {
        return updated.soilBuilder;
      } else if (current.archetype === 'custom') {
        return current;
      } else {
        return updated.conventional;
      }
    });
  }, [currentRegion, climateData, soil, priorities, activeField]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-stone-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-24 transition-colors duration-200 dark:bg-[#0a0a0a] dark:text-stone-100 dark:selection:bg-emerald-950 dark:selection:text-emerald-300">
      {/* Top Mobile Application Header */}
      <Header
        locationName={`${activeField.farmName} • ${activeField.placeName || currentRegion.name.split(' (')[0]}`}
        isFieldConfigured={Boolean(activeField.isConfigured)}
        isPlayingBriefing={isPlayingBriefing}
        onToggleBriefing={handleToggleVoiceBriefing}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onNavigateToField={() => setCurrentTab('field')}
      />

      {/* Main Tabbed Container */}
      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-6">
        {/* TAB 1: HOME */}
        {currentTab === 'home' && (
          <FarmerHomeTab
            fields={fields}
            activeField={activeField}
            onSelectActiveField={handleSelectActiveField}
            onAddNewField={() => setCurrentTab('field')}
            region={currentRegion}
            climate={climateData}
            activeStrategy={activeStrategy}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenChatbot={() => setIsChatbotOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onQuickGpsSetup={handleQuickGpsSetup}
            isQuickLocating={isQuickLocating}
            onLoadDemoFarm={handleLoadDemoFarm}
            onRefreshSatelliteData={handleRefreshSatellite}
            isRefreshingSatellite={isRefreshingSatellite}
          />
        )}

        {/* TAB 2: MY FIELD */}
        {currentTab === 'field' && (
          <FarmerFieldTab
            fields={fields}
            activeField={activeField}
            region={currentRegion}
            allRegions={AGRO_REGIONS}
            soil={soil}
            priorities={priorities}
            activeStrategy={activeStrategy}
            climate={climateData}
            onSelectActiveField={handleSelectActiveField}
            onUpdateField={handleUpdateField}
            onAddNewField={handleAddNewField}
            onDeleteField={handleDeleteField}
            onUpdateSoil={setSoil}
            onUpdatePriorities={setPriorities}
            onSelectRegion={handleSelectRegion}
            onSelectCoordinates={(lat, lon) => {
              setSelectedLat(lat);
              setSelectedLon(lon);
            }}
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onNavigateToRotations={() => setCurrentTab('rotation')}
          />
        )}

        {/* TAB 3: CROP PLAN */}
        {currentTab === 'rotation' && (
          <StrategyComparison
            strategies={strategies}
            selectedStrategyId={activeStrategy.id}
            onSelectStrategy={(strat) => setActiveStrategy(strat)}
            activeField={activeField}
            fields={fields}
            onSelectActiveField={handleSelectActiveField}
            climate={climateData}
            soil={soil}
            region={currentRegion}
            onOpenCustomBuilder={() => setIsCustomBuilderOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {/* TAB 4: WEATHER FORECAST */}
        {currentTab === 'weather' && (
          <FarmerWeatherTab
            fields={fields}
            activeField={activeField}
            onSelectActiveField={handleSelectActiveField}
            region={currentRegion}
            climate={climateData}
            soil={soil}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenChatbot={() => setIsChatbotOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}

        {/* TAB 5: SETTINGS & GUIDES */}
        {currentTab === 'settings' && (
          <FarmerSettingsTab
            theme={theme}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            activeField={activeField}
            fields={fields}
            region={currentRegion}
          />
        )}
      </main>

      {/* Floating AI Field Assistant Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30">
        <button
          type="button"
          onClick={() => setIsChatbotOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-stone-200/90 bg-white/95 px-3.5 py-2.5 text-xs font-bold text-stone-900 shadow-lg backdrop-blur-md transition-all hover:bg-stone-50 hover:shadow-xl active:scale-95 dark:border-stone-800 dark:bg-stone-900/95 dark:text-stone-100 dark:hover:bg-stone-800"
          aria-label="Ask AI Field Assistant"
        >
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-white dark:bg-white dark:text-stone-900">
            <Bot className="h-3.5 w-3.5" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <span className="font-montserrat">Ask Field AI</span>
        </button>
      </div>

      {/* Fixed Bottom Navigation (Mobile Native Ergonomics - 3 Primary Workspaces) */}
      <BottomNavigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
      />

      {/* Omnipresent Field AI Chatbot */}
      <FieldAIChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        activeField={activeField}
        allFields={fields}
        onSelectActiveField={handleSelectActiveField}
        region={currentRegion}
        climate={climateData}
        soil={soil}
        activeStrategy={activeStrategy}
      />

      {/* Modals */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200/90 bg-[#fafafa] p-4 sm:p-6 shadow-2xl dark:border-stone-800 dark:bg-[#121212]">
            <div className="mb-4 flex items-center justify-between border-b border-stone-200/70 pb-3 dark:border-stone-800">
              <h2 className="font-brand text-lg font-bold text-stone-900 dark:text-stone-100">
                Farm Settings & Telemetry Guides
              </h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                aria-label="Close Settings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FarmerSettingsTab
              theme={theme}
              onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              activeField={activeField}
              fields={fields}
              region={currentRegion}
            />
          </div>
        </div>
      )}

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

      {/* First-Time Farmer Onboarding Wizard */}
      {isOnboardingOpen && (
        <OnboardingWizard
          currentRegion={currentRegion}
          allRegions={AGRO_REGIONS}
          initialLat={selectedLat}
          initialLon={selectedLon}
          initialSoil={soil}
          initialPriorities={priorities}
          onComplete={handleCompleteOnboarding}
          onSkipToDemo={handleSkipToDemo}
          onClose={() => setIsOnboardingOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
