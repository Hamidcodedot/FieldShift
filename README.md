# FieldShift: Adapting Farms with NASA Data

> **2026 NASA Space Apps Challenge Project**  
> **Challenge:** *Field Shift: Adapting Farms with NASA Data*  
> **Domain:** Earth Science, Agroclimatology & Decision-Support Software  

---

## Executive Overview

Farmers worldwide confront shifting thermal regimes, erratic rainfall distributions, depleted aquifers, and degraded soil biology. Continuous monocropping (such as Rice–Wheat in the Indo-Gangetic Plains or Corn–Soy in the US Midwest) accelerates subsoil compaction, soil organic carbon (SOC) loss, and pest vulnerability.

**FieldShift** is an open-science, input-neutral decision-support platform that synthesizes **NASA Earth Observations** with local soil physics, botanical invariants, and farmer priorities. It dynamically formulates, evaluates, and simulates multi-season crop rotation strategies that replenish soil nitrogen, conserve irrigation water, and build climate resilience.

---

## Core System Architecture

```
[ Interactive Farm Coordinates / Region Preset ]
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 NASA Earth Data Pipeline                    │
│  • NASA POWER API v2: Hourly, Daily & 30-Year Climatology   │
│  • Variables: T2M (Mean), T2M_MAX/MIN, PRECTOTCORR,        │
│    GWETROOT (0-100cm Root-Zone Wetness), ALLSKY_SFC_SW_DWN  │
│  • Grid Quantization: Snapped to 0.5° Centroids (95% Cache) │
│  • Open-Meteo Agro API: Real-time FAO-56 ET0 Forecast       │
│  • ISRIC SoilGrids: 250m Global Soil Texture & Carbon       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Agronomic & Soil Health Invariant Engine           │
│  • Botanical Family Alternation (Pest / Fungal Disruption)  │
│  • Biological Nitrogen Fixation (BNF) Rhizobial Stoichiometry│
│  • FAO-56 Dual Crop Coefficient (Kc) Water Deficit Balance  │
│  • Soil Organic Carbon (SOC) First-Order Humification       │
│  • Extreme Heat & Drought Sterility Risk Penalties          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           Multi-Objective Optimization Solver               │
│  max J(X) = w_S · SHI(X) + w_W · WRI(X) + w_E · ESI(X)      │
│             - w_R · CRP(X)                                  │
│                                                             │
│  • Strategy 1: Soil Regenerator & Nitrogen Builder          │
│  • Strategy 2: Drought & Climate Resilience Shield          │
│  • Strategy 3: Balanced High-Value Market & Food Security   │
│  • Strategy 4: Interactive Farmer Drag-and-Swap Sandbox     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           Decision Support & Advisory Interface             │
│  • Geospatial Farm Selector with NASA 0.5° Cell Overlay     │
│  • 12-Month Agroclimatology Dashboard (Rainfall/Temp/Wetness)│
│  • Multi-Metric Comparative Strategy Matrix                 │
│  • 3-Year / 6-Season Sequential Timeline (Gantt)            │
│  • Printable / PDF Field Action Plan                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **Global Agro-Ecological Profiling:**
   - Pre-configured calibrated profiles for 6 major agricultural macro-regions:
     - **South Asia (Indo-Gangetic Plains):** Punjab/Haryana Rice-Wheat aquifer depletion & hardpan disruption.
     - **US Midwest Corn Belt:** Iowa Corn-Soy tile drainage nitrate runoff and cover crop integration.
     - **Sub-Saharan Africa (Sahel):** Extreme drought-hardy pearl millet, sorghum, and Zaï water harvesting.
     - **Mediterranean Basin:** Andalusia rainfed winter cereals, legumes, and vapor pressure deficit management.
     - **Latin America (Brazilian Cerrado):** Oxisol acidity, Safrinha double-cropping, and *Brachiaria* grass mulch.
     - **Australia (Murray-Darling):** Flash droughts, salinity hazard, and winter pulse diversification.
   - Point-and-click coordinate selection for any location globally on an interactive Leaflet map.

2. **Real-time NASA Data Integration:**
   - Live query to NASA POWER API v2 with automatic fallback to pre-warmed 30-year climatology baselines.
   - Spatial grid snapping (`round(coord * 2) / 2`) ensures sub-50ms responsiveness and offline resilience.

3. **Multi-Objective Rotation Optimization:**
   - **Soil Health Index (SHI):** Evaluates biological nitrogen fixation ($\Delta N$ kg/ha), humus accrual, and root architecture diversity (taproots vs. fibrous).
   - **Water Resilience Index (WRI):** Balances crop water demand ($ET_c$) against NASA precipitation and root-zone moisture ($GWETROOT$).
   - **Economic Security Index (ESI):** Modern Portfolio Theory revenue stability across diversified commodity markets.
   - **Climate Risk Penalty (CRP):** Quantifies heat exposure during anthesis ($>35^\circ\text{C}$) and drought risks.

4. **Interactive Crop Rotation Sandbox:**
   - Farmers can drag-and-swap crops across 6 seasons from a library of 30+ regional crops.
   - Real-time validation alerts for botanical family repetition (preventing Take-all, Corn Rootworm, and Soybean Cyst Nematode buildup).

5. **Printable Farmer Action Plan:**
   - Generates a field-ready agronomic brief with Rhizobium inoculation protocols, cover crop termination windows, and fertilizer reduction guidelines.

---

## Production Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build System:** Vite
- **Styling & Design System:** Tailwind CSS v4 (Strict 8px rhythmic grid, 1px hairline borders, Zero-Emoji invariant)
- **Vector Iconography:** Lucide React
- **Geospatial Mapping:** Leaflet
- **Data Protocols:** NASA POWER REST API v2, ISRIC SoilGrids v2, Open-Meteo Agro API

---

## Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/your-username/fieldshift.git
cd fieldshift

# 2. Install dependencies
npm install

# 3. Launch development server
npm run dev

# 4. Open in browser
http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Scientific Grounding & Data Sources

- **NASA POWER Project:** Agroclimatology Archive, NASA Langley Research Center.
- **NASA MERRA-2:** Modern-Era Retrospective analysis for Research and Applications, Version 2 (Goddard Earth Observing System GEOS-5).
- **NASA SMAP:** Soil Moisture Active Passive L4 Root-Zone Soil Moisture.
- **FAO-56:** Allen, R. G., et al. *Crop evapotranspiration - Guidelines for computing crop water requirements*.
- **RothC-26.3:** Coleman, K. & Jenkinson, D. S. *A model for the turnover of carbon in soil*.
