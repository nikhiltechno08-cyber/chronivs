# Chronivs V2 — Experience Integration Layer Architecture

**Package:** `@chronivs/experience-integration`  
**Phase:** 2 (Architecture — complete)  
**Status:** Orchestration hub — not wired to Studio UI

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STUDIO (unchanged UI)                              │
│                     Future: studio.adapter.ts only                           │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXPERIENCE CONTROLLER (heart)                           │
│  createExperience · loadRecipe · loadDraft · saveDraft · updateContent    │
│  updateMedia · preview · validate · reset                                   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │  Experience  │  │  Experience  │  │   Future     │
         │   Context    │  │   Service    │  │   Ports      │
         │  (snapshot)  │  │ (orchestrate)│  │ Auth·API·Pay │
         └──────────────┘  └──────┬───────┘  └──────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
 ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
 │ RecipePort  │          │  FormPort   │          │  DraftPort  │
 │ recipe-eng  │          │ form-engine │          │ draft-engine│
 └─────────────┘          └─────────────┘          └─────────────┘
        │                         │                         │
        ▼                         ▼                         ▼
 ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
 │ UploadPort  │          │RendererPort │          │ PreviewPort │
 │upload-engine│          │  renderer   │          │preview-eng  │
 └─────────────┘          └─────────────┘          └─────────────┘
                                  │
                                  ▼
                         ┌─────────────┐
                         │ValidationPort│
                         │ exp-core +  │
                         │ form-engine │
                         └─────────────┘
```

---

## Module Dependencies

| Module | Package | Port Interface | Default Adapter |
|--------|---------|----------------|-----------------|
| Experience Core | `@chronivs/experience-core` | `ValidationPort` | `DefaultValidationAdapter` |
| Recipe Engine | `@chronivs/recipe-engine` | `RecipePort` | `DefaultRecipeAdapter` |
| Form Engine | `@chronivs/form-engine` | `FormPort` | `DefaultFormAdapter` |
| Upload Engine | `@chronivs/upload-engine` | `UploadPort` | `DefaultUploadAdapter` |
| Draft Engine | `@chronivs/draft-engine` | `DraftPort` | `DefaultDraftAdapter` |
| Experience Renderer | `@chronivs/experience-renderer` | `RendererPort` | `DefaultRendererAdapter` |
| Preview Engine | `@chronivs/preview-engine` | `PreviewPort` | `DefaultPreviewAdapter` |

**Integration layer depends on all Phase 2 packages. No package depends on Studio or integration layer** (acyclic).

---

## Orchestration Flow

```
Choose Template
      ↓
Load Recipe          → RecipePort.loadRecipe(templateId)
      ↓
Generate Form        → FormPort.buildForm(recipe)
      ↓
Create Draft         → DraftPort.createDraft(payload)
      ↓
Upload Media         → UploadPort.upload(file)
      ↓
Update Draft         → DraftPort.updateDraft(patch)
      ↓
Live Preview         → PreviewPort.scheduleUpdate(payload)
      ↓
Render Experience    → RendererPort.render(experience)
      ↓
Validate             → ValidationPort.validateForm + validateExperience
      ↓
Ready
```

---

## Lifecycle Flow

```
Initialize ──→ LoadRecipe ──→ CreateDraft ──→ LoadAssets ──→ SyncPreview ──→ Validate ──→ Ready
     │              │              │              │               │              │
     └──────────────┴──────────────┴──────────────┴───────────────┴──────────────┴──→ Error
                                                                                        │
                                                                                     Reset
```

| Phase | Trigger | Context Updates |
|-------|---------|-----------------|
| `initialize` | `controller.initialize()` | Wire subscriptions |
| `load_recipe` | `loadRecipe()` / `createExperience()` | `recipe`, `form`, `templateId` |
| `create_draft` | `createDraft()` / `loadDraft()` | `draft`, `formValues` |
| `load_assets` | `updateMedia()` / `updateContent()` | `uploads`, draft payload |
| `sync_preview` | `preview()` / auto-sync | `preview`, `rendered`, `experience` |
| `validate` | `validate()` with errors | `validation` |
| `ready` | validation passes | lifecycle = ready |

---

## Data Flow

```
Studio Form Values
       │
       ▼
ExperienceController.updateContent({ values })
       │
       ▼
ExperienceService ──→ DraftPort.updateDraft({ payload })
       │                      │
       │                      ▼
       │               Draft Engine (localStorage)
       │
       ├──→ PreviewPort.scheduleUpdate(payload)
       │           │
       │           ▼
       │    Preview Engine (debounced, selective scenes)
       │
       └──→ buildExperienceFromSession(draft, uploads)
                   │
                   ▼
            RendererPort.render(experience)
                   │
                   ▼
            ExperienceContext.patch({ rendered, preview, experience })
                   │
                   ▼
            Studio reads getContext() — never touches modules directly
```

---

## Extension Guide

### Add a new template

1. Add recipe in `@chronivs/recipe-engine`
2. Add scene mappings in `recipe-engine/src/mappings/`
3. **No changes to integration layer** — controller auto-loads via `templateId`

### Replace Upload with Cloudinary

```typescript
class CloudinaryUploadAdapter implements UploadPort {
  readonly name = 'cloudinary';
  async upload(file: File) { /* Cloudinary SDK */ }
  // ... implement UploadPort
}

const controller = createExperienceController({
  ...createDefaultModulePorts(),
  upload: new CloudinaryUploadAdapter(config),
});
```

Studio unchanged — only bootstrap adapter swaps port.

### Replace Draft with Backend API

Implement `DraftPort` against REST endpoints. Inject via `createExperienceController({ ...ports, draft: apiDraftAdapter })`.

### Replace Preview with Server Render

Implement `PreviewPort` using `ServerPreviewProvider` from `@chronivs/preview-engine`.

### Add Razorpay Publish

Implement `PublishPort` (stub exists in `future.adapters.ts`):

```typescript
class RazorpayPublishAdapter implements PublishPort {
  async publish(experience) {
    return { checkoutUrl: '...', success: true };
  }
}
```

Wire in service extension — Studio calls `controller.publish()` via future method.

---

## Future Backend Mapping

| Concern | Port | Future Implementation |
|---------|------|----------------------|
| Persist experiences | `ExperienceApiPort` | `POST /v1/experiences` |
| Load experiences | `ExperienceApiPort` | `GET /v1/experiences/:id` |
| Auth / user | `AuthPort` | JWT session / OAuth |
| Media upload | `UploadPort` | Cloudinary signed upload |
| Draft sync | `DraftPort` | `PUT /v1/drafts/:id` |
| Preview render | `PreviewPort` | `POST /v1/preview/render` |
| Payment / publish | `PublishPort` | Razorpay checkout |

All stubs live in `src/ports/adapters/future.adapters.ts`.

---

## Studio Integration (future — one adapter file)

```typescript
// apps/frontend/src/features/studio/adapters/experience-controller.adapter.ts
import { createExperienceController } from '@chronivs/experience-integration';

export const studioExperienceController = createExperienceController();

// Bridge existing store → controller (no UI changes)
studioStore.subscribe((state) => {
  void studioExperienceController.updateContent({
    values: studioDraftToFormValues(state),
  });
});
```

Existing `useStudioStore`, templates, and animations remain untouched.

---

## Design Principles

1. **Ports & Adapters** — modules communicate through interfaces only
2. **Single entry point** — Studio → Controller → Service → Ports
3. **Replaceable implementations** — local today, cloud tomorrow
4. **Immutable context snapshots** — predictable React subscriptions
5. **Additive only** — Phase 2 packages unchanged; integration is a thin orchestration layer
