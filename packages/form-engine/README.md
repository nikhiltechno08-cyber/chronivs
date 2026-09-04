# @chronivs/form-engine

**Dynamic Form Engine** for Chronivs V2. Generates form definitions, validation, and render descriptors from [Recipe](@chronivs/recipe-engine) definitions.

- Pure TypeScript — no UI, no React runtime
- **Does not modify Studio** — current Experience Studio continues working unchanged
- Renderer adapters are **prepared only** for future integration

---

## How a Recipe automatically becomes a Form

```
┌──────────────────┐
│  Recipe (.recipe) │  ← declarative: requiredFields, mediaLimits, defaults
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ buildFormFromRecipe() │  ← Form Builder
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  FormDefinition   │  ← fields[] with id, type, label, validation, accept, maxFiles…
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌─────────────────────┐
│validateForm()│ │ reactStudioFormAdapter │  ← future Studio wiring
└─────────┘ └─────────────────────┘
```

### Step-by-step

1. **Recipe** declares `requiredFields` and `optionalFields` (e.g. `FIELD_SENDER_NAME`, `FIELD_PHOTOS`)
2. **`buildFormFromRecipe(recipe)`** maps each recipe field → `FormField`:
   - `text` → Text Input
   - `textarea` / `letter` → Textarea
   - `date` → Date Picker
   - `photo_collection` / `image_slot` → Image Upload
   - `audio` → Audio Upload
3. **`FormField.validation`** is auto-built from recipe constraints (required, min/max length, file count, MIME types, file size)
4. **`validateForm(form, values)`** runs client-side validation
5. **(Future)** `reactStudioFormAdapter.mapField(field)` → `{ componentKey: 'FloatingInput', props: {...} }`

---

## Quick start

```typescript
import { getRecipe } from '@chronivs/recipe-engine';
import {
  buildFormFromRecipe,
  validateForm,
  reactStudioFormAdapter,
} from '@chronivs/form-engine';

const recipe = getRecipe('proposal-girlfriend')!;
const form = buildFormFromRecipe(recipe);

// Generated fields (example)
form.fields.forEach((field) => {
  console.log(field.id, field.type, field.required);
});
// sender_name   text          true
// receiver_name text          true
// photos        image_upload  true
// puzzle_image  image_upload  true
// letter        textarea      true
// audio         audio_upload  true

// Validate user input
const result = validateForm(form, {
  sender_name: 'Alex',
  receiver_name: 'Jordan',
  letter: 'Will you marry me?',
  photos: [{ name: '1.jpg', size: 102400, mimeType: 'image/jpeg' }],
  audio: 'voice.webm',
  puzzle_image: [{ name: 'puzzle.jpg', size: 204800, mimeType: 'image/jpeg' }],
});

// Future Studio integration (NOT wired yet)
const descriptor = reactStudioFormAdapter.mapField(form.fields[0]!);
// { componentKey: 'FloatingInput', props: { id, label, required, ... } }
```

---

## FormField schema

Every generated field includes:

| Property | Description |
|----------|-------------|
| `id` | Stable key (matches recipe / experience content) |
| `type` | `text`, `textarea`, `date`, `image_upload`, `audio_upload`, `checkbox`, `select`, `radio`, `hidden` |
| `label` | Display label from recipe |
| `placeholder` | Input placeholder |
| `description` | Longer context |
| `required` | Whether field blocks submit |
| `validation` | `{ rules: FormValidationRule[] }` |
| `defaultValue` | Seeded from recipe defaults |
| `accept` | MIME types for file fields |
| `maxFiles` | Max upload count |
| `maxLength` / `minLength` | Text constraints |
| `helpText` | Inline hint |
| `maxFileSize` | Max bytes per file |

---

## Validation utilities

| Function | Purpose |
|----------|---------|
| `validateField(field, value)` | Single field |
| `validateForm(form, values)` | Entire form |
| `validateFormFields(form, values, ids)` | Wizard step subset |
| `isFormValid(form, values)` | Boolean convenience |
| `getFieldError(form, values, fieldId)` | First error message |

### Supported rule types

- `required`
- `min_length` / `max_length`
- `min_files` / `max_files`
- `max_file_size`
- `allowed_types` (MIME)
- `pattern` (regex)

---

## Renderer adapters (prepared, not integrated)

| Adapter | Purpose |
|---------|---------|
| `descriptorFormAdapter` | Generic neutral component keys |
| `reactStudioFormAdapter` | Maps to Studio component names (`FloatingInput`, `MediaUploader`, etc.) |

**The current Studio does NOT import these adapters.** When ready to integrate:

1. Call `buildFormFromTemplateId(templateId)` in a new adapter hook
2. Map `reactStudioFormAdapter.mapFields(form.fields)` to existing components
3. Replace hardcoded `DetailsForm` / `MediaUploader` wiring **via adapter only** — no visual changes

---

## Package structure

```
packages/form-engine/src/
├── builder/
│   ├── build-form.ts          # buildFormFromRecipe()
│   ├── map-recipe-field.ts    # RecipeField → FormField
│   └── render-descriptor.ts   # Form → render descriptors
├── validation/
│   ├── validate-field.ts
│   └── validate-form.ts
├── adapters/
│   ├── descriptor-adapter.ts  # Generic
│   └── react-studio.adapter.ts # Prepared Studio mapping
└── types/form-field.ts
```

---

## Zero duplication for new templates

When a new recipe is added to `@chronivs/recipe-engine`:

```typescript
const form = buildFormFromTemplateId('my-new-template');
// Form is automatically generated — no new form code required
```

---

## Architecture layers

| Layer | Package | Status |
|-------|---------|--------|
| Domain entity | `@chronivs/experience-core` | ✅ Built |
| Template metadata | `@chronivs/recipe-engine` | ✅ Built |
| Dynamic forms | `@chronivs/form-engine` | ✅ Built (this package) |
| Studio UI | `apps/frontend` | Unchanged |
| Integration adapter | Future | Not started |
