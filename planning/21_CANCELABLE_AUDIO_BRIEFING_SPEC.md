# Feature Specification: Cancelable Audio Briefing & Speech Synthesis Controls

> **Specification Status:** Implemented & Verified  
> **Target Scope:** Audio Briefing Controls (`FarmerHomeTab.tsx`), Speech Synthesis Service Event Handlers (`voiceAssistant.ts`), State Management (`isPlayingBriefing`), and Instant Stop/Cancel Capabilities.  
> **Design Framework:** ChaiUI (chaicode.com look)  
> **Theme Policy:** **White Default (Soothing Warm Light Canvas `#fafafa`, `#ffffff` Cards)**  
> **Author:** Antigravity / Engineering  
> **Date:** 2026-11-03  

---

## 1. Executive Summary & User Directives

### 1.1. User Directive
> *"add option to cancel the the audio briefing bcz it continuously speaks without manually stop it"*

### 1.2. Problem Statement
1. **Unstoppable Playback:** When a farmer clicked "Audio briefing" on the Home page, the Web Speech / Capacitor Text-to-Speech API queued and spoke the full multi-sentence agronomic summary without any toggle or cancellation option.
2. **Missing Playback State:** The button remained static ("Audio briefing") while audio was playing, giving no visual feedback that audio was active and providing no way to pause, cancel, or stop speech.
3. **No Teardown on Tab Switch:** If the farmer navigated away from the Home page or switched fields while audio was playing, the speech continued reading in the background.

---

## 2. Technical Solution

### 2.1. Enhanced Speech Synthesis Service (`src/services/voiceAssistant.ts`)
- Add callback parameters `onEnd?: () => void` and `onError?: () => void` to `speakFarmerResponse`.
- In Web Speech API:
  - Bind `utterance.onend = () => onEnd?.();`
  - Bind `utterance.onerror = () => onError?.();`
- In native Capacitor TTS:
  - Trigger `onEnd?.()` upon promise resolution.
- Export `isSpeaking(): boolean` helper checking `window.speechSynthesis.speaking`.

### 2.2. Interactive Audio Briefing Toggle in `FarmerHomeTab.tsx`
- State: `const [isPlayingBriefing, setIsPlayingBriefing] = useState<boolean>(false);`
- Handler `handleToggleAudioBriefing()`:
  - If `isPlayingBriefing`:
    - Immediately calls `stopSpeaking()`.
    - Updates state to `false`.
  - If `!isPlayingBriefing`:
    - Sets state to `true`.
    - Synthesizes summary.
    - Passes completion callbacks `() => setIsPlayingBriefing(false)` to automatically reset the button when speech finishes naturally.
- Teardown:
  - In `useEffect(() => () => { stopSpeaking(); }, [])`: automatically stops audio if the user navigates away or unmounts the tab.
- Button Visuals:
  - **Idle State:**
    - Icon: `<Volume2 className="h-3.5 w-3.5" />`
    - Label: `Audio briefing`
    - Style: ChaiUI outline button (`btn-asym-mirror border-amber-900/15`).
  - **Playing State:**
    - Icon: `<Square className="h-3 w-3 fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400" />`
    - Indicator: Pulsing red dot `<span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />`
    - Label: `Stop audio`
    - Style: Highlighted rose border (`border-rose-300 bg-rose-50/90 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300`).

---

## 3. Verification Plan
1. **TypeScript Build:** `npm run build` must compile cleanly with 0 errors.
2. **Linter Check:** `npx oxlint` must report 0 errors.
3. **Interaction Verification:**
   - Tap "Audio briefing": Button transforms into "Stop audio" with stop square icon. Speech starts.
   - Tap "Stop audio": Speech cancels immediately. Button resets to "Audio briefing".
   - Switch tab while playing: Speech stops instantly upon navigation.
