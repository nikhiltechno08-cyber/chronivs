# @chronivs/draft-engine

Local-first draft persistence for Chronivs V2. Users should never lose their work — drafts autosave to browser storage with versioning, recovery, and offline support.

**Architecture phase only** — no backend, no API calls, no Studio UI wiring. The frontend remains visually identical until an adapter connects this engine behind existing components.

---

## Responsibilities

| Operation | Method |
|-----------|--------|
| Create Draft | `DraftManager.createDraft()` |
| Load Draft | `DraftManager.loadDraft()` |
| Save Draft | `DraftManager.saveDraft()` / `save()` |
| Update Draft | `DraftManager.updateDraft()` |
| Delete Draft | `DraftManager.deleteDraft()` |
| Clone Draft | `DraftManager.cloneDraft()` / `clone()` |
| Archive Draft | `DraftManager.archiveDraft()` |
| Restore Draft | `DraftManager.restoreArchivedDraft()` / `restore()` |

Automatic saving is handled by `autosave()` (debounced) and `DraftManager.enableAutosave()`.

---

## Core interfaces

### `Draft`

```typescript
interface Draft<TPayload = Record<string, unknown>> {
  id: DraftId;
  metadata: DraftMetadata;
  payload: TPayload;
  snapshot: DraftSnapshot<TPayload>;
  history: DraftHistory<TPayload>;
  version: number;
  status: DraftStatus;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  isDirty: boolean;
  offline: boolean;
  syncStatus: SyncStatus;
  schemaVersion: number;
}
```

### `DraftMetadata`

Searchable, sync-friendly metadata: `title`, `templateId`, `occasion`, `experienceId`, `userId`, `deviceId`, `tags`, `remoteRevision`, `syncStatus`, `syncedAt`, `clonedFrom`.

### `DraftVersion`

Version log entry: `version`, `createdAt`, `changeSummary`, `checksum`.

### `DraftHistory`

`versions[]`, `snapshots[]`, `currentVersion`, `maxVersions` — supports rollback and recovery.

### `DraftSnapshot`

Point-in-time payload capture: `version`, `capturedAt`, `payload`, `checksum`, `label`.

---

## Module layout

```
packages/draft-engine/src/
├── constants/       Schema version, autosave defaults, storage keys
├── enums/           DraftStatus, SyncStatus
├── types/           Draft, metadata, history, storage contracts
├── utils/           IDs, timestamps, checksums, merge helpers
├── operations/      create, clone, serialize, deserialize, restore
├── storage/         LocalDraftStorageProvider, ApiDraftStorageProvider (stub)
├── autosave/        save, load, clear, autosave, offline bindings
├── manager/         DraftManager orchestrator
└── store/           createDraftStore() — Zustand + localStorage persist
```

---

## Quick start (local)

```typescript
import { createLocalDraftManager, DraftStatus } from '@chronivs/draft-engine';

const manager = createLocalDraftManager();
await manager.initialize();

const draft = await manager.createDraft({
  payload: { senderName: 'Alex', step: 1 },
  metadata: { title: 'Birthday draft', templateId: 'birthday-girlfriend' },
});

// Autosave on change (debounced 1.5s)
manager.scheduleAutosave({
  payload: { senderName: 'Alexandra' },
});

// Manual save
await manager.saveDraft();

// Recovery from version 1
manager.restoreFromHistory({ version: 1 });
```

### Zustand store (parallel persistence layer)

```typescript
import { createDraftStore } from '@chronivs/draft-engine';

const useDraftStore = createDraftStore<{ senderName: string; step: number }>({
  persistKey: 'chronivs-draft-store',
});

useDraftStore.getState().upsertDraft(draft);
```

---

## Helper methods

| Function | Purpose |
|----------|---------|
| `save()` | Persist draft via storage provider |
| `load()` | Load draft by id |
| `autosave()` | Debounced save scheduler |
| `clear()` | Wipe all drafts from storage |
| `restore()` | Roll back to historical snapshot |
| `clone()` | Duplicate draft with new id |
| `serialize()` | JSON wire format with type discriminator |
| `deserialize()` | Parse JSON back to `Draft` |

---

## Architecture capabilities

### Offline mode

- `draft.offline` reflects `navigator.onLine`
- `bindOfflineDetection()` updates drafts when connectivity changes
- Local provider persists regardless of network state

### Versioning

- Each payload change bumps `version` and appends to `history.versions`
- Full snapshots retained up to `maxVersions` (default 20)
- `restore({ version: N })` rolls back payload

### Recovery

- `restoreFromHistory()` on `DraftManager`
- `beforeunload` listener flushes pending autosaves
- Safe storage retries on localStorage quota errors

### Future synchronization

- `SyncStatus`: `local` → `pending` → `synced` | `conflict`
- `metadata.remoteRevision` for etag-based merge
- `markPendingSync()` flags drafts for upload queue

---

## Backend synchronization (future)

The Draft Engine uses the **storage provider adapter pattern**. Studio never talks to the API directly — only the injected `DraftStorageProvider` changes.

### Step 1 — Implement the API provider

`ApiDraftStorageProvider` already implements `DraftStorageProvider`. Replace stub bodies:

```typescript
// packages/draft-engine/src/storage/api-provider.ts (future)
async get(id: DraftId): Promise<Draft | null> {
  const response = await fetch(`${this.config.baseUrl}/drafts/${id}`, {
    headers: { Authorization: `Bearer ${this.config.getAuthToken?.()}` },
  });
  if (response.status === 404) return null;
  const json = await response.json();
  return deserialize(json);
}

async put(draft: Draft): Promise<void> {
  await fetch(`${this.config.baseUrl}/drafts/${draft.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: serialize(draft),
  });
}
```

### Step 2 — Bootstrap swap (one line)

```typescript
// Before (architecture / local)
const manager = createLocalDraftManager();

// After (production)
import { DraftManager, createApiDraftStorage } from '@chronivs/draft-engine';

const manager = new DraftManager(
  createApiDraftStorage({
    baseUrl: process.env.NEXT_PUBLIC_API_URL + '/v1',
    getAuthToken: () => sessionStorage.getItem('token'),
  }),
);
```

### Step 3 — Offline-first sync queue (future)

```
User edit → autosave → LocalDraftStorageProvider (immediate)
                     → SyncQueue.enqueue(draft) when online
                     → ApiDraftStorageProvider.put() (background)
                     → update syncStatus: synced | conflict
```

Conflict resolution uses `metadata.remoteRevision` and `version` — the engine surface stays unchanged; only the sync worker is new.

### Step 4 — Studio adapter (no UI changes)

```typescript
// apps/frontend/src/features/studio/adapters/draft-engine.adapter.ts (future)
import type { StudioDraft } from '../types';
import type { Draft } from '@chronivs/draft-engine';

export function studioDraftToPayload(draft: StudioDraft): Record<string, unknown> {
  return { ...draft };
}

export function payloadToStudioDraft(payload: Record<string, unknown>): Partial<StudioDraft> {
  return payload as Partial<StudioDraft>;
}
```

Existing `useStudioStore` and `safe-storage.ts` remain untouched until the adapter is wired at the composition root.

### Why Studio stays unchanged

| Layer | Changes when backend ships? |
|-------|----------------------------|
| Studio templates / UI | No |
| `DraftManager` API | No |
| `DraftStorageProvider` | Yes — swap local → API |
| Sync worker (new) | Yes — background module |
| Auth env vars | Yes |

---

## Alignment with other packages

| Package | Relationship |
|---------|--------------|
| `@chronivs/experience-core` | `DraftState` maps via future adapter to `Draft.payload` |
| `@chronivs/form-engine` | Form values stored in `Draft.payload` |
| `@chronivs/upload-engine` | Media asset refs stored in payload; blobs not in localStorage |

---

## Scripts

```bash
npm run typecheck -w @chronivs/draft-engine
npm run lint -w @chronivs/draft-engine
```

---

## Design principles

1. **Additive only** — no modifications to Studio UI or existing persist logic.
2. **Provider injection** — storage backend swappable without API surface changes.
3. **Never lose work** — autosave, safe storage, version history, beforeunload flush.
4. **Offline-first** — local persistence always succeeds; sync is eventual.
5. **Generic payload** — `Draft<TPayload>` works with Studio, experience-core, or API formats.
