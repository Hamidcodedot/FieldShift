# Feature Specification: AI Field Chatbot & Removal of Standalone Voice Help Page

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Conversion of standalone Voice Help page into an omnipresent, field-grounded AI Chatbot (`FieldAIChatbot.tsx`, `aiChatbotService.ts`), removal of standalone voice tab from `BottomNavigation.tsx`, and addition of floating/header triggers.  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`, `#ffffff` Cards)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary & User Directives

### 1.1. User Directive
> *"now the voice help page.....we dont need a separate page ..... we will convert it into AI chatbot regarding the farmer fields"*

### 1.2. Problem & Paradigm Shift
1. **Elimination of Redundant Standalone Page:**
   Having "Voice Help" as a separate primary page tab forced the farmer to leave their current view (Home, My Field, or Crop Rotation) just to ask a question. Agronomic decision-making happens while looking at a field or evaluating a rotation plan.
2. **Context-Aware AI Chatbot:**
   The AI chatbot must be grounded in the farmer's specific fields. It is not a generic voice assistant, but an authoritative agricultural intelligence agent that knows:
   - The selected field's exact name, acreage, GPS coordinates, and administrative district.
   - The current standing crop, days since sowing, and crop growth stage.
   - The soil texture (clay, loam, sand) and irrigation method (borewell, canal, rainfed, drip).
   - Live NASA POWER Earth observations (temperature, precipitation, root-zone soil wetness, solar radiation).
   - The field's recommended crop rotation plan, urea fertilizer savings, and pest disruption mechanisms.
3. **Dual Modality: Voice + Text:**
   Preserves full voice input (Speech-to-Text) and audio read-aloud (Text-to-Speech) so farmers who cannot type or prefer spoken Urdu/Hindi/English can converse naturally, while also providing a modern conversational text interface with quick-action chips.

---

## 2. Architecture & Components

```
┌─────────────────────────────────────────────────────────────┐
│                       App.tsx                               │
│  - Active Field, All Fields, NASA Data, Soil, Rotation      │
│  - isChatbotOpen (boolean state)                            │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌───────────────────────────────┐  ┌───────────────────────────────────┐
│ 3 Core Tabs (BottomNavigation)│  │ Floating / Header AI Trigger      │
│ 1. Home (FarmerHomeTab)       │  │ - Header "Ask AI" button          │
│ 2. My Field (FarmerFieldTab)  │  │ - Floating Action Pill/FAB        │
│ 3. Crop Rotation (Rotation)   │  │ - Quick ask chips on Home/Field   │
└───────────────────────────────┘  └──────────────────┬────────────────┘
                                                      │ (opens)
                                                      ▼
                                   ┌───────────────────────────────────┐
                                   │     FieldAIChatbot.tsx            │
                                   │ - Slide-up drawer / bottom sheet  │
                                   │ - Field Context Switcher Banner   │
                                   │ - Quick Question Chips            │
                                   │ - Message Thread (User / AI)      │
                                   │ - Mic button (Speech-to-Text)     │
                                   │ - Audio button (TTS read-aloud)   │
                                   │ - Type input with send button     │
                                   └──────────────────┬────────────────┘
                                                      │
                                                      ▼
                                   ┌───────────────────────────────────┐
                                   │      aiChatbotService.ts          │
                                   │ - Evaluates field profile & NASA  │
                                   │ - Optional Gemini API support     │
                                   │ - Deterministic Agronomic Engine  │
                                   └───────────────────────────────────┘
```

---

## 3. UI/UX Specifications (ChaiUI Look)

- **Container:** Slide-up bottom sheet / modal drawer (`max-w-lg mx-auto sm:rounded-2xl`).
- **Color Palette:**
  - Canvas: `#ffffff` in light mode, `#0f0f0f` in dark mode.
  - Border: Warm hairline `border-stone-200/80` (light) / `border-stone-800` (dark).
  - Background accents: `#fafafa` warm stone.
- **Field Context Switcher:**
  - Pinned top bar inside the chatbot with dropdown to switch between the farmer's configured fields.
  - Displays: Field Name • Standing Crop • Sowing Days • NASA Moisture • Soil Type.
- **Message Bubbles:**
  - User: Dark stone pill (`bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900`).
  - AI Assistant: Warm white card (`bg-stone-50 border border-stone-200/80 dark:bg-stone-900 dark:border-stone-800`).
  - Read-aloud button on each AI response with speaker icon (`Volume2`).
- **Input Area:**
  - Text input field with placeholder "Ask about your field, soil, or rotation...".
  - Voice mic button with pulsing animation when listening.
  - Send button (`btn-asym`).
- **Quick Question Chips:**
  - "What should I plant after my current crop?"
  - "How much urea fertilizer can I save with legumes?"
  - "Do I need to irrigate today based on NASA moisture?"
  - "What pests and diseases does my field face?"
  - "Explain the recommended 6-season rotation for this field."

---

## 4. Agronomic Reasoning Engine Capabilities

The chatbot answers questions across 6 core domains grounded in live data:
1. **Sowing & Crop Growth Stage:** Uses `sowingDate` to calculate days elapsed and advise on vegetative, flowering, or maturity care.
2. **Crop Rotation & Break Sequences:** Suggests legume break crops (moong, cowpea, chickpea, pigeon pea) to break host pest cycles and restore nitrogen.
3. **Urea & NPK Optimization:** Calculates exact bags of commercial urea saved via rhizobia biological fixation (23 kg N / bag).
4. **NASA Soil Moisture & Irrigation:** Uses live root-zone soil wetness (m³/m³) to determine whether irrigation is necessary or if tubewell water can be conserved.
5. **Soil Texture & Organic Matter:** Tailors advice based on Clay vs Loam vs Sandy Loam and compaction risk.
6. **Multi-Field Comparison:** Explains differences between the farmer's different plots (e.g. tubewell vs canal, clay vs sandy loam).

---

## 5. Verification Plan

1. **Build Integrity:** `npm run build` must compile cleanly with 0 TypeScript or bundling errors.
2. **Linter Check:** `npx oxlint` must report 0 errors.
3. **UX Verification:**
   - Standalone voice help page removed from `BottomNavigation.tsx`.
   - AI Chatbot opens seamlessly from floating button, header button, and Home tab triggers.
   - Field context switcher correctly syncs with active field.
   - Text input, quick chips, and voice input/output function reliably.
