# Specification: Operational Crop Rotation Calendar & Duration Tracker

## 1. Context & Motivation
While the engine computes optimal multi-year crop sequences to regenerate soil nitrogen and conserve aquifer water, farmers specifically required **precise operational timing**:
> *"one more feature to add is calender..... we are recommending the crop rotation but during in which duration....so add proper calender.... give the suggestions first"*

Farmers need to know:
1. **Exact Sowing & Harvest Windows**: The precise calendar dates to sow and harvest each crop.
2. **Turn-Around Buffers**: A built-in 10–14 day buffer for stubble management, rauni pre-irrigation, and seedbed preparation.
3. **NASA Climatology Alignment**: Ensuring sowing dates avoid extreme summer heat spikes (terminal heat stress) and that harvesting finishes before monsoon downpours arrive.
4. **Visual 12-Month Continuous Timeline**: A continuous visual representation showing current standing crop progress with a "Today" marker alongside subsequent planned crops.

---

## 2. Technical Architecture & Implementation

### A. Calendar & Duration Calculation Engine ([`src/services/cropCalendarService.ts`](file:///z:/Nasa-Space-App/src/services/cropCalendarService.ts))
Calculates authentic operational dates from the farmer's standing crop sowing date and agronomic crop maturity:
- **Baseline Input**:
  - `activeField.sowingDate`: The exact date the current standing crop was sown in the field.
  - `standingCrop.growthDurationDays`: Days from emergence to physiological maturity (e.g. Wheat: 125d, Moong: 65d, Rice: 120d).
- **Date Sequencing**:
  - **Standing Crop**: Calculates exact days elapsed, days remaining to harvest, and physiological maturity window.
  - **10-Day Land Prep & Rauni Buffer**: Automatically adds a 10-day buffer between preceding crop harvest and the next sowing window for residue incorporation and soil conditioning.
  - **Rotation Crop 1 (e.g., Summer Moong)**: Sowing window opens immediately after land prep, runs for its 65-day duration, and concludes before monsoon onset.
  - **Rotation Crop 2 (e.g., Basmati Rice / Maize)**: Sowing/transplanting window synchronized with seasonal monsoon rain arrival.
- **Multi-Year Support**:
  - Automatically models Year 1 (2026–27), Year 2 (2027–28), and Year 3 (2028–29).
  - Calculates the exact placement percentage (0–100%) on the 12-month calendar bar for each crop.

### B. Visual 12-Month Hybrid Calendar Component ([`src/components/CropRotationCalendar.tsx`](file:///z:/Nasa-Space-App/src/components/CropRotationCalendar.tsx))
Follows the **ChaiUI design system** (`oklch(0.145 0 0)` dark / `#fafafa` light, warm 1px hairlines, zero emojis, zero em dashes, no orange fills):
- **Continuous 12-Month Timeline Canvas**:
  - 12 month columns across the grid (e.g., Oct to Oct).
  - Horizontal crop duration bars with real crop photography thumbnails via `getCropImageUrl()`.
  - Hatched 10-day land prep buffer bar between crops.
  - Live animated **"Today"** pin marker showing current progress in the standing crop.
- **3-Year Multi-Year Segmented Selector**:
  - Clean ChaiUI segmented control (`Year 1`, `Year 2`, `Year 3`).
- **Exact Operational Milestone Cards**:
  1. **Land Preparation Window**: Exact date range and pre-irrigation buffer.
  2. **Optimal Sowing Window**: Recommended date range and Rhizobium inoculation guidance.
  3. **Peak Water Need**: Total seasonal mm requirement calibrated to NASA precipitation.
  4. **Harvest & Clearance Window**: Exact maturity date range.
- **Key Operational Checklist**: Check-marked action items (e.g. withhold irrigation 10 days before harvest for uniform drying).
- **NASA Climatology Safeguard**: Transparent explanation of why this window avoids terminal heat stress or excessive pumping.

### C. Unified Integration Across Tabs
- **Crop Rotation Tab ([`src/components/TimelineGantt.tsx`](file:///z:/Nasa-Space-App/src/components/TimelineGantt.tsx))**:
  - Integrated `CropRotationCalendar` with a segmented view switcher:
    - `[12-Month Calendar & Durations]` (Default active)
    - `[3-Year Succession Cards]`
- **Home Tab Quick Window Indicator ([`src/components/FarmerHomeTab.tsx`](file:///z:/Nasa-Space-App/src/components/FarmerHomeTab.tsx))**:
  - Added an operational rotation window preview badge directly below the standing crop progress bar, with a one-tap link to the calendar.

---

## 3. Verification & Build
- TypeScript compilation (`tsc -b`) and Vite production bundle: **Passed with zero errors**.
- ChaiUI audit: **0 em dashes, 0 orange fills, 0 emojis**.
- Android Capacitor Sync (`npx cap sync android`) completed.
- Android Debug APK built with Gradle (OpenJDK 21): [`FieldShift-debug.apk`](file:///z:/Nasa-Space-App/FieldShift-debug.apk).
