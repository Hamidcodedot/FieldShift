# Feature Specification: Dedicated Field Weather Forecast Page

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Dedicated Weather Forecast Tab (`FarmerWeatherTab.tsx`) in the bottom navigation bar beside Crop Rotation, grounded in exact field coordinates, live Open-Meteo & NASA atmospheric data, and operational farm guidance.  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`, `#ffffff` Cards)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary & User Directives

### 1.1. User Directive
> *"convert the wheather forecast into new proper page....in the bottom bar...besides crop rotation....
and wheather forecast will be according to field and precise location...."*

### 1.2. Problem & Value Proposition
1. **Dedicated Workspace for Meteorological Intelligence:**
   Rather than confining weather data to a subsection on the Home tab, the farmer gets a full, dedicated **Weather** page in the bottom navigation bar alongside `Crop Rotation`.
2. **Precise Field Location Grounding:**
   Weather is computed strictly for the active field's exact latitude and longitude (calibrated down to the meter from GPS or drawn polygon centroid), with an in-page field selector to switch between multiple fields.
3. **Actionable Agricultural Decision Making:**
   Provides not just raw weather forecasts, but high-level agronomic advisories:
   - **Spraying windows:** Calm wind thresholds (< 12 km/h) with zero rain risk for pesticide/fertilizer applications.
   - **Tubewell & Irrigation scheduling:** Rain probability & volume over the next 5 days compared against FAO-56 crop evapotranspiration (ET0) to save groundwater pumping.
   - **Crop Heat & Cold Stress:** Flags temperatures nearing critical reproductive sterility thresholds.

---

## 2. Navigation Architecture

Bottom Navigation bar structure:
```
┌────────────────────────────────────────────────────────┐
│                      Bottom Bar                        │
│  [ Home ]    [ My Field ]    [ Crop Rotation ]    [ Weather ]  │
└────────────────────────────────────────────────────────┘
```

- **Tab ID:** `'weather'`
- **Icon:** `<CloudSun className="h-4.5 w-4.5" />`
- **Label:** `Weather`
- **Route / State:** `currentTab === 'weather'` in `App.tsx`

---

## 3. Dedicated Page Architecture (`FarmerWeatherTab.tsx`)

```
┌────────────────────────────────────────────────────────┐
│  Field Selector & Exact Coordinate Header               │
│  - Field Switcher Dropdown                             │
│  - Exact Lat/Lon (4 decimals)                          │
│  - Standing crop & soil texture context                │
│  - Live NASA / Open-Meteo API status + Refresh         │
├────────────────────────────────────────────────────────┤
│  Today's Real-Time Meteorological Snapshot             │
│  - 4 Key Metrics: Temp, Humidity, Wind, Daily ET0      │
│  - Spray drift safety classification                   │
├────────────────────────────────────────────────────────┤
│  5-Day High-Level Field Forecast Cards                 │
│  - Today, Day 2, Day 3, Day 4, Day 5                   │
│  - Max/Min Temp, Rain %, Rain mm, Wind, ET0           │
│  - Action Badge: Spray Safe, Delay Irrigation, etc.    │
├────────────────────────────────────────────────────────┤
│  5-Day Farm Operational Agronomic Windows              │
│  - Spraying Window, Tubewell Conservation, Heat Risk   │
├────────────────────────────────────────────────────────┤
│  NASA Earth Observations Root-Zone & Climatology       │
│  - Satellite microwave root-zone wetness %             │
│  - Solar irradiance & annual rainfall benchmark        │
└────────────────────────────────────────────────────────┘
```

---

## 4. UI/UX Specifications (ChaiUI Look)

- **Canvas:** `#fafafa` warm stone background in light mode, `#0a0a0a` in dark mode.
- **Card Surfaces:** Flat `#ffffff` in light mode, `#0f0f0f` in dark mode.
- **Borders:** Warm 1px hairline `border-stone-200/80` (dark: `border-stone-800`).
- **Typography:** Manrope for headers and numbers; Montserrat for badges and field labels.
- **Buttons:** Asymmetric corners (`btn-asym`, `btn-asym-mirror`).
- **Zero Emojis:** Lucide icons only (`CloudSun`, `Sun`, `CloudRain`, `Wind`, `Droplets`, `Thermometer`, `Gauge`, `MapPin`, `CheckCircle2`, `AlertTriangle`).

---

## 5. Verification Plan

1. **Build Verification:** `npm run build` must succeed with 0 errors.
2. **Lint Verification:** `npx oxlint` must report 0 errors.
3. **Field Synchronization:** Switching active field on the Weather page must update forecast coordinates and data immediately.
4. **Bottom Bar Navigation:** Seamless switching between Home, Field, Rotation, and Weather.
