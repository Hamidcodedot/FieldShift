# Planning Spec 24: Mobile UI Overhaul, Settings Tab & Visual Enhancements

## 1. Overview
This specification addresses mobile responsive overflow issues, unbalanced card proportions, unnecessary tag clutter, visual crop imagery additions, and the implementation of a dedicated **Settings & Guides** tab with an editable farmer profile.

---

## 2. Issues Diagnosed & Remediation Matrix

| Category | Diagnosis | Remediation |
| :--- | :--- | :--- |
| **Horizontal Overflow** | Small mobile viewports (<380px) pushed sideways by rigid `w-72`/`w-80` dropdowns and header badge stacks. | Clamped dropdowns to `w-[calc(100vw-2.5rem)] max-w-sm`; added `#root { overflow-x: hidden; }` safety fence. |
| **Header Clutter** | Stale `NASA` and `Live` badges, location button, and theme button caused line-wrapping on compact phones. | Removed location and theme buttons (now in Settings); stripped redundant badges. Clean brand mark + Ask AI button now fits cleanly on 320px+ viewports with zero overflow. |
| **Card Proportions** | Single monolithic hero card on Home contained 8+ nested subsections with ragged, uneven KPI heights. | Deconstructed into 4 modular cards; enforced uniform `h-28 flex flex-col justify-between` on 2x2 KPI grid. |
| **Crop Visuals** | Wall-of-text crop names lacked visual engagement. | Created `src/data/cropImages.ts` with authentic agricultural photography thumbnails for standing and recommended crops. |
| **Settings Tab** | Missing user profile, guides, theme toggle, and privacy documentation. | Created `FarmerSettingsTab.tsx` with editable username, Light/Dark mode selector, illustrated guides, and privacy guarantees. |
| **Map Toolbar** | Layer switcher, mode toggle, and maximize button competed for 1 row on mobile. | Restructured into responsive 2-row layout with 3 equal-width layer buttons and unified action row. |

---

## 3. Implemented Components & Key Files
- [`src/data/cropImages.ts`](file:///z:/Nasa-Space-App/src/data/cropImages.ts): High-resolution agricultural imagery registry for crops.
- [`src/components/FarmerSettingsTab.tsx`](file:///z:/Nasa-Space-App/src/components/FarmerSettingsTab.tsx): Dedicated 5th tab featuring:
  - Editable Farmer Username (`localStorage.fieldshift_farmer_name`).
  - Light/Dark theme selector.
  - 4 Illustrated Guides with photography banners and technical explanations.
  - Privacy policy and offline storage commitments.
  - About FieldShift and NASA Space Apps Challenge credentials.
- [`src/components/BottomNavigation.tsx`](file:///z:/Nasa-Space-App/src/components/BottomNavigation.tsx): Expanded to 5 ergonomic mobile tabs (`home`, `field`, `rotation`, `weather`, `settings`).
- [`src/components/FarmerHomeTab.tsx`](file:///z:/Nasa-Space-App/src/components/FarmerHomeTab.tsx): Modularized cards, crop image thumbnails, and uniform KPI grids.
- [`src/components/Header.tsx`](file:///z:/Nasa-Space-App/src/components/Header.tsx): Stripped stale tags for a clean mobile header.
- [`src/components/ClimateDashboard.tsx`](file:///z:/Nasa-Space-App/src/components/ClimateDashboard.tsx): Streamlined segmented tabs to fit mobile viewports cleanly.
- [`src/components/TimelineGantt.tsx`](file:///z:/Nasa-Space-App/src/components/TimelineGantt.tsx): Added visual crop thumbnails to next crop and sequence slots.
- [`src/index.css`](file:///z:/Nasa-Space-App/src/index.css): Added `#root` overflow guard.
