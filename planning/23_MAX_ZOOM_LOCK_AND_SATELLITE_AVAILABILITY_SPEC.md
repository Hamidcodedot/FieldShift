# Planning Spec 23: Max Zoom Lock and Satellite Imagery Availability Hardening

## Overview
When farmers view remote or agricultural regions (such as Mastung District, Balochistan), zooming past the maximum native satellite resolution (Zoom 18) prompted Esri ArcGIS World Imagery servers to serve placeholder error tiles containing:
> *"Map data not yet available"*

This specification documents the root cause, multi-layer zoom lock architecture, and visual UI feedback enforcing rigid zoom constraints across both the Home field satellite preview and the My Field boundary drawer.

---

## 1. Root Cause Analysis
- **Tile Service Behavior**: Esri ArcGIS World Imagery (`/World_Imagery/MapServer/tile/{z}/{y}/{x}`) provides global high-resolution sub-meter imagery up to **Zoom 18**.
- In metropolitan centres (e.g. London, NYC), Zoom 19+ exists. However, across global agricultural fields and remote areas (such as Mastung, Quetta, and rural plains), Zoom 19 does not exist natively.
- When Leaflet was configured with `maxZoom: 19` without `maxNativeZoom`, Leaflet sent HTTP GET requests for `{z: 19}` tiles. Esri returned a 200 OK with a 2,521-byte JPEG displaying *"Map data not yet available"*.

---

## 2. Multi-Layer Locking Architecture

### Layer 1: TileLayer Native Constraints
- In [`src/services/mapConfigService.ts`](file:///z:/Nasa-Space-App/src/services/mapConfigService.ts):
  - Updated `getTileLayerConfig('satellite')` without custom API key to set:
    - `maxZoom: 18`
    - `maxNativeZoom: 18`
  - Even if Leaflet is asked to render a higher zoom, `maxNativeZoom: 18` instructs Leaflet to hardware-scale the existing Zoom 18 tiles rather than querying nonexistent tiles from the remote server.

### Layer 2: Leaflet Map Instance Clamp
- In [`src/components/FieldSatellitePreview.tsx`](file:///z:/Nasa-Space-App/src/components/FieldSatellitePreview.tsx):
  - Map initialization strictly sets `maxZoom: SAFE_MAX_SATELLITE_ZOOM` (`18`).
  - `fitBounds(..., { maxZoom: SAFE_MAX_SATELLITE_ZOOM })` and `flyTo(..., SAFE_MAX_SATELLITE_ZOOM)` clamp auto-fit and animations to Zoom 18.
  - Leaflet automatically locks pinch-to-zoom, scroll wheel, double-tap, and keyboard zoom at Zoom 18.

### Layer 3: Synchronized Dynamic Tile Maxima
- In [`src/components/MapSelector.tsx`](file:///z:/Nasa-Space-App/src/components/MapSelector.tsx):
  - Layer switcher dynamically invokes `map.setMaxZoom(config.maxZoom)`.
  - Leaflet's `+` zoom button is automatically disabled when the map reaches the layer's maximum resolution.

### Layer 4: ChaiUI Controls and CSS Styling
- In [`src/index.css`](file:///z:/Nasa-Space-App/src/index.css):
  - Added `.leaflet-control-zoom a.leaflet-disabled` styling to clearly indicate disabled state with reduced opacity (`0.5`) and `cursor: not-allowed`.
- In `FieldSatellitePreview` and `MapSelector`:
  - When `isMaxZoomLocked` is true, the "Max enlarge" button switches to:
    - Label: `Max zoom locked` / `Max locked`
    - Icon: `<Lock />` (emerald)
    - Background: subtle emerald accent indicating safe maximum resolution reached
    - Tooltip: *"Max resolution reached (18x sub-meter). Further zoom is locked to prevent missing map tiles."*
  - When zooming out to regional scale, the button switches back to `<ZoomIn /> Max enlarge`.

---

## 3. Verification
- Coordinates: `30.3693°, 71.9035°` (Mastung District, Balochistan).
- Zoom 18: Authentic 24KB sub-meter satellite tiles.
- Zoom 19: Blocked from being requested or rendered.
- Build: `tsc -b && vite build` succeeded with 0 errors.
