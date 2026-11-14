# Feature Specification: Crop Rotation Advisory Page Overhaul (ChaiUI & Live Satellite Research)

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Crop Rotation Page (`StrategyComparison.tsx`, `TimelineGantt.tsx`, `CustomRotationBuilder.tsx`), Live NASA Grounding, Agronomic Science & Actionable Farmer Advice  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary & Problem Statement

### 1.1. User Directive
> *"now its time to make the crop rotation page proper and to the point for farmers ....../chaiui no stale data or hardcoded data is allowed....everything must be according to live satellite and proper research"*

### 1.2. Deficiencies in Previous Implementation
1. **Disconnected from Active Field Context:** The Crop Rotation tab did not display the active field parcel (e.g., "North Tubewell Plot - 5 acres, Loam soil"), making it feel disconnected from the farmer's specific field.
2. **Abstract Metrics Without Farmer-First Actionability:** Farmers need to know immediately:
   - What should I plant **next season** on this parcel?
   - How many bags of synthetic urea fertilizer will this save my family?
   - Will my tubewell run dry or will this survive low water?
   - Is my crop disease / root nematode cycle broken?
3. **Hidden Satellite Grounding:** While the rotation solver uses NASA data under the hood, the UI didn't show the transparent scientific bridge connecting NASA POWER / MERRA-2 meteorological readings to the recommended crop sequencing.
4. **ChaiUI Compliance:** Needs strict ChaiUI styling: soothing white light default, flat cards with warm hairlines (`border-stone-200/80` / `border-amber-900/15`), Manrope numbers, Montserrat highlight phrases, asymmetric buttons (`btn-asym`, `btn-asym-mirror`), and zero emojis.

---

## 2. Scientific & Agronomic Grounding

The rotation solver models real-world agronomic and satellite physics:
1. **Biological Nitrogen Fixation (BNF):**
   - Fabaceae (Pulses/Legumes: Chickpea, Summer Moong, Pigeon Pea, Lentil, Cowpea) form symbiotic nodules with *Rhizobium* bacteria, fixing 40 to 120 kg N/ha from atmospheric $N_2$.
   - Calculation: $1\text{ bag of synthetic urea} = 46\%\text{ Nitrogen in } 50\text{ kg bag} \approx 23\text{ kg elemental N}$.
   - Formula: $\text{Urea Bags Saved} = \frac{\text{Net BNF Credit (kg N/ha)}}{23}$.
2. **Hydrological Water Balance (NASA POWER & MERRA-2):**
   - Monthly precipitation $P_m$ from NASA MERRA-2 corrected precipitation (`PRECTOTCORR`).
   - Crop water requirement $ET_c = ET_0 \times K_c$ (FAO-56 Penman-Monteith).
   - Deficit: $\text{Deficit} = \sum (P_m - ET_c)$.
   - Water saved relative to monoculture flood irrigation ($1\text{ mm} = 10\text{ m}^3\text{/ha}$).
3. **Phytosanitary & Disease Shield (Break Crops):**
   - Monoculture (e.g. continuous wheat or continuous rice) amplifies root fungal pathogens (*Gaeumannomyces graminis* / Take-all, *Fusarium* crown rot, root-knot nematodes).
   - Rotating to non-host botanical families (Poaceae $\rightarrow$ Fabaceae $\rightarrow$ Brassicaceae) disrupts fungal lifecycles and eliminates pathogen carryover.
4. **Soil Physics (Texture & Humus):**
   - Total Available Water Capacity (TAWC) scales from Sand (60 mm/m) to Loam (160 mm/m) to Clay (180 mm/m).
   - Humified carbon residue input (RothC carbon turnover fraction $0.22$).

---

## 3. UI Component Architecture

### 3.1. Field Context & Satellite Banner (`RotationHeaderCard`)
- Displays:
  - Active parcel badge: `[Field Name] • [Acreage] ac • [Soil Texture] • [Irrigation Access]`
  - Field Switcher shortcut: Allows switching fields right from the Crop Rotation tab.
  - Live NASA Observation grounding: `NASA POWER Grid: [Lat]°N, [Lon]°E • MERRA-2 Climatology`
  - Current Sowing & Stage context: `Current standing crop: [Crop Name] (Day X of season)`.

### 3.2. Strategy Comparison Deck (`StrategyComparison.tsx`)
- 4 Clear, Comparative Plans:
  1. **Soil Regenerator & Nitrogen Builder** (Max fertilizer savings, deep pulse bio-drilling)
  2. **Drought & Climate Resilience Shield** (Survives low rainfall, minimal tubewell draw)
  3. **Balanced Family Profit** (High market cash crops paired with soil protection)
  4. **Your Current Field Baseline** (Shows the ecological penalty if current practice continues)
- Each Card Displays:
  - Composite Suitability Score (0-100)
  - 3-Year Urea Fertilizer Savings (+bags/ha)
  - 3-Year Water Conserved (+m³/ha)
  - Soil Health & Carbon Humus Status
  - Disease Shield Status (Interrupted vs Repeated)
  - Selected state with clear ChaiUI active styling.

### 3.3. Seasonal Sequencing Timeline (`TimelineGantt.tsx`)
- Immediate Next Season Action Callout:
  - "Immediate Next Season Recommendation": Highlighted card advising the farmer on what to sow next, optimal sowing window, seed rate, and rationale.
- 6-Season Sequenced Timeline:
  - Season cards showing Year 1 (Kharif, Rabi, Zaid) ➔ Year 2 ➔ Year 3.
  - Crop botanical family, root architecture, nitrogen dynamics, water balance, and disease cycle break.
- Detailed Agronomic Benefits Checklist:
  - Science-backed explanation of why this sequence works for this field's specific soil and NASA climate.

### 3.4. Custom Rotation Builder Modal (`CustomRotationBuilder.tsx`)
- Polish into full ChaiUI styling: clean selectors, real-time recalculation, and save to custom rotation.

---

## 4. ChaiUI Design Specifications
- Palette: `#fafafa` canvas, `#ffffff` cards, `border-stone-200/80` warm hairlines.
- Highlights: One pale-cream highlight phrase per section:
  `font-montserrat font-medium tracking-tight capitalize text-yellow-800 dark:text-orange-100`.
- Buttons: Asymmetric corners (`btn-asym`, `btn-asym-mirror`).
- Typography: Manrope for headlines/numbers, Montserrat for badges and labels, Inter for body text.
- Emojis: 0 emojis. Lucide SVG icons only.
