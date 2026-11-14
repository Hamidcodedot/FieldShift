# FieldShift Planning & Architecture Workspace

> **Environment Policy:** This folder is strictly dedicated to **planning, architecture, requirements engineering, and gap analysis**. No production application code is modified directly within this directory. All proposed changes, new features, and technical refactors must be drafted, reviewed, and finalized here before implementation.

---

## 1. Purpose & Workflow

The goal of this planning folder is to establish a rigorous, disciplined engineering cycle:
1. **Plan First:** Document requirements, data contracts, mathematical models, UI mockups, and edge cases.
2. **Review & Align:** Validate assumptions against agronomic science, NASA Earth observations data feasibility, and mobile usability constraints.
3. **Implement Accurately:** Transition approved specifications into atomic, testable code in `src/` or `android/` without regressions or technical debt.

```
┌─────────────────────────────────────────────────────────────┐
│                       PLANNING PHASE                        │
│  • System Audit (Current Build State)                       │
│  • Architectural Blueprints & Data Flow                      │
│  • Feature Specifications & Agronomic Formulas               │
│  • Gap Analysis & Prioritized Roadmap                       │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Approved Plan)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION PHASE                     │
│  • Feature Branch (`feat/<feature-name>`)                   │
│  • Typed Code in `src/`                                     │
│  • Local Verification (`npm run build`, `npm run lint`)     │
│  • Android Sync (`npx cap sync android`)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Index

| Document | Purpose | Status |
| :--- | :--- | :--- |
| [**`01_CURRENT_BUILD_STATE.md`**](./01_CURRENT_BUILD_STATE.md) | Comprehensive audit of all existing features, UI tabs, engine algorithms, services, and native assets built to date. | **Active / Complete** |
| [**`02_ARCHITECTURE_AND_DATA_FLOW.md`**](./02_ARCHITECTURE_AND_DATA_FLOW.md) | Technical diagrams, data pipelines, state management lifecycle, and invariant constraints. | **Active / Complete** |
| [**`03_ROADMAP_AND_IMPLEMENTATION_PLAN.md`**](./03_ROADMAP_AND_IMPLEMENTATION_PLAN.md) | Step-by-step phases, planned capabilities, technical debt remediation, and gating criteria for subsequent sprints. | **Active / Complete** |
| [**`04_LANGUAGE_SIMPLIFICATION_SPEC.md`**](./04_LANGUAGE_SIMPLIFICATION_SPEC.md) | Specification & verification of stripping multilingual bloat down to clean default English. | **Implemented / Verified** |
| [**`06_MY_FIELD_AND_SATELLITE_SPEC.md`**](./06_MY_FIELD_AND_SATELLITE_SPEC.md) | High-Resolution Satellite Map, Farmer Field Profile (First-Time Setup / Editable), and NASA Data Grounding. | **Implemented / Verified** |
| [**`07_NASA_CHALLENGE_ALIGNMENT_AUDIT.md`**](./07_NASA_CHALLENGE_ALIGNMENT_AUDIT.md) | Official compliance audit & scoring against the NASA Space Apps Challenge rubric. | **Verified / 100% Aligned** |
| [**`08_CHAIUI_MOBILE_SIMPLIFICATION_SPEC.md`**](./08_CHAIUI_MOBILE_SIMPLIFICATION_SPEC.md) | Complete mobile simplification & ChaiUI design system overhaul specification. | **Implemented / Verified** |
| [**`09_FIRST_TIME_ONBOARDING_SPEC.md`**](./09_FIRST_TIME_ONBOARDING_SPEC.md) | First-time farmer onboarding wizard, satellite field selection, and direct sync with 'My Field'. | **Implemented / Verified** |
| [**`10_GPS_AUTO_LOCATION_AND_FIELD_DRAWING_SPEC.md`**](./10_GPS_AUTO_LOCATION_AND_FIELD_DRAWING_SPEC.md) | Automatic GPS location, removal of manual macro-regions, high-zoom satellite map, and field polygon drawing tool. | **Implemented / Verified** |
| [**`11_MULTI_FIELD_MANAGEMENT_AND_PERFECT_LOCATION_SYNC_SPEC.md`**](./11_MULTI_FIELD_MANAGEMENT_AND_PERFECT_LOCATION_SYNC_SPEC.md) | Multi-field management architecture, parcel switcher, and global field-centric NASA climatology synchronization. | **Implemented / Verified** |
| [**`12_HOME_FIELD_DROPDOWN_AUTHENTIC_SATELLITE_AND_DATE_TRACKING_SPEC.md`**](./12_HOME_FIELD_DROPDOWN_AUTHENTIC_SATELLITE_AND_DATE_TRACKING_SPEC.md) | Home page field switcher dropdown, authentic live NASA satellite climatology (no hardcoded data), and field sowing date tracking. | **Implemented / Verified** |
| [**`13_CROP_ROTATION_PAGE_CHAIUI_AND_SATELLITE_RESEARCH_SPEC.md`**](./13_CROP_ROTATION_PAGE_CHAIUI_AND_SATELLITE_RESEARCH_SPEC.md) | Crop rotation advisory page overhaul (ChaiUI, direct farmer advice, live NASA satellite research grounding, next crop recommendations). | **Implemented / Verified** |
| [**`14_FOCUSED_CROP_ROTATION_UX_AND_DYNAMIC_FIELD_SOLVING_SPEC.md`**](./14_FOCUSED_CROP_ROTATION_UX_AND_DYNAMIC_FIELD_SOLVING_SPEC.md) | Focused crop rotation UX decluttering (single strategy view, change plan drawer, edit custom crops, and dynamic field solving). | **Implemented / Verified** |
| [**`15_AI_FIELD_CHATBOT_SPEC.md`**](./15_AI_FIELD_CHATBOT_SPEC.md) | Conversion of standalone Voice Help page into an omnipresent, field-grounded AI Chatbot (`FieldAIChatbot.tsx`, `aiChatbotService.ts`) and navigation refinement. | **Implemented / Verified** |
| [**`16_LIVE_5_DAY_WEATHER_CONDITIONS_SPEC.md`**](./16_LIVE_5_DAY_WEATHER_CONDITIONS_SPEC.md) | High-level 5-Day live agricultural weather conditions section (`FieldWeatherConditions.tsx`, `weatherService.ts`), integrated into `FarmerHomeTab.tsx` and dynamically synced with the active field's coordinates. | **Implemented / Verified** |
| [**`17_DEDICATED_WEATHER_FORECAST_PAGE_SPEC.md`**](./17_DEDICATED_WEATHER_FORECAST_PAGE_SPEC.md) | Dedicated Weather Forecast Tab (`FarmerWeatherTab.tsx`) in the bottom navigation bar beside Crop Rotation, grounded in exact field coordinates, live Open-Meteo & NASA atmospheric data, and operational farm guidance. | **Implemented / Verified** |
| [**`18_MAX_ENLARGE_FIELD_BOUNDARY_SPEC.md`**](./18_MAX_ENLARGE_FIELD_BOUNDARY_SPEC.md) | Maximum enlargement and auto-fit bounds (`maxZoom: 19`) for saved farmer field boundaries and enlarged map canvas. | **Implemented / Verified** |
| [**`19_AWAITING_FIELD_SETUP_GUIDED_STATE_SPEC.md`**](./19_AWAITING_FIELD_SETUP_GUIDED_STATE_SPEC.md) | Onboarding dismissal ("X"), unconfigured field detection, and "Awaiting Field Setup" guided empty state across Home, Weather, and Rotation tabs. | **Implemented / Verified** |
| [**`20_HOME_PAGE_OPTIMIZATION_AND_FIELD_MAP_SPEC.md`**](./20_HOME_PAGE_OPTIMIZATION_AND_FIELD_MAP_SPEC.md) | Home page optimization, removal of redundant weather forecast, and interactive selected field satellite map card. | **Implemented / Verified** |
| [**`21_CANCELABLE_AUDIO_BRIEFING_SPEC.md`**](./21_CANCELABLE_AUDIO_BRIEFING_SPEC.md) | Cancelable audio briefing, playback toggle state, instant speech stop, and navigation cleanup. | **Implemented / Verified** |
| [**`22_ANDROID_APK_BUILD_SPEC.md`**](./22_ANDROID_APK_BUILD_SPEC.md) | Android APK compilation, OpenJDK 21 toolchain configuration, Gradle build pipeline, and installation guide. | **Implemented / Verified** |
| [**`23_MAX_ZOOM_LOCK_AND_SATELLITE_AVAILABILITY_SPEC.md`**](./23_MAX_ZOOM_LOCK_AND_SATELLITE_AVAILABILITY_SPEC.md) | Multi-layer max zoom lock (Zoom 18) and native tile scaling to eliminate 'Map data not yet available' placeholder tiles globally. | **Implemented / Verified** |
| [**`24_MOBILE_UI_OVERHAUL_SETTINGS_TAB_AND_VISUALS_SPEC.md`**](./24_MOBILE_UI_OVERHAUL_SETTINGS_TAB_AND_VISUALS_SPEC.md) | Comprehensive mobile UI overhaul, Settings & Guides tab with editable username, crop photography visuals, and overflow elimination. | **Implemented / Verified** |
| [**`25_NO_SCROLL_ONBOARDING_AND_FIELD_TAB_OPTIMIZATION_SPEC.md`**](./25_NO_SCROLL_ONBOARDING_AND_FIELD_TAB_OPTIMIZATION_SPEC.md) | Mobile-locked zero-scroll onboarding wizard, satellite-first soil health diagnostic, and My Field dropdown optimization. | **Implemented / Verified** |
| [**`26_OPERATIONAL_CROP_CALENDAR_AND_DURATION_SPEC.md`**](./26_OPERATIONAL_CROP_CALENDAR_AND_DURATION_SPEC.md) | Operational crop rotation calendar & duration tracker (12-month visual timeline, turnaround buffers, and exact operational date cards). | **Implemented / Verified** |
| [**`27_MOBILE_CALENDAR_AND_UNIFIED_FIELD_WIZARD_SPEC.md`**](./27_MOBILE_CALENDAR_AND_UNIFIED_FIELD_WIZARD_SPEC.md) | Mobile-optimized crop calendar, unified interchangeable field wizard (onboarding, create, edit), and My Field calendar integration. | **Implemented / Verified** |
| [**`05_FEATURE_SPEC_TEMPLATE.md`**](./05_FEATURE_SPEC_TEMPLATE.md) | Standardized template to be used for detailing any new feature before code is written. | **Active / Ready** |

---

## 3. Planning Rules of Engagement

1. **Keep Documentation Grounded:** Every claim about what is built must match actual files and lines of code in `src/` and `android/`.
2. **Zero Assumptions on External APIs:** NASA POWER, Open-Meteo, and Leaflet integrations must account for network failure, rate limits, and offline fallback scenarios.
3. **Preserve Scientific Rigor:** Agronomic models must reference validated literature (FAO-56, RothC, Biological Nitrogen Fixation stoichiometry).
4. **Mobile & Accessibility First:** Designs must adhere to ChaiUI conventions (clean, high-contrast, zero-emoji, 1px hairlines) and work seamlessly on mobile viewports and Android devices.
