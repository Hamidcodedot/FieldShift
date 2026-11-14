# Specification: Zero-Scroll Mobile Onboarding & Field Tab Dropdown Optimization

## 1. Context & Motivation
Following mobile UX evaluation and field usability reviews:
1. **Onboarding Form Friction & Scroll Trap**: On mobile viewports (<640px height), multi-step wizards with vertical forms caused screen overflow and difficult navigation. Farmers required a seamless, zero-scroll experience where each step fits inside the phone display (`h-[92dvh] max-h-[640px] overflow-hidden`).
2. **Diagnostic Calibration vs. Survey Fatigue**: Farmers abandoned complex agronomic data entry forms. Instead, a **"Satellite-First + 3-Tap Calibration"** flow proves intelligent observation first (displaying real NASA microwave root moisture and precipitation) before asking for 3 simple inputs (standing crop & sowing stage, urea application tier, and pesticide frequency).
3. **"My Field" Space Optimization**: In `FarmerFieldTab`, large multi-card parcel grids forced farmers to scroll past multiple screens just to reach the satellite map and boundary drawer. The user requested:
   > *"all the field should show in the dropdown..... bcs you know in the mobile space is limited...so we hhave to make sure that farmer got the core things in front...he doesnt have to scroll that much...."*

---

## 2. Technical Architecture & Changes

### A. Satellite-Grounded Soil Health Diagnostic Engine ([`src/services/soilHealthDiagnostic.ts`](file:///z:/Nasa-Space-App/src/services/soilHealthDiagnostic.ts))
Created an agronomic diagnostic module that models soil health from satellite telemetry and farmer inputs:
- **NASA Telemetry Inputs**:
  - `rootMoisturePercent`: Live microwave radiometer root saturation (NASA GEOS-FP `GWETROOT`, depth 0–100 cm).
  - `annualPrecipitation`: NASA POWER 40-year climatological average.
  - `soilTexture`: Baseline cation exchange and water holding capacity (Loam: 80 base / Clay: 72 base / Sandy Loam: 68 base).
- **Farmer Calibration Adjustments**:
  - `ureaIntensity`:
    - `low` (0–1 bags/ac): +6 points; minimal acidification risk; natural soil biology preserved.
    - `moderate` (2–3 bags/ac): Standard baseline; minor leaching risk.
    - `heavy` (4+ bags/ac): -16 points; **Critical Acidification Risk**; free ammonium shock.
  - `pesticideFrequency`:
    - `none` (0 sprays): +6 points; active mycorrhizal fungal biodiversity.
    - `moderate` (1–2 sprays): Standard baseline.
    - `intensive` (3+ sprays): -12 points; biological rhizobia suppression.
  - `irrigationMethod`: Drip (+6), Groundwater (-2 salinity risk), Rainfed (deficit vulnerability).
  - `currentCropId`: Legume bio-fixation (+8) vs. Puddled rice hardpan (-4).
- **Output Parameters**:
  - Composite `score` (0–100) and `rating` ('Optimal', 'Fair', 'Vulnerable / Acidified').
  - `rootMoistureLabel` & status ('Deficit', 'Optimal', 'Saturated').
  - `acidificationRisk` ('Low', 'Moderate', 'Critical').
  - `microbialActivity` ('Active & Diverse', 'Moderate', 'Suppressed').
  - `trustIndicators`: Ground-truthed NASA citations proving the origin of every metric.
  - `actionableInsight`: Specific crop transition recommendation (e.g. chickpea or summer moong).

### B. Zero-Scroll Mobile Onboarding Wizard ([`src/components/OnboardingWizard.tsx`](file:///z:/Nasa-Space-App/src/components/OnboardingWizard.tsx))
Overhauled the wizard to strictly fit mobile screen viewports without vertical scrolling:
- **Modal Viewport Budget**:
  - Container locked to `h-[92dvh] max-h-[640px] flex flex-col justify-between overflow-hidden`.
  - Stepper indicator (4 steps) with top-right close button.
- **4-Step Flow**:
  - **Step 0: Welcome Screen**: Compact value proposition (Satellite Radar, Save 6–8 urea bags, Disease break) + 1-tap "Start quick field setup".
  - **Step 1: Satellite Detection & Pinning**:
    - 1-Tap "Locate My Field (Auto GPS)" button using browser/Android geolocation.
    - Live Telemetry Readout Card: Real-time village/district name, coordinates, NASA GEOS-FP root wetness (%), annual rainfall, and soil texture. Builds farmer trust *before* asking questions.
  - **Step 2: Standing Crop & Sowing Stage**:
    - 6 Photographic Crop Chips (Wheat, Rice Paddy, Cotton, Maize, Chickpea, Mustard) rendered with real agricultural photography via `getCropImageUrl()`.
    - 4 Discrete Sowing Stage Pills: `<30d (Emergence)`, `30–60d (Vegetative)`, `60–90d (Flowering)`, `>90d (Maturing)`.
  - **Step 3: Field Management & Inputs (3 Taps)**:
    - Urea Applied: `0–1 Bag (Low/Basal)`, `2–3 Bags (Standard)`, `4+ Bags (Acidifying)`.
    - Pesticide Sprays: `0 Sprays (Bio-active)`, `1–2 Sprays (Targeted)`, `3+ Sprays (Intensive)`.
    - Water Source: `Canal`, `Tubewell`, `Rainfed`.
  - **Step 4: Soil Health Diagnostic & Activation**:
    - Instant Soil Health Gauge (0–100, Optimal / Fair / Vulnerable badge).
    - 3 Telemetry Badges (Root Saturation, Urea Acidification, Microbial Activity).
    - Biological shift recommendation.
    - Transparent "Why you can trust this advisory" indicators.
    - Primary CTA: **"Activate Field & View Advisory"**.

### C. "My Field" Tab Space Optimization ([`src/components/FarmerFieldTab.tsx`](file:///z:/Nasa-Space-App/src/components/FarmerFieldTab.tsx))
Optimized for mobile ergonomics:
- **Field Dropdown Switcher**:
  - Replaced bulky multi-card parcel grid with a compact top dropdown button matching the Home and Weather tabs (`max-w-[130px] sm:max-w-[180px] truncate`).
  - Dropdown popover lists all fields with active badge, acreage, soil type, and quick parcel deletion.
  - "+ Add Field" button and "Edit Field" button easily accessible in the top header.
- **Core Things Front & Center**:
  - **Compact Parcel Snapshot Strip**: Standing crop photo thumbnail, growth stage, acreage, boundary status, and soil diagnostic score.
  - **Satellite Map & Boundary Drawer (`MapSelector`)**: Positioned directly below the snapshot strip, immediately accessible with **zero scrolling required**.
- **Collapsible Secondary Details**:
  - Comprehensive Soil Health Diagnostic, root water capacity, urea balance, and rotation history tucked into a smooth collapsible card (`setShowSecondaryDetails`), keeping mobile view uncluttered.

---

## 3. Verification & Build
- TypeScript compilation (`tsc -b`) and Vite production bundle: **Passed with zero errors**.
- Capacitor Android Web Assets synced (`npx cap sync android`).
- Android Debug APK built with Gradle (OpenJDK 21): [`FieldShift-debug.apk`](file:///z:/Nasa-Space-App/FieldShift-debug.apk).
