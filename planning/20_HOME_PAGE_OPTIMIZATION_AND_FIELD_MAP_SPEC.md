# Feature Specification: Home Page Optimization & Selected Field Satellite Map

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Home Page Streamlining (`FarmerHomeTab.tsx`), removal of redundant 5-day weather forecast section, and integration of an interactive Field Satellite Map card showcasing the active parcel's sub-meter imagery, polygon boundary, and coordinates.  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`, `#ffffff` Cards)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary & User Directives

### 1.1. User Directive
> *"remove the weather forecast from the home.....and we have to optimize the home page..... and add the selected field map or images in the home page..."*

### 1.2. The Problems Addressed
1. **Redundant Weather Section on Home:**  
   Now that FieldShift features a dedicated, comprehensive **Weather Forecast** tab (`FarmerWeatherTab.tsx`) with 5-day hourly details, FAO-56 evapotranspiration (ET0), and spraying advisories, the embedded 5-day forecast card on the Home screen created visual clutter and duplicate data requests.
2. **Missing Visual Connection to Farm Land:**  
   When a farmer selects or switches fields on the Home page, they previously only saw text (district name, coordinates). Adding a high-resolution satellite map card directly on Home provides immediate visual confirmation of the exact parcel, field shape, and vegetation health.
3. **Cluttered Information Hierarchy:**  
   The Home page needs optimization so the farmer sees an executive overview: Active Field -> Satellite Field Map -> Agronomic Impact & Crop Stage -> Live NASA Soil & Radiation norms.

---

## 2. Technical Solution

### 2.1. Remove Weather Forecast Section from Home
- Remove `<FieldWeatherConditions ... />` from `src/components/FarmerHomeTab.tsx`.
- Remove the unused import of `FieldWeatherConditions`.
- Retain the bottom navigation link to the dedicated Weather tab (`FarmerWeatherTab.tsx`).

### 2.2. Interactive Selected Field Satellite Map Card on Home
- Add a dedicated, responsive Leaflet satellite map card to `FarmerHomeTab.tsx`:
  - **Tile Layer:** High-resolution Esri World Imagery (sub-meter resolution up to zoom 19).
  - **Dynamic Polygon Boundary:** Renders `activeField.boundaryPoints` if available, styling it with ChaiUI emerald stroke (`#059669`) and semi-transparent fill.
  - **Center Farm Marker:** Custom zero-emoji SVG green pin at `[activeField.latitude, activeField.longitude]`.
  - **Auto-Fit & Max Enlarge:** Automatically executes `fitBounds` with `maxZoom: 19` whenever the active field changes, keeping the field parcel centered and maximally enlarged.
  - **Quick Action Overlay:**
    - Top-left: Location & Acreage pill (`{fieldDisplayName} • {activeField.fieldSizeAcres || 5} acres`).
    - Top-right: `[Edit in My Field ➔]` button navigating directly to `currentTab = 'field'`.
    - Bottom-right: 1-tap `[Max enlarge]` button to recenter and maximize zoom to level 19.

### 2.3. Optimized Visual Hierarchy on Home
1. **Field Switcher & Crop Stage Hero:** Field dropdown, standing crop days since sowing, growth stage progress bar, and primary actions (`Explore rotation plans`, `Audio briefing`, `Ask Field AI`).
2. **Selected Field Satellite Map Card:** Visual satellite snapshot of the active parcel with boundary and zoom controls.
3. **Rotational Agronomic Impact:** 4 KPI cards (Urea bags saved, Water saved, Soil Health, Disease shield).
4. **NASA POWER Climatology Dashboard:** Monthly temperature, MERRA-2 precipitation, GEOS-FP root-zone soil wetness, and solar irradiance.

---

## 3. Verification Plan
1. **TypeScript Build:** `npm run build` must compile cleanly with 0 errors.
2. **Linter Check:** `npx oxlint` must report 0 errors.
3. **UI Verification:**
   - Weather forecast is no longer on Home.
   - Selected field satellite map renders crisp Esri satellite imagery on Home.
   - Switching fields from the dropdown updates the satellite map and centers on the newly selected field.
   - Clicking "Edit in My Field" switches tab to `field`.
