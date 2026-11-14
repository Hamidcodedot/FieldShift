import React, { useState, useMemo } from 'react';
import {
  Pencil,
  Check,
  X,
  Sun,
  Moon,
  Satellite,
  Compass,
  Sprout,
  CloudSun,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Shield,
  Database,
  Lock,
  Info,
} from 'lucide-react';
import { FarmerFieldProfile, AgroRegion } from '../types';

interface FarmerSettingsTabProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeField: FarmerFieldProfile;
  fields?: FarmerFieldProfile[];
  region?: AgroRegion;
}

export const FarmerSettingsTab: React.FC<FarmerSettingsTabProps> = ({
  theme,
  onToggleTheme,
  activeField,
  fields,
}) => {
  // Username State (Persistent via localStorage)
  const [userName, setUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('fieldshift_farmer_name') || 'Hamid Shahid';
    } catch {
      return 'Hamid Shahid';
    }
  });
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(userName);

  // Total registered acres across all farm parcels
  const totalRegisteredAcres = useMemo(() => {
    if (fields && fields.length > 0) {
      const sum = fields.reduce((acc, f) => acc + (f.fieldSizeAcres || 0), 0);
      return Number(sum.toFixed(1));
    }
    return activeField.fieldSizeAcres || 5.2;
  }, [fields, activeField.fieldSizeAcres]);

  // Guide Accordion State
  const [expandedGuide, setExpandedGuide] = useState<string | null>('guide-telemetry');

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed.length > 0) {
      setUserName(trimmed);
      try {
        localStorage.setItem('fieldshift_farmer_name', trimmed);
      } catch (e) {
        console.warn('Failed to save farmer name', e);
      }
    }
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setTempName(userName);
    setIsEditingName(false);
  };

  const toggleGuide = (id: string) => {
    setExpandedGuide((prev) => (prev === id ? null : id));
  };

  const guides = [
    {
      id: 'guide-telemetry',
      title: 'How NASA Earth Observations Guide Your Farm',
      icon: <Satellite className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      tag: 'Satellite Telemetry',
      summary:
        'FieldShift ingests spaceborne atmospheric and soil measurements from NASA satellites directly to your parcel coordinates.',
      points: [
        'NASA POWER (Prediction of Worldwide Energy Resources): Provides daily solar irradiance, relative humidity, and surface air temperature calibrated to your GPS coordinates.',
        'NASA MERRA-2: Global climate reanalysis assimilating satellite observations to calculate 30-year precipitation patterns and drought likelihood.',
        'GEOS-FP (0-100cm Root Wetness): Senses soil moisture saturation at root zone depth, warning you of subsoil water deficit before crops begin to wilt.',
      ],
    },
    {
      id: 'guide-mapping',
      title: 'Drawing Your Field Boundary & 20x Zoom Lock',
      icon: <Compass className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
      tag: 'Field Mapping',
      summary:
        'Accurately outline your agricultural land parcel using high-resolution Esri satellite imagery.',
      points: [
        'Auto GPS Detection: Tap "Locate my field" to instantly focus the satellite map on your mobile device\'s physical position.',
        'Draw Boundary Mode: Tap each corner of your field perimeter. The engine automatically calculates acreage and exact parcel acreage.',
        'Max Zoom Lock (20x): In agricultural and rural zones, satellite imagery is digitally overscaled up to zoom 20 to ensure maximum sub-meter farm detail while preventing missing map tiles.',
      ],
    },
    {
      id: 'guide-nitrogen',
      title: 'Biological Nitrogen Fixation & Urea Savings',
      icon: <Sprout className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a56?auto=format&fit=crop&w=600&q=80',
      tag: 'Agronomic Science',
      summary:
        'Leguminous pulses fix atmospheric nitrogen symbiotically, dramatically slashing synthetic fertilizer costs.',
      points: [
        'Rhizobium Symbiosis: Legumes (Chickpea, Moong, Cowpea) form root nodules that convert atmospheric N2 into plant-available ammonium.',
        'Urea Bag Reductions: Every 46 kg of biological nitrogen left in the root zone replaces an entire 50 kg commercial bag of synthetic urea.',
        'Pest & Pathogen Break: Rotating cereals with non-cereal botanical families (Fabaceae, Brassicaceae) breaks fungal spore lifecycles and nematode multiplication.',
      ],
    },
    {
      id: 'guide-weather',
      title: '5-Day Agricultural Weather & Spray Windows',
      icon: <CloudSun className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />,
      imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80',
      tag: 'Weather Forecast',
      summary:
        'Check hourly humidity, wind gusts, and precipitation to schedule farm operations safely.',
      points: [
        'Optimal Spray Windows: Pesticides and foliar fertilizers must only be sprayed when wind speeds are under 15 km/h and rain probability is below 20%.',
        'Dew Point & Fungal Risk: Prolonged high leaf wetness with moderate temperatures triggers foliar rust and blight spores.',
        'Heat & Frost Protection: Real-time temperature alerts warn of frost nights and extreme heatwaves during crop flowering.',
      ],
    },
  ];

  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'FS';

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* 1. Farmer Profile Card */}
      <div className="card-chai p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Visual Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:border-emerald-700/40 dark:bg-emerald-950/70 dark:text-emerald-300 font-montserrat text-sm font-bold shadow-xs shrink-0">
              {initials}
            </div>

            <div className="min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={32}
                    className="h-8 rounded-md border border-stone-300 bg-white px-2 font-montserrat text-xs font-semibold text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                    placeholder="Enter farmer name"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-900 text-white hover:bg-black active:scale-95 dark:bg-white dark:text-stone-900"
                    title="Save name"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelName}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                    title="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-montserrat text-base font-bold text-stone-900 dark:text-stone-100 break-words">
                    {userName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(userName);
                      setIsEditingName(true);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 active:scale-95 dark:text-stone-500 dark:hover:text-stone-300 dark:hover:bg-stone-800"
                    title="Edit farmer username"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              )}
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Lead Farm Operator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="rounded-md border border-stone-200/80 bg-stone-50 px-2.5 py-1 font-montserrat text-[11px] font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300">
              {totalRegisteredAcres} acres registered
            </span>
          </div>
        </div>
      </div>

      {/* 2. Appearance & Theme Selection */}
      <div className="card-chai p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-stone-200/70 pb-3 mb-3.5 dark:border-stone-800">
          <div>
            <h3 className="font-montserrat text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
              Display & Theme
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Customize app contrast and styling for bright field sunlight or night usage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Light Theme Card */}
          <button
            type="button"
            onClick={() => {
              if (theme !== 'light') onToggleTheme();
            }}
            className={`flex items-center justify-between rounded-xl border p-3 text-start transition active:scale-98 ${
              theme === 'light'
                ? 'border-stone-900 bg-stone-100/90 dark:border-stone-100 ring-1 ring-stone-900/20'
                : 'border-stone-200/80 bg-stone-50/50 hover:bg-stone-100/60 dark:border-stone-800 dark:bg-stone-900/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-900 shadow-xs">
                <Sun className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 block">
                  Light Mode
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                  High sunlight contrast
                </span>
              </div>
            </div>
            {theme === 'light' && <Check className="h-4 w-4 text-stone-900 dark:text-stone-100" />}
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            onClick={() => {
              if (theme !== 'dark') onToggleTheme();
            }}
            className={`flex items-center justify-between rounded-xl border p-3 text-start transition active:scale-98 ${
              theme === 'dark'
                ? 'border-stone-900 bg-stone-100/90 dark:border-stone-100 dark:bg-stone-900 ring-1 ring-stone-900/20'
                : 'border-stone-200/80 bg-stone-50/50 hover:bg-stone-100/60 dark:border-stone-800 dark:bg-stone-900/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-700 bg-stone-950 text-stone-100 shadow-xs">
                <Moon className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <span className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 block">
                  Midnight Dark
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                  Low light & battery saving
                </span>
              </div>
            </div>
            {theme === 'dark' && <Check className="h-4 w-4 text-stone-900 dark:text-stone-100" />}
          </button>
        </div>
      </div>

      {/* 3. Illustrated Farmer Guides & Educational Knowledge Base */}
      <div className="card-chai p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-stone-200/70 pb-3 mb-3.5 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <h3 className="font-montserrat text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
              Farmer Guides & Science Explanations
            </h3>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {guides.length} Guides
          </span>
        </div>

        <div className="space-y-3">
          {guides.map((g) => {
            const isOpen = expandedGuide === g.id;

            return (
              <div
                key={g.id}
                className="overflow-hidden rounded-xl border border-stone-200/80 bg-stone-50/60 transition dark:border-stone-800 dark:bg-stone-900/40"
              >
                {/* Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleGuide(g.id)}
                  className="w-full flex items-center justify-between p-3.5 text-start transition hover:bg-stone-100/60 dark:hover:bg-stone-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white shadow-xs dark:border-stone-700 dark:bg-stone-800 shrink-0">
                      {g.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="rounded bg-stone-200/70 px-1.5 py-0.2 text-[9px] font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300 mb-0.5 inline-block">
                        {g.tag}
                      </span>
                      <h4 className="font-montserrat text-xs font-bold text-stone-900 dark:text-stone-100 leading-snug">
                        {g.title}
                      </h4>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-stone-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-stone-500 shrink-0" />
                  )}
                </button>

                {/* Expanded Details with Visualization Image */}
                {isOpen && (
                  <div className="border-t border-stone-200/70 p-3.5 dark:border-stone-800 space-y-3 bg-white/50 dark:bg-stone-950/30">
                    {/* Visual Banner Image */}
                    <div className="relative h-32 w-full overflow-hidden rounded-lg border border-stone-200 dark:border-stone-800">
                      <img
                        src={g.imageUrl}
                        alt={g.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[11px] font-medium text-white/90 drop-shadow-sm">
                          {g.summary}
                        </span>
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                      {g.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Privacy Policy & Local-First Guarantees */}
      <div className="card-chai p-4 sm:p-5">
        <div className="flex items-center gap-2 border-b border-stone-200/70 pb-3 mb-3.5 dark:border-stone-800">
          <Shield className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <h3 className="font-montserrat text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
            Privacy Policy & Offline Storage
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
            <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-100 font-montserrat text-xs font-semibold">
              <Database className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>100% On-Device Data</span>
            </div>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Your field boundaries, crop history, and farm settings are stored exclusively in your browser/device localStorage.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
            <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-100 font-montserrat text-xs font-semibold">
              <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Zero Tracking or Ads</span>
            </div>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              No tracking pixels, third-party analytics, or commercial advertising libraries are installed.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-900/40">
            <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-100 font-montserrat text-xs font-semibold">
              <Satellite className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Anonymous Queries</span>
            </div>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              Satellite weather calls query public NASA POWER endpoints anonymously without transmitting device IDs or personal names.
            </p>
          </div>
        </div>
      </div>

      {/* 5. About FieldShift */}
      <div className="card-chai p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-stone-200/70 pb-3 mb-3.5 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-stone-700 dark:text-stone-300 shrink-0" />
            <h3 className="font-montserrat text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
              About FieldShift
            </h3>
          </div>
          <span className="font-mono text-[10px] text-stone-500 dark:text-stone-400">
            v2.4.0 (Build 2026.11)
          </span>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          FieldShift is an open-access precision agro-ecological decision support platform developed for the{' '}
          <strong className="text-stone-900 dark:text-stone-100 font-semibold">
            NASA International Space Apps Challenge
          </strong>
          . Its mission is to empower smallholder farmers worldwide with spaceborne Earth observation telemetry to restore soil biology, replenish groundwater reserves, and optimize agricultural livelihoods.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800/80">
          <span>Data sources:</span>
          <span className="font-medium text-stone-700 dark:text-stone-300">NASA POWER</span>
          <span>•</span>
          <span className="font-medium text-stone-700 dark:text-stone-300">NASA MERRA-2</span>
          <span>•</span>
          <span className="font-medium text-stone-700 dark:text-stone-300">Open-Meteo</span>
          <span>•</span>
          <span className="font-medium text-stone-700 dark:text-stone-300">Esri World Imagery</span>
        </div>
      </div>
    </div>
  );
};

export default FarmerSettingsTab;
