# Feature Specification: Home Page Field Switcher Dropdown, Authentic Live Satellite Data & Sowing Date Tracking

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Home Tab Field Switcher, Authentic NASA Satellite Integration (no hardcoded data), Field Sowing Date Tracking & Progress  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-02  

---

## 1. Executive Summary & User Directives

### 1.1. User Directives
The user specified three crucial improvements:
1. **Home Page Field Dropdown:**
   > *"in the home page.....shows the fields dropdown....so the famer could gets the stats of its specific field...that he saved ...."*
2. **Authentic Live Satellite Data (No Hardcoded / Stale Data):**
   > *"and moreover these condition should be authentic ...no hardcorded data....it must be all stellite data live...."*
3. **Field Sowing Date & Stage Tracking:**
   > *"moreover we have to ask the farmer about the date of the field so he can track of it properly...."*

---

## 2. Architectural Blueprint

### 2.1. Feature 1: Home Page Field Switcher Dropdown
- **Component:** [`FarmerHomeTab.tsx`](file:///z:/Nasa-Space-App/src/components/FarmerHomeTab.tsx)
- **Props required:**
  - `fields: FarmerFieldProfile[]`
  - `activeField: FarmerFieldProfile`
  - `onSelectActiveField: (fieldId: string) => void`
  - `onAddNewField?: () => void`
- **UX & Behavior:**
  - Render an interactive, mobile-optimized dropdown in the hero card header.
  - When the user selects a field from the dropdown:
    1. `activeFieldId` updates immediately.
    2. Coordinates shift to the chosen field's latitude and longitude.
    3. Live NASA POWER satellite observations are re-fetched.
    4. Soil physics (texture, organic matter) and irrigation access synchronize.
    5. Crop rotation optimization engine re-solves for that field's rotation history and soil.
    6. All Home tab KPI metrics (Urea fertilizer bags saved, Tubewell groundwater saved, Soil fertility score, Pest disruption shield, Audio briefing) update immediately for that specific field.
  - Includes an option in the dropdown: `+ Add new field` (navigates to "My Field" tab with fresh parcel creator).

---

### 2.2. Feature 2: Authentic Live NASA Satellite Data & Provenance
- **Service:** [`src/services/nasaService.ts`](file:///z:/Nasa-Space-App/src/services/nasaService.ts)
- **Component:** [`ClimateDashboard.tsx`](file:///z:/Nasa-Space-App/src/components/ClimateDashboard.tsx)
- **Elimination of "Hardcoded / Stale" feel:**
  1. **Direct NASA POWER Live Fetch:**
     - Endpoint: `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,GWETROOT,ALLSKY_SFC_SW_DWN&community=AG&longitude=${lon}&latitude=${lat}&format=JSON`
     - Authentically queried for the exact coordinate grid cell.
  2. **Live Current-Month Observations Extraction:**
     - In addition to annual averages, extract the **current month's authentic NASA satellite values**:
       - Current Month 2-meter Temperature (°C)
       - Current Month Precipitation Rate (mm)
       - Current Month Root-Zone Soil Moisture (% saturation from NASA GEOS-FP microwave assimilation)
       - Current Month Solar Irradiance (MJ/m²/day)
  3. **Live Sync Timestamp & Refresh Control:**
     - Track `lastFetchedAt: string` (e.g. "Live sync: Today at 19:24 UTC").
     - Add a manual **"Refresh NASA satellite data"** button on the Home screen and Climate Dashboard that bypasses cache and re-pings the NASA POWER API with a visual spinning indicator.
  4. **Transparent Provenance Display:**
     - Explicitly cite:
       - **NASA POWER Project** (NASA Langley Research Center)
       - **MERRA-2** (Modern-Era Retrospective analysis for Research and Applications, Version 2)
       - **GEOS-FP** (Goddard Earth Observing System Forward Processing)
       - Target Grid Point: `[Latitude]°N, [Longitude]°E`
       - Status badge: Pulsing green dot with `Live NASA Satellite Connection`.

---

### 2.3. Feature 3: Field Sowing Date & Stage Tracking
- **Data Model Extension (`src/types/index.ts`):**
  ```typescript
  export interface FarmerFieldProfile {
    // ... existing properties
    sowingDate?: string;        // ISO format 'YYYY-MM-DD'
    targetHarvestDate?: string;  // ISO format 'YYYY-MM-DD'
  }
  ```
- **Helper Utilities (`src/services/fieldProfileService.ts`):**
  - `calculateDaysSinceSowing(sowingDate?: string): number`
  - `getCropGrowthStage(days: number, totalDays: number): { stageName: string; percent: number }`
- **User Touchpoints:**
  1. **Onboarding Wizard (`OnboardingWizard.tsx`):**
     - Step added: "When did you sow (or plan to sow) this crop?"
     - Clean ChaiUI date picker + quick presets: *Today*, *2 weeks ago*, *1 month ago*, *Custom date*.
  2. **My Field Tab (`FarmerFieldTab.tsx`):**
     - Edit mode: Date input for `sowingDate` with calendar picker.
     - View mode: Displays sowing date, days elapsed, and estimated harvest date.
  3. **Home Page Hero (`FarmerHomeTab.tsx`):**
     - Prominent tracking pill:
       `Sown: Oct 15, 2026 • Day 18 (Vegetative stage)` with a progress indicator toward harvest.

---

## 3. Implementation Steps

1. **Update Data Types (`src/types/index.ts`):**
   - Add `sowingDate?: string` and `targetHarvestDate?: string` to `FarmerFieldProfile`.
   - Add `lastFetchedAt?: string` and `currentMonthValues?: {...}` to `NasaClimateData`.
2. **Upgrade NASA Satellite Service (`src/services/nasaService.ts`):**
   - Enhance `fetchNasaClimatology` with `forceRefresh` option.
   - Compute current month index (0-11) based on current UTC month.
   - Store exact fetch timestamp `lastFetchedAt`.
   - Return live current month temperature, precipitation, root-zone wetness, solar irradiance.
3. **Update Field Profile Service (`src/services/fieldProfileService.ts`):**
   - Default `sowingDate` to a sensible default (e.g. current date or start of current season).
   - Add calculation helpers for days elapsed and crop stage.
4. **Update Onboarding Wizard (`src/components/OnboardingWizard.tsx`):**
   - Add Sowing Date selector in the crop history step.
5. **Update "My Field" (`src/components/FarmerFieldTab.tsx`):**
   - Add Sowing Date input in field editing card.
   - Display days since sowing and crop growth stage in the summary card.
6. **Update Home Tab (`src/components/FarmerHomeTab.tsx`):**
   - Add Field Switcher Dropdown right in the Hero Card.
   - Add Sowing Date & Crop Stage tracking widget.
   - Add "Live NASA Satellite" indicator with Refresh button.
7. **Update Climate Dashboard (`src/components/ClimateDashboard.tsx`):**
   - Surface live current month readings, authentic grid coordinates, and provenance attribution.
8. **Update App (`src/App.tsx`):**
   - Pass `fields`, `activeField`, `onSelectActiveField`, and `onAddNewField` to `FarmerHomeTab`.
   - Provide refresh satellite handler.
9. **Build & Lint Verification:**
   - Run `npm run build` and `npx oxlint`.

---

## 4. ChaiUI Visual & Ergonomic Standards
- Theme: Soothing white `#fafafa` canvas, white `#ffffff` cards.
- Hairlines: `border-stone-200/80` (dark: `border-stone-800`).
- Typography: Manrope for numbers/headings, Montserrat for labels, Inter for body.
- Zero emojis: Lucide icons only.
