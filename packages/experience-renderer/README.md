# @chronivs/experience-renderer

Recipe-driven Dynamic Experience Renderer for Chronivs V2. Transforms `Experience` domain data into scoped, scene-level props — without exposing the full aggregate to individual scenes.

**Architecture phase only** — no UI changes, no template modifications, no animations touched.

---

## Two-layer architecture

```
Experience (domain)
        │
        ▼
┌───────────────────────────────────────┐
│  Layer 1 — Data Mapping               │
│  mapContent() · mapMedia()            │
│  mapSettings() · mapTheme() · mapAudio│
└───────────────────────────────────────┘
        │
        ▼  RenderMediaData · RenderContentData · RenderSettingsData
┌───────────────────────────────────────┐
│  Layer 2 — Scene Rendering            │
│  Recipe sceneMappings → scoped props  │
│  getSceneData() · renderScene()       │
└───────────────────────────────────────┘
        │
        ▼
RenderSceneResult { props, metadata }   ← only what each scene needs
```

---

## Public API

| Function / Method | Layer | Purpose |
|-------------------|-------|---------|
| `renderExperience()` | Both | Full scene plan for an experience |
| `renderScene()` | 2 | Single scene scoped props |
| `getSceneData()` | 2 | Same as renderScene (data-only) |
| `mapContent()` | 1 | Text fields + scene payloads |
| `mapMedia()` | 1 | Photos, puzzle image, audio |
| `mapSettings()` | 1 | Theme + share settings |
| `mapTheme()` | 1 | Theme tokens only |
| `mapAudio()` | 1 | Primary audio track |

---

## Scene scoping rule

**Never pass the full `Experience` to scene components.**

Each scene receives only the props declared in its recipe mapping:

| Scene type | Example props |
|------------|---------------|
| Hero | `receiverName`, `occasion`, `theme` |
| Gallery | `photos[]` |
| Letter | `message`, `senderName`, `receiverName` |
| Proposal | `senderName`, `receiverName`, `theme` |

Mappings live in `@chronivs/recipe-engine` — adding a template requires a new mapping file, not renderer changes.

---

## Birthday template example

Recipe: `birthday-girlfriend`  
Mapping: `packages/recipe-engine/src/mappings/birthday-girlfriend.mapping.ts`

```typescript
import { renderExperience, getSceneData } from '@chronivs/experience-renderer';

const rendered = renderExperience(birthdayExperience);

// Hero scene — only 4 props, not the full Experience
const hero = getSceneData(birthdayExperience, 'surprise');
// hero.props = {
//   receiverName: 'Sarah',
//   occasion: 'birthday',
//   theme: { presetId: 'romantic-plum', mode: 'dark' },
//   senderName: 'Alex',
// }

// Gallery scene — only photos + receiver
const gallery = getSceneData(birthdayExperience, 'memories');
// gallery.props = {
//   photos: [{ url: '...', order: 0 }, ...],
//   receiverName: 'Sarah',
// }

// Letter scene
const letter = getSceneData(birthdayExperience, 'love');
// letter.props = {
//   message: 'Happy birthday my love...',
//   senderName: 'Alex',
//   receiverName: 'Sarah',
// }
```

**Scene sequence** (from recipe, same renderer):

`surprise → birthday → beginning → memories → love → heart → celebration → forever`

---

## Proposal template example

Recipe: `proposal-girlfriend`  
Mapping: `packages/recipe-engine/src/mappings/proposal-girlfriend.mapping.ts`

```typescript
import { createExperienceRenderer } from '@chronivs/experience-renderer';

const renderer = createExperienceRenderer('proposal-girlfriend');
const rendered = renderer.renderExperience(proposalExperience);

// Hero / Lantern — same renderer, different mapping
const lantern = renderer.getSceneData(proposalExperience, 'prop-lantern');
// lantern.props = { receiverName, occasion, theme }

// Letter scene
const letter = renderer.getSceneData(proposalExperience, 'prop-letter');
// letter.props = { letter, senderName, receiverName }

// Proposal scene — minimal surface
const proposal = renderer.getSceneData(proposalExperience, 'prop-proposal');
// proposal.props = { senderName, receiverName, theme }

// Puzzle surprise
const puzzle = renderer.getSceneData(proposalExperience, 'prop-one-last-surprise');
// puzzle.props = { puzzleImage, receiverName }
```

**Same renderer class. Same Layer 1 mappers. Different recipe mappings.**

14 proposal scenes vs 8 birthday scenes — renderer logic unchanged.

---

## Fallbacks and placeholders

Resolution order per prop:

1. Experience field value
2. Scene mapping `fallback`
3. Scene mapping `placeholder`
4. Mapping `globalDefaults`
5. `DEFAULT_PLACEHOLDERS` constants

`SceneRenderMetadata.usedPlaceholders` lists props that used fallbacks — useful for studio warnings.

---

## Adding a new template

1. Create recipe in `@chronivs/recipe-engine` (existing flow)
2. Create mapping file: `src/mappings/my-template.mapping.ts`
3. Register in `SCENE_MAPPING_REGISTRY`
4. **Do not modify `@chronivs/experience-renderer`**

Optional scenes without mappings use inference heuristics (field names, scene id patterns).

---

## Frontend integration (future adapter)

Existing template components remain unchanged. An adapter injects props:

```typescript
// apps/frontend/src/features/experience-engine/adapters/scene-props.adapter.ts (future)
import type { RenderSceneResult } from '@chronivs/experience-renderer';

export function injectSceneProps<T extends Record<string, unknown>>(
  SceneComponent: React.ComponentType<T>,
  result: RenderSceneResult,
): React.ReactElement {
  return <SceneComponent {...(result.props as T)} />;
}
```

Templates keep their placeholders during architecture phase. The adapter replaces hardcoded demo data at the composition root when wired.

---

## Alignment

| Package | Role |
|---------|------|
| `@chronivs/experience-core` | `Experience` aggregate input |
| `@chronivs/recipe-engine` | Recipes + `RecipeSceneMappings` |
| `@chronivs/form-engine` | Studio fields → `Experience.content.fields` |
| `@chronivs/upload-engine` | Media URLs → `Experience.media` |

---

## Scripts

```bash
npm run typecheck -w @chronivs/experience-renderer
npm run lint -w @chronivs/experience-renderer
```

---

## Design principles

1. **Recipe-driven mappings** — templates declare what each scene needs
2. **Minimal prop surface** — scenes never receive the full Experience
3. **Layer separation** — mapping logic independent of scene delivery
4. **Additive only** — no changes to existing template UI or animations
5. **Same renderer for all templates** — Birthday, Proposal, Anniversary, etc.
