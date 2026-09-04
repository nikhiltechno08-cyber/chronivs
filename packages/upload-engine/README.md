# @chronivs/upload-engine

Local-first upload orchestration for Chronivs V2. Handles image and audio uploads with validation, compression, preview generation, reordering, deletion, retry, and progress tracking.

**Architecture phase only** — no backend, no Cloudinary API calls, no Studio UI wiring. The frontend remains visually identical until an adapter connects this engine behind existing components.

---

## Supported formats

| Kind  | Extensions        | MIME types                                      |
|-------|-------------------|-------------------------------------------------|
| Image | jpg, jpeg, png, webp | `image/jpeg`, `image/png`, `image/webp`      |
| Audio | mp3, wav, m4a     | `audio/mpeg`, `audio/wav`, `audio/mp4`, …       |

---

## Asset model

Every uploaded asset is an `UploadedAsset`:

```typescript
interface UploadedAsset {
  id: UploadAssetId;
  filename: string;
  mimeType: string;
  size: number;
  previewUrl: string | null;
  originalUrl: string | null;
  status: UploadStatus;
  progress: number;        // 0–100
  createdAt: ISOTimestamp;
  metadata: UploadAssetMetadata;
  kind: AssetKind;
  order: number;
  error?: string;
  retryCount?: number;
}
```

### Upload status enum

| Status      | Meaning                                      |
|-------------|----------------------------------------------|
| `idle`      | Record created, upload not started           |
| `uploading` | Pipeline in progress                         |
| `uploaded`  | Stored and ready                             |
| `failed`    | Error occurred — retriable                   |
| `removed`   | Soft-deleted by user                         |

---

## Module layout

```
packages/upload-engine/src/
├── constants/       MIME types, size limits, compression defaults
├── enums/           UploadStatus, AssetKind
├── types/           UploadedAsset, UploadProvider, pipeline types
├── validation/      validateFile()
├── pipeline/        compressImage(), compressAudio(), generatePreview()
├── operations/      reorderMedia(), removeMedia(), retryUpload()
├── providers/       LocalUploadProvider, CloudinaryUploadProvider (stub)
├── engine/          UploadEngine orchestrator
└── utils/           ID generation, collection helpers
```

---

## Quick start (local)

```typescript
import { createLocalUploadEngine, UploadStatus } from '@chronivs/upload-engine';

const engine = createLocalUploadEngine({ maxAssets: 5 });

engine.subscribe((collection) => {
  console.log(collection.filter((a) => a.status === UploadStatus.Uploaded));
});

const input = document.querySelector('input[type="file"]') as HTMLInputElement;
input.addEventListener('change', async () => {
  const file = input.files?.[0];
  if (!file) return;

  await engine.upload({
    file,
    onProgress: (progress, asset) => console.log(progress, asset.filename),
  });
});
```

---

## Helper utilities

| Function           | Purpose                                              |
|--------------------|------------------------------------------------------|
| `validateFile()`   | MIME, size, kind, and capacity checks                |
| `generatePreview()`| Thumbnail (image) or blob preview (audio)            |
| `compressImage()`  | Canvas resize/re-encode (local pipeline)             |
| `compressAudio()`  | Pass-through architecture (transcoder TBD)           |
| `reorderMedia()`   | Immutable collection reorder by index                |
| `removeMedia()`    | Soft-delete + optional blob URL revocation           |
| `retryUpload()`    | Re-run pipeline for failed assets                    |

---

## Upload pipeline

```
File
  │
  ▼
validateFile() ──fail──► UploadedAsset (status: failed)
  │
  ▼
compressImage() / compressAudio()     ← architecture stage
  │
  ▼
generatePreview()
  │
  ▼
UploadProvider.upload()               ← LocalUploadProvider (blob URLs)
  │
  ▼
UploadedAsset (status: uploaded, progress: 100)
```

Progress is reported at each stage: validation → compression (25%) → preview (40%) → provider (40–100%).

---

## Cloudinary integration (future)

The Upload Engine uses the **provider adapter pattern**. The frontend never talks to Cloudinary directly — only the injected `UploadProvider` changes.

### Step 1 — Implement the provider

`CloudinaryUploadProvider` already implements `UploadProvider`. Wire it by replacing the stub body:

```typescript
// packages/upload-engine/src/providers/cloudinary-provider.ts (future)
async upload(context: ProviderUploadContext): Promise<ProviderUploadResult> {
  const formData = new FormData();
  formData.append('file', context.blob, context.filename);
  formData.append('upload_preset', this.config.uploadPreset);
  if (this.config.folder) formData.append('folder', this.config.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${this.config.cloudName}/auto/upload`,
    { method: 'POST', body: formData },
  );

  const data = await response.json();

  return {
    originalUrl: data.secure_url,
    previewUrl: data.eager?.[0]?.secure_url ?? data.secure_url,
    size: data.bytes,
    metadata: {
      provider: 'cloudinary',
      providerPublicId: data.public_id,
      width: data.width,
      height: data.height,
    },
  };
}
```

### Step 2 — Bootstrap swap (one line)

```typescript
// Before (architecture / local)
const engine = createLocalUploadEngine();

// After (production)
import { UploadEngine, createCloudinaryProvider } from '@chronivs/upload-engine';

const engine = new UploadEngine(
  createCloudinaryProvider({
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    folder: 'chronivs/experiences',
  }),
);
```

### Step 3 — Studio adapter (no UI template changes)

Create a thin adapter hook that maps `UploadedAsset` → existing Studio form state:

```typescript
// apps/frontend/src/features/studio/adapters/upload-engine.adapter.ts (future)
import type { UploadedAsset } from '@chronivs/upload-engine';

export function toStudioPhotoValue(asset: UploadedAsset): string {
  return asset.originalUrl ?? asset.previewUrl ?? '';
}
```

Existing `MediaUploader` / `compress-image.ts` remain untouched until the adapter is wired at the composition root.

### Why the frontend stays unchanged

| Layer              | Changes when Cloudinary ships? |
|--------------------|--------------------------------|
| Studio templates   | No                             |
| Animations / layout| No                             |
| UploadEngine API   | No                             |
| UploadProvider     | Yes — swap implementation    |
| Env vars           | Yes — cloud name, preset       |

Compression can optionally be skipped when Cloudinary eager transformations handle resize:

```typescript
await engine.upload({ file, skipCompression: true });
```

---

## Alignment with other packages

| Package                    | Relationship                                      |
|----------------------------|---------------------------------------------------|
| `@chronivs/experience-core`| `MediaAsset` / `AudioAsset` via future adapter    |
| `@chronivs/form-engine`    | File field limits (`maxFiles`, `maxFileSize`)     |
| `@chronivs/recipe-engine`  | `getMediaLimits()` drives validation options      |

---

## Scripts

```bash
npm run typecheck -w @chronivs/upload-engine
npm run lint -w @chronivs/upload-engine
```

---

## Design principles

1. **Additive only** — no modifications to existing Studio UI or templates.
2. **Provider injection** — storage backend is swappable without API surface changes.
3. **Immutable collections** — operations return new snapshots; engine notifies subscribers.
4. **Local-first** — blob URLs and simulated progress for development and testing.
5. **Compression as pipeline stage** — can be bypassed when CDN handles transforms.
