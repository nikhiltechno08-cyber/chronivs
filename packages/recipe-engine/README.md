# @chronivs/recipe-engine

Declarative **Recipe Engine** for Chronivs V2. Describes every experience template without hardcoded forms.

- Pure TypeScript — no UI, no React, no backend
- One recipe file per template
- Consumes enums from `@chronivs/experience-core`
- Future Studio/backend integration happens via **adapter layers** (not included here)

---

## Package structure

```
packages/recipe-engine/src/
├── index.ts                 # Public API
├── types/recipe.ts          # Recipe, RecipeField, RecipeInput, etc.
├── constants/               # Field keys, validation codes
├── fields/common-fields.ts  # Reusable field definitions
├── recipes/                 # One file per template
│   ├── birthday-girlfriend.recipe.ts
│   ├── birthday-mother.recipe.ts
│   ├── birthday-father.recipe.ts
│   ├── proposal-girlfriend.recipe.ts
│   ├── anniversary-wife.recipe.ts
│   └── index.ts             # RECIPE_REGISTRY
└── engine/                  # Query + validation functions
    ├── get-recipe.ts
    ├── get-recipe-by-occasion.ts
    ├── get-recipe-fields.ts
    ├── get-media-limits.ts
    └── validate-recipe.ts
```

---

## Engine API

| Function | Description |
|----------|-------------|
| `getRecipe(templateId)` | Lookup recipe by template id |
| `getRecipeByOccasion(occasion, options?)` | Filter recipes by occasion/relationship |
| `resolveRecipe(occasion, relationship)` | Best single match |
| `getRecipeFields(templateId, options?)` | Required/optional field definitions |
| `getMediaLimits(templateId)` | Photo/audio/puzzle limits |
| `validateRecipe(templateId, input)` | Validate generic input against recipe rules |
| `listRecipes()` | All registered recipes |

---

## Registered recipes

| Template ID | Display Name | Occasion | Required inputs |
|-------------|--------------|----------|-----------------|
| `birthday-girlfriend` | Birthday · Girlfriend | Birthday | Sender, Receiver, Birthday, 5 Photos, Audio, Message |
| `birthday-mother` | Birthday · Mother | Birthday | Sender, Receiver, Date, Photos, Audio, Message |
| `birthday-father` | Birthday · Father | Birthday | Sender, Receiver, Date, Photos, Audio, Message |
| `proposal-girlfriend` | Proposal · Girlfriend | Proposal | Your Name, Her Name, 5 Photos, Puzzle Image, Letter, Audio |
| `anniversary-wife` | Anniversary · Wife | Anniversary | Your Name, Her Name, Date, Photos, Puzzle Image, Letter, Audio, Message |

---

## Add a new template in under 5 minutes

### Step 1 — Create the recipe file (~3 min)

Create `src/recipes/my-template.recipe.ts`:

```typescript
import {
  DEFAULT_AUDIO_MIME_TYPES,
  DEFAULT_IMAGE_MIME_TYPES,
  RECIPE_FIELD_KEYS,
  RECIPE_SCHEMA_VERSION,
} from '../constants';
import { FIELD_PHOTOS, FIELD_SENDER_NAME, FIELD_RECEIVER_NAME } from '../fields';
import type { Recipe } from '../types';
import { Occasion, Relationship } from '@chronivs/experience-core';

export const myTemplateRecipe: Recipe = {
  schemaVersion: RECIPE_SCHEMA_VERSION,
  templateId: 'my-template' as Recipe['templateId'],
  occasion: Occasion.Custom,
  relationships: [Relationship.Custom],
  displayName: 'My Template',
  description: 'Short description for catalog/studio.',
  estimatedDuration: '5–7 min',
  coverImage: '/recipes/covers/my-template.jpg',
  theme: { presetId: 'my-theme-preset', defaultMode: 'dark' },
  music: { trackId: null, allowsUserOverride: true },
  requiredFields: [FIELD_SENDER_NAME, FIELD_RECEIVER_NAME, FIELD_PHOTOS],
  optionalFields: [],
  mediaLimits: {
    maxPhotos: 5,
    minPhotos: 0,
    maxAudioTracks: 1,
    minAudioTracks: 0,
    requiresPuzzleImage: false,
    acceptedImageMimeTypes: DEFAULT_IMAGE_MIME_TYPES,
    acceptedAudioMimeTypes: DEFAULT_AUDIO_MIME_TYPES,
  },
  validationRules: [],
  defaultValues: {
    [RECIPE_FIELD_KEYS.SENDER_NAME]: null,
    [RECIPE_FIELD_KEYS.RECEIVER_NAME]: null,
    photos: [],
  },
  sceneSequence: [
    { sceneId: 'scene-one', label: 'Opening' },
    { sceneId: 'scene-two', label: 'Finale' },
  ],
  version: '1.0.0',
  isActive: true,
};
```

### Step 2 — Register in the registry (~30 sec)

In `src/recipes/index.ts`:

```typescript
import { myTemplateRecipe } from './my-template.recipe';

export const RECIPE_REGISTRY: readonly Recipe[] = [
  // ...existing recipes
  myTemplateRecipe,
];
```

### Step 3 — Verify (~1 min)

```bash
npm run typecheck --workspace=@chronivs/recipe-engine
npm run lint --workspace=@chronivs/recipe-engine
```

### Step 4 — (Future) Wire adapters only

Do **not** modify Studio UI directly. When integrating:

1. **Studio adapter** — maps wizard steps → `RecipeInput` using `getRecipeFields()`
2. **Experience adapter** — maps `RecipeInput` → `Experience` from `@chronivs/experience-core`
3. **Template adapter** — maps `Experience.content` → template-specific scene props

---

## Reusable fields

Import from `@chronivs/recipe-engine/fields`:

- `FIELD_SENDER_NAME`, `FIELD_RECEIVER_NAME` (+ occasion variants)
- `FIELD_BIRTHDAY_DATE`, `FIELD_ANNIVERSARY_DATE`, `FIELD_PROPOSAL_DATE`
- `FIELD_CUSTOM_MESSAGE`, `FIELD_LETTER`
- `FIELD_PHOTOS`, `FIELD_AUDIO`, `FIELD_PUZZLE_IMAGE`

Override labels per recipe: `{ ...FIELD_RECEIVER_NAME, label: 'Her Name' }`

---

## Validation example

```typescript
import { validateRecipe } from '@chronivs/recipe-engine';

const result = validateRecipe('proposal-girlfriend', {
  fields: {
    sender_name: 'Alex',
    receiver_name: 'Jordan',
    letter: 'Will you marry me?',
  },
  photos: ['https://cdn.example/1.jpg'],
  audio: 'https://cdn.example/voice.webm',
  puzzleImage: 'https://cdn.example/puzzle.jpg',
});

if (!result.valid) {
  console.log(result.errors);
}
```

---

## Relationship to Experience Core

| Layer | Package | Responsibility |
|-------|---------|----------------|
| Domain entity | `@chronivs/experience-core` | `Experience`, persistence, lifecycle |
| Template metadata | `@chronivs/recipe-engine` | Required fields, scenes, validation rules |
| Rendering | Frontend recipes (unchanged) | Cinematic UI — not touched by this package |
| Integration | Future adapters | Map between layers without UI changes |
