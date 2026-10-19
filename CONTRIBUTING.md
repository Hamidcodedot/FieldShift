# Team Collaboration and Contribution Guide

> **FieldShift: Adapting Farms with NASA Data**  
> 2026 NASA Space Apps Challenge Project

Welcome to the FieldShift team. This document establishes our team's engineering standards, Git workflow, and coordination protocol so all members can build collaboratively without breaking the codebase or duplicating effort.

---

## 1. Team Architecture and Ownership

To minimize merge conflicts, team members should take ownership of distinct domains:

| Domain | Focus | Key Paths |
| :--- | :--- | :--- |
| **Frontend & Mobile UI** | Touch layouts, ChaiUI white styling, mobile responsiveness, farmer accessibility | `src/components/`, `src/App.tsx`, `src/index.css` |
| **Agroclimatology & Data Engine** | NASA POWER API queries, rotation scoring algorithms, soil metrics | `src/services/nasaPowerService.ts`, `src/services/recommendationEngine.ts` |
| **Native Systems & Speech** | Native Capacitor plugins, speech-to-text, TTS voice feedback, GPS | `android/`, `src/services/speechService.ts`, `src/services/geolocationService.ts` |
| **Localization & Documentation** | Urdu calligraphy (Noto Nastaliq), English/regional translations, NASA pitch | `src/services/translationService.ts`, `README.md` |

---

## 2. Git Branching Strategy

We follow a structured GitFlow branching model:

```
main (Production / Space Apps Submission)
  ^
  |  (Release merge via PR)
develop (Team Integration Branch)
  ^
  |  (Feature merge via PR)
feat/your-feature-name (Individual Developer Branch)
```

- **`main`**: Production-ready, stable releases. Nobody pushes directly to `main`.
- **`develop`**: The primary integration branch for ongoing team development.
- **`feat/<feature-name>`**: Short-lived feature branch created by a team member for a specific task.
- **`fix/<bug-name>`**: Bug fix branch for resolving an identified issue.

---

## 3. Step-by-Step Developer Workflow

Every team member must follow these 6 steps for any task:

### Step 1: Sync with Latest `develop`
Before starting any new work, update your local machine:
```bash
git checkout develop
git pull origin develop
```

### Step 2: Create a Feature Branch
Create a descriptive branch name from `develop`:
```bash
git checkout -b feat/satellite-soil-overlay
# Or for a fix:
git checkout -b fix/urdu-font-overflow
```

### Step 3: Implement Your Changes
Write your code, following the existing project structure and typing conventions.

### Step 4: Verify Zero Build Errors Locally
Before staging or committing, execute the build pipeline:
```bash
npm run build
```
If TypeScript reports type errors or Vite reports bundler errors, fix them before proceeding. Never push code that breaks `npm run build`.

### Step 5: Commit with Conventional Commits
Use standard commit messages:
```bash
git add .
git commit -m "feat(map): add high-resolution satellite imagery toggle"
```
Prefixes:
- `feat(...)`: A new feature
- `fix(...)`: A bug fix
- `chore(...)`: Dependencies, configurations, or build scripts
- `docs(...)`: Documentation changes
- `refactor(...)`: Code cleanup without behavior changes

### Step 6: Push and Open a Pull Request (PR)
Push your branch to GitHub:
```bash
git push -u origin feat/satellite-soil-overlay
```
1. Open the GitHub repository: `https://github.com/Hamidcodedot/FieldShift`.
2. Click **Compare & pull request**.
3. Set base branch to **`develop`** (compare: `feat/satellite-soil-overlay`).
4. Describe your changes and tag at least one teammate for review.
5. Once approved and checks pass, merge into `develop`.

---

## 4. Invariants to Prevent Breakages

1. **Never Commit Directly to `main` or `develop`:** All changes must arrive via Pull Requests.
2. **Never Commit Secrets:** The `.env` file is strictly ignored by `.gitignore`. Only commit non-sensitive template keys into `.env.example`.
3. **Task Assignment in GitHub Issues:**
   - Before writing code, claim the task in GitHub Issues/Projects by assigning it to yourself.
   - If a task is already assigned to a teammate, do not work on it to prevent duplicate work.
4. **Absolute Zero Emoji Policy:**
   - Keep UI elements, status badges, buttons, cards, and commit titles free of emojis. Use Lucide SVG icons and semantic badges.

---

## 5. Local Setup Checklist for New Teammates

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Hamidcodedot/FieldShift.git
   cd FieldShift
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```
4. **Start Vite Dev Server:**
   ```bash
   npm run dev
   ```
5. **Build Android APK (Optional, for mobile testing):**
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew assembleDebug
   ```
