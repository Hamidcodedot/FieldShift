# Feature Specification: Onboarding Dismissal ("X") and "Awaiting Field Setup" Guided State

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Onboarding Wizard Dismissal (`OnboardingWizard.tsx`), Unconfigured Field State Management (`App.tsx`, `fieldProfileService.ts`), Guided Empty States across Home (`FarmerHomeTab.tsx`), Weather (`FarmerWeatherTab.tsx`), Crop Rotation (`StrategyComparison.tsx`), and Map Handoff (`FarmerFieldTab.tsx`).  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`, `#ffffff` Cards)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary & User Directives

### 1.1. User Directive
> *"in the on boarding procedure ....some advancements needed.... which are ...a cross to close the onboarding...(now i need suggestion after closing the onboarding.....which thing will shown to the user..... showing data of random farm or location is not a good impression....we need some professional path....) dont change anything yet"*  
> *"i will go for path 1, implement it"*

### 1.2. The Problem
When a farmer closes or skips the onboarding wizard without completing field setup:
1. **Misleading Stale/Random Data:** Displaying random mock coordinates or a preset regional farm (e.g. *Multan District* or *Indo-Gangetic*) gives the impression that the app is hallucinating or hardcoded, risking farmer distrust.
2. **Missing Escape Hatch:** The onboarding wizard previously lacked a dedicated close button (`X`), locking the user into either completing 6 steps or hunting for a skip button.
3. **Professional Expectation:** Precision AgTech applications (e.g. Climate FieldView, OneSoil, Sentera) present a clear "Field Setup Required / Awaiting Coordinates" guided experience that clearly explains *why* satellite telemetry is withheld until the field is located.

---

## 2. Technical Solution (Path 1)

### 2.1. Dedicated Close (`X`) Button in Onboarding Wizard (`OnboardingWizard.tsx`)
- Add an accessible, fixed close button in the top-right corner of the modal header:
  - Icon: `<X className="h-5 w-5" />`
  - Touch target: Min 40x40px, ChaiUI styled (`text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition`).
  - Action: Invokes `onClose()`.
  - Behavior: Closes modal cleanly and safely saves an unconfigured draft state without overwriting existing data.

### 2.2. Unconfigured Field State Detection & Header Status
- A field is unconfigured when:
  `!activeField.isConfigured || !activeField.hasCompletedOnboarding`
- In `Header.tsx`:
  - When unconfigured, display an amber/neutral badge:
    - Dot: `bg-amber-500` (pulsing or static)
    - Label: `No field linked • Tap to setup`
    - Action: Tapping opens the Onboarding Wizard or navigates directly to `My Field`.

### 2.3. Home Tab Guided Empty State (`FarmerHomeTab.tsx`)
When `!activeField.isConfigured`:
- Render an **"Awaiting Field Setup"** Hero Card:
  - **Badge:** `NASA Earth Telemetry Offline`
  - **Headline:** *"Connect your farm parcel to unlock live satellite intelligence"*
  - **Description:** *"FieldShift queries NASA POWER climatology, GPM precipitation, and SMAP soil moisture based on your exact farm boundary. Once pinpointed, you will receive authenticated 5-day weather, root-zone wetness, and optimal crop rotation recommendations."*
  - **Action Controls:**
    - Primary CTA: `[Set Up My Field (Wizard)]` (opens `OnboardingWizard`).
    - Quick Action: `[Locate via GPS]` (runs 1-tap browser geolocation to instantly lock in coordinates and activate the field).
    - Map Action: `[Pinpoint on Map]` (switches tab to `field`).
- **Placeholder Telemetry Previews:**
  - Replace fake numbers with elegant, dashed ChaiUI preview skeletons:
    - Climatology Preview: *"NASA Climatology (Awaiting GPS)"*
    - 5-Day Weather Preview: *"High-resolution 5-day forecast will calibrate to your coordinates"*
    - Crop Stage Tracker: *"Sowing date & crop progress requires field configuration"*

### 2.4. Weather Tab Guided Empty State (`FarmerWeatherTab.tsx`)
When `!activeField.isConfigured`:
- Show a clean, professional banner:
  - **Headline:** *"Weather Forecast Offline — Field Location Required"*
  - **Explanation:** *"5-day agricultural weather, evapotranspiration (ET0), and field spraying safety windows are computed for specific farm parcels. Link your field to activate live forecasts."*
  - **Button:** `[Locate My Field (GPS)]` and `[Draw Field Boundary]`.

### 2.5. Crop Rotation Tab Guided State (`StrategyComparison.tsx`)
When `!activeField.isConfigured`:
- Display an informative ChaiUI callout:
  - **Headline:** *"Rotation Solver Awaiting Farm Parameters"*
  - **Explanation:** *"Crop rotation solutions rely on your soil texture, water source, and recent standing crops. Set up your field to calculate soil-building, water-saving, and high-profit rotations."*
  - **Button:** `[Complete Field Setup]`.

### 2.6. My Field Tab Direct Handoff (`FarmerFieldTab.tsx`)
When `!activeField.isConfigured`:
- Display a floating top banner over the satellite map:
  - *"Welcome to FieldShift. Pinpoint your farm pin or draw your boundary to activate satellite telemetry."*
- Saving a boundary or dropping a pin immediately flags `isConfigured: true`, unlocking all tabs.

---

## 3. Verification Plan
1. **TypeScript Build:** `npm run build` must compile with 0 errors.
2. **Linter Check:** `npx oxlint` must report 0 errors.
3. **Interaction Flow:**
   - Launch app on clean state -> Onboarding wizard displays.
   - Tap `X` (close button) in top right.
   - Wizard smoothly closes.
   - Verify Home page shows the clean "Awaiting Field Setup" hero state, with NO fake/random farm data.
   - Verify Header shows "No field linked • Tap to setup".
   - Verify Weather and Crop Rotation tabs show clean placeholders with CTAs.
   - Tap "Set Up My Field" or "Locate via GPS" -> verify field activates properly with live data.
