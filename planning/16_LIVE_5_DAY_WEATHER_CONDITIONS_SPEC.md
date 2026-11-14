# Feature Specification: Live 5-Day Field Weather Conditions Section

> **Specification Status:** Implemented & Verified  
> **Target Scope:** High-level 5-Day live agricultural weather conditions section (`FieldWeatherConditions.tsx`, `weatherService.ts`), integrated into `FarmerHomeTab.tsx` and dynamically synced with the active field's coordinates.  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`, `#ffffff` Cards)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary & User Directives

### 1.1. User Directive
> *"now we need one more section....which is wheather conditions....and high level wheather conditions of the farmer.....about 5 days..."*

### 1.2. Problem & Value Proposition
1. **From Climatology to Real-Time Operational Decision Making:**
   While the existing NASA POWER Climatology provides indispensable multi-year monthly baseline patterns (annual rainfall, thermal curves, historical drought probability), farmers need day-to-day weather conditions for tactical operations:
   - Should I irrigate my field today or wait for rain tomorrow?
   - Is wind speed calm enough for foliar spray / pesticide application without drift?
   - What is today's crop evapotranspiration (ET0) water loss?
2. **5-Day High-Level Field Grounding:**
   The 5-day forecast must be explicitly resolved for the farmer's active field coordinates (`activeField.latitude`, `activeField.longitude`), updating instantly when they switch fields.
3. **Authentic Live Data (Zero Hardcoded Placeholders):**
   Powered by Open-Meteo's high-resolution global agricultural forecast API (WMO standardized, real-time hourly and daily assimilations), with graceful caching and offline fallbacks.

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│             Active Field (GPS Lat / Lon)               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│      src/services/weatherService.ts                    │
│  - fetchField5DayWeather(lat, lon, forceRefresh)       │
│  - Open-Meteo High-Resolution Agricultural API         │
│  - WMO weather code to condition & Lucide icon mapping │
│  - In-memory & localStorage coordinate caching         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│      src/components/FieldWeatherConditions.tsx         │
│  1. Current Weather Snapshot Bar                       │
│     (Temp, Humidity, Wind, Daily FAO-56 ET0, Rain %)   │
│  2. 5-Day Forecast Grid                                │
│     (Day, Date, WMO Icon, Max/Min °C, Rain mm/%, Tag)  │
│  3. 5-Day Agricultural Operational Advisory            │
│     (Spraying window, Tubewell scheduling, Heat/Wind)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│      src/components/FarmerHomeTab.tsx                  │
│  - Rendered as dedicated section on Home dashboard     │
│  - Synced with active field selector                   │
└────────────────────────────────────────────────────────┘
```

---

## 3. Detailed UI/UX Specifications (ChaiUI Look)

- **Container:** Dedicated card in `FarmerHomeTab.tsx` with `#ffffff` background (dark: `#0f0f0f`), `border-stone-200/80` warm hairline.
- **Section Header:**
  - Left: `CloudSun` icon + Title: **"5-day field weather conditions"**.
  - Right: Active field coordinates (`Lat°, Lon°`) + Live badge + Refresh button.
- **Current Conditions Snapshot:**
  - 4 clean metric pills:
    1. **Live Temperature:** Current temperature °C with WMO condition text.
    2. **Relative Humidity:** Current air humidity (%).
    3. **Wind Speed:** 10m surface wind speed (km/h) with spray safety classification.
    4. **Daily ET0 Evapotranspiration:** FAO-56 reference crop water loss (mm/day).
- **5-Day Forecast Cards:**
  - 5 responsive columns (horizontal scroll on small screens, 5-col grid on tablet/desktop):
    - **Header:** Day name ("Today", "Mon", "Tue", "Wed", "Thu") + Date ("Nov 4").
    - **Visual:** WMO condition icon (`Sun`, `CloudSun`, `CloudRain`, `Cloud`, `Wind`, `CloudDrizzle`).
    - **Thermal:** Bold Max Temp °C / subtle Min Temp °C.
    - **Precipitation:** Rain volume (mm) + Probability badge (%).
    - **Farm Action Pill:** Short agronomic recommendation:
      - `Spraying Safe` (Wind < 12 km/h, Rain = 0%)
      - `Rain Alert: Delay Irrigation` (Rain > 2mm or Prob > 45%)
      - `High Evaporation` (ET0 > 4.5 mm/day)
- **High-Level 5-Day Summary Banner:**
  - Highlight phrase summarizing the 5-day outlook:
    e.g., *"5-day outlook: Dry conditions through Thursday, 12mm rain expected Friday. Optimal 4-day window for field operations and fertilization."*

---

## 4. Verification Plan

1. **TypeScript Build:** `npm run build` must compile cleanly with 0 errors.
2. **Linter Check:** `npx oxlint` must report 0 errors.
3. **Live Sync:** Switching active fields must automatically re-fetch the 5-day forecast for the new coordinates.
4. **Offline Resilience:** Graceful fallback if network is unreachable.
