# @chronivs/preview-engine

Live Preview Engine for Chronivs V2. Provides real-time rendering of every experience while the user edits — no page reload, no manual refresh, no regeneration.

**Architecture phase only** — not wired to Studio UI. The frontend remains visually identical until an adapter connects this engine at the composition root.

---

## Design goal

When the user changes **name**, **message**, **date**, **photos**, **audio**, or **theme**, the preview updates instantly while preserving:

- Current scene position
- Animation state (`animationGeneration` only bumps on explicit restart)
- Music play/mute state
- Scene progress within the current scene
- 60fps animations (selective scene updates, memoized gates)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Draft Engine (@chronivs/draft-engine)                      │
│  DraftManager.subscribe() → payload changes                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Preview Engine (@chronivs/preview-engine)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Optimistic  │→ │ Debounced    │→ │ Change Detector     │ │
│  │ Patch       │  │ Sync         │  │ (affected scenes)   │ │
│  └─────────────┘  └──────────────┘  └──────────┬──────────┘ │
│                                                 │            │
│  ┌─────────────────────────────────────────────▼──────────┐  │
│  │ Draft → Experience Adapter                              │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Experience Renderer (@chronivs/experience-renderer)     │ │
│  │ Layer 1: mapContent / mapMedia / mapSettings            │ │
│  │ Layer 2: getSceneData (scoped props per scene)          │ │
│  └───────────────────────────┬─────────────────────────────┘ │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Scene Sync — patchSceneMap (stable refs for unchanged)  │ │
│  │ Playback Preservation — scene index, music, mute        │ │
│  └───────────────────────────┬─────────────────────────────┘ │
└──────────────────────────────┼───────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  React Layer (future adapter — NOT wired to Studio yet)     │
│  PreviewEngineProvider · PreviewSceneGate · usePreview*     │
└─────────────────────────────────────────────────────────────┘
```

---

## Module layout

```
packages/preview-engine/src/
├── adapters/          draftPayloadToExperience, server preview stub
├── constants/         debounce timings, viewport dimensions, placeholders
├── enums/             PreviewViewportMode, PreviewSyncStatus, PreviewUpdateStrategy
├── types/             PreviewState, PlaybackState, PreviewControls
├── sync/              change detection, scene patch, media/theme sync
├── state/             Zustand preview store + controls factory
├── engine/            PreviewEngine orchestrator
└── react/             Provider, hooks, PreviewSceneGate (memo)
```

---

## Data flow

### 1. Draft change detected

```typescript
draftManager.subscribe((draft) => {
  previewEngine.scheduleUpdate(draft.payload);
});
```

### 2. Optimistic update (immediate)

Text keystrokes apply `applyOptimisticPatch()` — only affected scenes get new props in the store.

### 3. Debounced confirm (80–200ms)

Full sync runs through Experience Renderer. Unchanged scenes keep **stable object references** via `patchSceneMap()`.

### 4. Selective React render

`PreviewSceneGate` + `usePreviewSceneProps(sceneId)` subscribe per scene. Unaffected scenes skip reconciliation.

### Change → Scene mapping

| Field changed | Affected scenes (example: birthday) |
|---------------|-----------------------------------|
| `receiverName` | surprise, birthday, memories, love, celebration |
| `customMessage` | love, forever |
| `photos` | memories, celebration |
| `theme` | scenes with `theme` prop only |
| `templateId` | Full reset |

Mappings derived from `@chronivs/recipe-engine` scene mappings + field `consumedByScenes`.

---

## Public API

### Core

| API | Purpose |
|-----|---------|
| `createPreviewEngine()` | Factory |
| `PreviewEngine.bindDraftManager()` | Auto-sync from Draft Engine |
| `PreviewEngine.scheduleUpdate()` | Debounced live update |
| `PreviewEngine.applyOptimisticPatch()` | Immediate text/media patch |
| `PreviewEngine.getSceneData()` | Scoped scene props |
| `PreviewEngine.getControls()` | Restart, jump, mute, viewport |

### Preview controls

| Control | Method |
|---------|--------|
| Restart Experience | `controls.restartExperience()` |
| Restart Current Scene | `controls.restartCurrentScene()` |
| Jump to Scene | `controls.jumpToScene(id)` |
| Toggle Music | `controls.toggleMusic()` |
| Mute / Unmute | `controls.setMuted()` / `toggleMute()` |
| Fullscreen | `controls.setFullscreen()` / `toggleFullscreen()` |
| Viewport | `controls.setViewport('mobile' \| 'tablet' \| 'desktop')` |

### React (future adapter)

| Hook / Component | Purpose |
|------------------|---------|
| `PreviewEngineProvider` | Context + lifecycle |
| `usePreviewDraftBinding()` | Wire DraftManager |
| `usePreviewSceneProps(sceneId)` | Memoized per-scene subscription |
| `PreviewSceneGate` | `React.memo` gate — children only re-render when scene props change |
| `usePreviewControls()` | Control surface |
| `usePreviewPlayback()` | Scene index, music, mute |

---

## Usage example (architecture)

```tsx
import { createLocalDraftManager } from '@chronivs/draft-engine';
import {
  PreviewEngineProvider,
  PreviewSceneGate,
  usePreviewDraftBinding,
} from '@chronivs/preview-engine/react';

function PreviewRoot() {
  const draftManager = useMemo(() => createLocalDraftManager(), []);
  usePreviewDraftBinding(draftManager);

  return (
    <PreviewEngineProvider>
      <PreviewSceneGate sceneId="surprise">
        {(props) => (
          /* Existing SurpriseScene — props only, no Experience object */
          <SurpriseSceneAdapter receiverName={props.receiverName as string} />
        )}
      </PreviewSceneGate>
    </PreviewEngineProvider>
  );
}
```

Studio UI components are **not modified** — adapters map scoped props to existing scene interfaces.

---

## Performance guarantees

1. **Selective sync** — `resolveAffectedScenes()` limits renderer work to changed scenes
2. **Stable references** — `patchSceneMap()` preserves object identity for unchanged scenes
3. **`PreviewSceneGate`** — `React.memo` + per-scene Zustand selector
4. **Debounced batching** — text 80ms, media 200ms, default 120ms
5. **Playback preservation** — no animation restart on field edits
6. **`animationGeneration`** — only increments on explicit scene/experience restart

---

## Preview modes

| Mode | Dimensions |
|------|------------|
| Desktop | 1280 × 720 |
| Tablet | 834 × 1194 |
| Mobile | 390 × 844 |

Set via `controls.setViewport(PreviewViewportMode.Mobile)`. Template CSS unchanged — frame wrapper applies `data-preview-viewport` attribute only.

---

## Future backend integration

The preview engine supports a **provider swap** for server-side rendering without UI changes.

### Step 1 — Implement server provider

```typescript
// packages/preview-engine/src/adapters/server-preview-provider.ts (future)
async renderPreview(experienceJson: string): Promise<RenderedExperience> {
  const response = await fetch('/api/v1/preview/render', {
    method: 'POST',
    body: experienceJson,
  });
  return response.json();
}
```

### Step 2 — Bootstrap swap

```typescript
// Client-side (now)
const engine = createPreviewEngine();

// Server-side (future)
const engine = createPreviewEngine({
  renderProvider: createServerPreviewProvider({ baseUrl: API_URL }),
});
```

### Step 3 — Studio adapter (no UI redesign)

```typescript
// apps/frontend/src/features/studio/adapters/live-preview.adapter.ts (future)
export function bindStudioToPreview(
  studioStore: StudioStore,
  previewEngine: PreviewEngine,
) {
  return studioStore.subscribe((state) => {
    previewEngine.scheduleUpdate(studioDraftToPreviewPayload(state));
  });
}
```

Existing `useStudioStore` and `useExperienceData` remain untouched until wired at composition root.

### Why UI stays identical

| Layer | Changes when backend preview ships? |
|-------|-------------------------------------|
| Studio templates / scenes | No |
| PreviewEngine API | No |
| Render provider | Yes — local → server |
| Studio adapter (new) | Yes — thin wiring file |

---

## Alignment

| Package | Role |
|---------|------|
| `@chronivs/draft-engine` | Source of truth — preview subscribes |
| `@chronivs/experience-renderer` | Draft → scoped scene props |
| `@chronivs/recipe-engine` | Scene mapping for selective updates |
| `@chronivs/upload-engine` | Media URLs in draft payload |
| `apps/frontend` | Unchanged visually |

---

## Scripts

```bash
npm run typecheck -w @chronivs/preview-engine
npm run lint -w @chronivs/preview-engine
```

---

## Design principles

1. **Alive preview** — optimistic + debounced updates, zero reload
2. **Selective rerender** — one field change ≠ full template rerender
3. **Animation preservation** — playback state survives edits
4. **Draft-driven** — subscribes to Draft Engine, not Studio directly
5. **Additive only** — adapters bridge existing scenes without modification
