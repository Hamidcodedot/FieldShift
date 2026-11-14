# Feature Specification: [Feature Name]

> **Feature Status:** [Draft | In Review | Approved | Implemented]  
> **Target Release:** [Phase / Milestone]  
> **Author / Lead:** [Name]  
> **Date:** [YYYY-MM-DD]

---

## 1. Problem Statement & User Story
- **Problem:** What limitation, user pain point, or scientific gap does this feature address?
- **User Story:** *As a [smallholder farmer / agronomist / evaluator], I want to [action] so that [benefit/outcome].*

---

## 2. Agronomic & Scientific Grounding
- **Scientific Foundation:** (e.g., FAO-56 dual crop coefficient, biological nitrogen fixation kinetics, NASA POWER API specifications).
- **Mathematical Formulas:**
  $$\text{Example: } Y = f(X)$$
- **Literature & Data Citations:**
  - Author, Year, Title, Journal / Agency.

---

## 3. Architecture & Data Flow
- **Affected Services / Components:**
  - `src/...`
- **Data Contract / Interfaces:**
```typescript
export interface ExampleFeaturePayload {
  id: string;
  // Define attributes
}
```
- **Error Handling & Offline Fallback:**
  - What happens if network requests fail or offline mode is active?

---

## 4. UI / UX Design & Mobile Ergonomics
- **Screen Location:** [Home Tab / Field Tab / Rotation Tab / Voice Tab / Modal]
- **Visual Design Elements:** (Adhering to ChaiUI 1px borders, high contrast, zero emojis, Lucide icons).
- **RTL / Localization Impact:** Does this require translation keys in `translations.ts`?

---

## 5. Implementation Checklist & Verification Criteria
- [ ] Task 1: Interface & type definitions
- [ ] Task 2: Service / Engine logic implementation
- [ ] Task 3: Component rendering and reactive state connection
- [ ] Task 4: Unit test verification (`vitest`)
- [ ] Task 5: Build check (`npm run build`) and lint verification (`npm run lint`)
