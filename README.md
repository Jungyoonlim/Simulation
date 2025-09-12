# Simulation: 3D Object Viewer and Annotator. 

## Overview 
This project aims to help users interact with 3D models. 

## Quick Start (Vite + pnpm)
- Prereqs: Node 18+, pnpm installed
- Install: `pnpm install` (from repo root)
- Dev server: `pnpm --filter simulation dev`
- Build: `pnpm --filter simulation build`
- Preview: `pnpm --filter simulation preview`

The app code lives in `simulation/` and is built with Vite and TypeScript. Static assets remain under `simulation/public/`.

## Features
- 3D Model Viewing: Load and display `.obj` files within a 3D environment.
- Interactive Annotations: Add and manage annotations on 3D models with coordinates.
- Object Manipulation: Interact with and manipulate 3D objects within the scene.
- Backend: For storing annotations and 3D model data. 

## Core Structure
1. Model Selection 
2. Model Display 
3. Three.js Scene 

## Planned Enhancements
- TypeScript Migration
    (  High Priority (Core Components):
  - src/components/Auth/LoginPage.js → .tsx
  - src/components/Auth/SignupPage.js → .tsx
  - src/components/Dashboard/Dashboard.js → .tsx
  - src/components/ModelDisplayPage/ModelDisplayPage.js → .tsx
  - src/components/ModelSelectionPage/ModelSelectionPage.js → .tsx

  Medium Priority (Supporting Components):
  - src/components/ModelPreview/ModelPreview.js → .tsx
  - src/components/viewer/Controls.js → .tsx
  - src/components/viewer/Viewport.js → .tsx
  - src/components/viewer/toolbar/*.js → .tsx

  Lower Priority (Entry/Config):
  - src/App.js → .tsx
  - src/index.js → .tsx

  Also update tsconfig.json to enable "strict": true once conversion is complete.)
- Codebase Cleanup 
        - Remove CRA artifacts: src/App.js, src/index.js, reportWebVitals.js, App.test.js,
setupTests.js, public/index.html, build/, and CRA simulation/README.md.
    - Resolve duplicates: keep the TSX versions (src/components/Auth/LoginPage.tsx)
and delete the JS duplicates; ensure re-exports in pages/* point to TS files
explicitly.
    - Fix or remove src/components/Auth/Signup.tsx (it currently breaks type checks).
- Type safety and correctness:
    - Unify AI suggestion confidence to number everywhere. Update autoSnap.js to
return a numeric metadata.confidence (0–1), and render as percentage in UI.
    - Consider tsconfig: set target: es2018 (or higher), enable strict: true, and
gradually drop allowJs by migrating remaining JS or excluding them.
- Features vs UI:
    - Toolbar accept should reflect actual support; or add PLY/PCD loaders guarded
behind optional code paths.
    - Collaboration: either add yjs/y-webrtc deps and integrate behind a feature flag,
or remove the service until used.
- Tests and tooling:
    - Remove the CRA test. Add at least a few vitest tests for hooks (useThreeScene,
useAnnotations), and a simple render test for SceneComponent with a mocked
threeService.
    - Add lint/type-check to CI. For Vite projects, run tsc --noEmit and vite build in
CI to catch breaks early.
- Docs and env:
    - Update root README.md as the canonical doc. Remove/replace CRA simulation/
README.md.
    - Rename envs to Vite format (.env.local → .env, vars VITE_SUPABASE_URL /
VITE_SUPABASE_ANON_KEY) if you plan to use them.

- FSD Architecture improvement 
- Restructure modules
    - Move refactored/components/* into widgets/viewer/* (Toolbar, Sidebar, Viewport,
StatusBar, ErrorToast, AnnotationRenderer).
    - Move refactored/hooks/useAnnotations.ts and services/annotationService.ts to
features/annotation/*.
    - Keep Three.js layer (useThreeScene, threeService, types) in entities/scene/*.
    - Keep global tokens/helpers in shared/* (constants, utils, styles).
- Public APIs
    - Each slice exports only from its index.ts. Consumers import from @features/
annotation, @entities/scene, @widgets/viewer.
    - Prohibit deep imports to inner files.
- Pages/routes
    - pages/project composes widgets/viewer and pulls data via features/annotation and
entities/scene public APIs.
    - pages/auth/* should consume only features/auth (when you add it) and shared/
ui components.
- Enforce boundaries
    - Add eslint-plugin-feature-sliced or equivalent custom ESLint rules to forbid
cross‑layer leaks and deep imports.
- Aliases
    - Keep the current aliases but ensure they resolve to the slice roots. Avoid
@components/... entirely once migrated.
- Clean leftovers
    - Remove legacy CRA files and duplicate JS versions so the layer graph is clear.
scene (Three.js scene) → @shared (constants/utils).

Bottom line: you’ve set up the right FSD scaffolding (layers and aliases). Converting
the remaining “refactored components” into actual features/entities/widgets, exposing
public APIs, and enforcing import rules will make it a proper Feature‑Sliced Design
implementation.

## License
Distributed under the MIT License. See LICENSE for more information.
