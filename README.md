# FieldShift — 24/7 Satellite Farm Intelligence & Crop Rotation Platform

> **"Your farm needs 24/7 surveillance and crop rotation to restore and improve the soil. Our app is here."**

**FieldShift** is an open-science precision agriculture platform built for the **2026 NASA International Space Apps Challenge** (*Field Shift: Adapting Farms with NASA Data*). By combining **NASA Earth Observations** with local soil physics, multi-objective crop rotation optimization, live agricultural weather, and an on-demand **AI Senior Agronomist**, FieldShift helps farmers worldwide conserve groundwater, rebuild soil organic carbon, and strengthen climate resilience.

| Resource | Link |
| :--- | :--- |
| **Live Web & Mobile App** | **[field-shift-green.vercel.app](https://field-shift-green.vercel.app)** |
| **Android APK (v1.0.0)** | **[Download Latest Release](https://github.com/Hamidcodedot/FieldShift/releases/latest)** |
| **Source Code** | **[github.com/Hamidcodedot/FieldShift](https://github.com/Hamidcodedot/FieldShift)** |

---

## Executive Overview

Farmers worldwide confront shifting thermal regimes, erratic rainfall distributions, depleted aquifers, and degraded soil biology. Continuous monocropping (such as Rice–Wheat in the Indo-Gangetic Plains or Corn–Soy in the US Midwest) accelerates subsoil compaction, soil organic carbon (SOC) loss, and pest vulnerability.

**FieldShift** serves as a 24/7 digital agronomist and satellite monitoring companion—synthesizing **NASA POWER Earth Observations** with field-level soil profiles, botanical invariants, and farmer priorities to formulate, evaluate, and simulate multi-season crop rotation strategies that replenish soil nitrogen, reduce irrigation demand, and protect farm livelihoods.

---

## Core System Architecture

```
[ GPS Auto-Location / Interactive Map / Field Boundary ]
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 NASA Earth Data Pipeline                    │
│  • NASA POWER API v2 (Climatology Point, AG Community)      │
│  • Variables: T2M, T2M_MAX, T2M_MIN, PRECTOTCORR,           │
│    GWETROOT (Root-Zone Wetness), ALLSKY_SFC_SW_DWN,         │
│    RH2M, WS10M, TS                                          │
│  • Grid Quantization: 0.5° Centroids + LocalStorage Cache   │
│  • Open-Meteo Forecast API: Live 5-Day & 7-Day Agro Weather │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Agronomic & Soil Health Invariant Engine           │
│  • Botanical Family Alternation (Pest / Fungal Disruption)  │
│  • Biological Nitrogen Fixation (BNF) Stoichiometry         │
│  • Crop Water Demand vs. Root-Zone Moisture Balance         │
│  • Soil Organic Carbon (SOC) Accrual Modeling               │
│  • Extreme Heat & Drought Risk Penalties                    │
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
│  • Strategy 4: Interactive Custom Rotation Builder          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│           Decision Support & Advisory Interface             │
│  • Guided Onboarding & Multi-Field Management               │
│  • Satellite Map Viewport & Custom Field Boundary Drawing   │
│  • Live 5-Day Agricultural Weather & Soil Health Diagnostics│
│  • 3-Year / 6-Season Rotation Matrix & Operational Calendar │
│  • AI Senior Agronomist (/api/chat + Gemini 2.5 Flash)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **Global Agro-Ecological Profiling & Multi-Field Management:**
   - Calibrated regional baselines across **23 global agro-ecological profiles** (spanning South Asia, US Midwest, Sub-Saharan Africa, Mediterranean Basin, Latin America, Australia, and more).
   - Guided onboarding wizard, automatic GPS coordinate detection, reverse geocoding, and interactive polygon field boundary drawing on Leaflet satellite maps.
   - Manage multiple farm fields with individual soil texture, organic matter, irrigation method, and sowing date tracking.

2. **Real-Time NASA Data & Live Agricultural Weather:**
   - Live queries to the **NASA POWER API v2** (`climatology/point`) with automatic fallback to pre-calibrated regional climatology baselines for offline resilience.
   - Spatial grid snapping (`0.5°` resolution) and `localStorage` caching for fast responsiveness.
   - Live 5-day and 7-day field weather conditions and forecasts via the **Open-Meteo** agricultural forecast API.

3. **Multi-Objective Crop Rotation Optimization:**
   - **Soil Health Index (SHI):** Evaluates biological nitrogen fixation ($\Delta N$ kg/ha), soil organic carbon accrual, and root architecture diversity.
   - **Water Resilience Index (WRI):** Balances crop water demand against NASA precipitation and root-zone soil wetness (`GWETROOT`).
   - **Economic Security Index (ESI):** Evaluates revenue stability across diversified crop portfolios.
   - **Climate Risk Penalty (CRP):** Quantifies heat and drought exposure across growing seasons.

4. **Custom Rotation Builder & Operational Crop Calendar:**
   - Customize 6-season rotations from a database of **21 calibrated crops** with real-time botanical family repetition alerts.
   - Visual 3-year timeline and operational crop calendar tracking current phenological growth stages, sowing windows, and harvest milestones.

5. **AI Senior Agronomist & Voice Assistant:**
   - Built-in **AI Senior Agronomist** powered by **Google Gemini 2.5 Flash** via a secure Vercel Serverless backend (`/api/chat`), grounded in your active field profile, NASA POWER telemetry, soil health diagnostics, and rotation plan.
   - Automatic **offline-first deterministic fallback** ensures field-grounded agronomic guidance remains available even without internet connectivity.
   - Supports voice input and audio playback via Capacitor Speech Recognition / Text-to-Speech on Android and Web Speech API on desktop browsers.

---

## Production Tech Stack

- **Frontend Framework:** React 19 + TypeScript
- **Build System:** Vite
- **AI Backend:** Vercel Serverless Function (`/api/chat`) + Google Gemini 2.5 Flash (with offline-first deterministic fallback)
- **Mobile Runtime:** Capacitor 8 (Android APK: `org.fieldshift.app`)
- **Styling & Design System:** Tailwind CSS v4 (1px hairline borders, light/dark themes)
- **Vector Iconography:** Lucide React
- **Geospatial Mapping:** Leaflet (Esri World Imagery / OpenStreetMap, with optional Google Satellite Hybrid & Terrain layers)
- **Data Protocols:** NASA POWER REST API v2, Open-Meteo Forecast API

---

## Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm 9+
- Android Studio / JDK 17+ *(optional, only for building the Android APK)*

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/Hamidcodedot/FieldShift.git
cd FieldShift

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables
cp .env.example .env
# Add VITE_GOOGLE_MAPS_API_KEY if you want Google Satellite Hybrid/Terrain layers
# Set GEMINI_API_KEY in Vercel Environment Variables for the /api/chat backend

# 4. Launch development server
npm run dev

# 5. Open in browser
http://localhost:5173
```

### Production Build & Android Sync

```bash
# Web production build
npm run build
npm run preview

# Sync web bundle to Android Capacitor project
npx cap sync android
```

---

## Scientific Grounding & Data Sources

- **NASA POWER Project:** Agroclimatology Archive, NASA Langley Research Center (`T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `GWETROOT`, `ALLSKY_SFC_SW_DWN`, `RH2M`, `WS10M`, `TS`).
- **NASA MERRA-2:** Modern-Era Retrospective analysis for Research and Applications, Version 2 (underlying NASA POWER meteorology).
- **NASA SMAP:** Soil Moisture Active Passive root-zone soil moisture reference.
- **Open-Meteo:** High-resolution agricultural weather & soil moisture forecast API.
- **FAO-56:** Allen, R. G., et al. *Crop evapotranspiration - Guidelines for computing crop water requirements*.
- **RothC-26.3:** Coleman, K. & Jenkinson, D. S. *A model for the turnover of carbon in soil*.
