# Feature Specification: Maximum Enlargement and Auto-Fit for Saved Farmer Field Boundaries

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Map Auto-Fit & Maximum Field Zoom (`MapSelector.tsx`, `FarmerFieldTab.tsx`), dynamic polygon bounding box fit (`fitBounds` with `maxZoom: 19`), enlarged map canvas viewport, and 1-tap "Max enlarge" control button.  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`, `#ffffff` Cards)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary & User Directives

### 1.1. User Directive
> *"here the saved selected field should be enlarged properly .....max enlarge"*
> *Attached Screenshot showing 0.09-acre field appearing as a tiny speck in the center of a zoomed-out regional view.*

### 1.2. Root Cause Analysis
1. **Absence of `map.fitBounds()` on Boundary Load:**
   When a field with an enclosed boundary (`fieldBoundary` / `drawnPoints`) was rendered on `MapSelector.tsx`, the Leaflet map remained at `initialZoom: 16` (or `flyTo` zoom 16).
2. **Scale Disparity:**
   A small farm parcel (such as 0.09 acres = 360 m², or even a standard 1-2 acre plot) spans only ~19 meters across. At zoom 16, 1 pixel represents ~2.4 meters, making the entire parcel only ~8 pixels wide—a tiny smudge surrounded by miles of urban/regional sprawl.
3. **Max Zoom Capability:**
   Esri World Imagery and Google Satellite support sub-meter resolution up to zoom level 19 (where 1 pixel is ~0.3 meters). At zoom 18–19, the same 19-meter field spans 200–350 pixels, filling the viewport and clearly revealing field boundaries, furrows, and access paths.

---

## 2. Technical Solution

### 2.1. Dynamic Auto-Fit Bounds (`map.fitBounds`)
- When `drawnPoints.length >= 3` (on initial load, when switching fields, or after saving a polygon):
  ```typescript
  const poly = L.polygon(drawnPoints);
  const bounds = poly.getBounds();
  if (bounds.isValid()) {
    map.fitBounds(bounds, {
      padding: [35, 35],
      maxZoom: 19, // Maximum sub-meter satellite zoom
      animate: true,
      duration: 1.0,
    });
  }
  ```
- When no polygon boundary is present (single farm point):
  Center on `[selectedLat, selectedLon]` at high-resolution zoom 18 (instead of 16).

### 2.2. Dedicated 1-Tap "Max Enlarge" Button
- Add a prominent, accessible `Max enlarge` button in the map control bar:
  - Icon: `<Maximize2 className="h-3.5 w-3.5" />`
  - Action: Immediately fits bounds or flies to zoom 19 centered on the field.

### 2.3. Expanded Viewport Height
- Expand the Leaflet map container from `h-72 sm:h-84` (288px) to `h-96 sm:h-[480px]` (384px to 480px), providing a generous, high-clarity viewing area.

---

## 3. Verification Plan

1. **Build Check:** `npm run build` must compile cleanly with 0 errors.
2. **Linter Check:** `npx oxlint` must report 0 errors.
3. **Visual Verification:** A 0.09 acre (or any size) saved field must immediately fill the screen at high zoom (level 18–19) without requiring manual pinch/zoom.
4. **Interactive Action:** Clicking "Max enlarge" must re-center and maximize zoom to the field.
