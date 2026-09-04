import type { AudioAssetId, JsonValue, MediaAssetId } from '../types';

/**
 * Classification of a visual or document media asset.
 */
export type MediaAssetKind = 'image' | 'video' | 'document';

/**
 * A single visual or document asset attached to an experience.
 * Storage URLs are opaque — CDN provider is an infrastructure concern.
 */
export interface MediaAsset {
  /** Unique identifier within the parent experience. */
  readonly id: MediaAssetId;
  /** Asset classification for rendering and validation rules. */
  readonly kind: MediaAssetKind;
  /** Public or signed URL to the stored asset. */
  readonly url: string;
  /** MIME type when known (e.g. `image/jpeg`). */
  readonly mimeType?: string;
  /** Original filename if uploaded by the user. */
  readonly fileName?: string;
  /** Byte size when known. */
  readonly byteSize?: number;
  /** Image/video width in pixels. */
  readonly width?: number;
  /** Image/video height in pixels. */
  readonly height?: number;
  /** Accessible description for screen readers and SEO. */
  readonly alt?: string;
  /** Display order within a gallery or scene (0-based). */
  readonly order?: number;
  /** Optional scene binding — which scene primarily consumes this asset. */
  readonly sceneId?: string;
  /** Provider-specific or extension metadata (e.g. Cloudinary public_id). */
  readonly metadata?: Readonly<Record<string, JsonValue>>;
  /** ISO-8601 timestamp when the asset was attached. */
  readonly createdAt?: string;
}

/**
 * A voice message or background audio track attached to an experience.
 */
export interface AudioAsset {
  /** Unique identifier within the parent experience. */
  readonly id: AudioAssetId;
  /** Public or signed URL to the stored audio file. */
  readonly url: string;
  /** MIME type when known (e.g. `audio/webm`). */
  readonly mimeType?: string;
  /** Original filename if uploaded by the user. */
  readonly fileName?: string;
  /** Duration in seconds when known. */
  readonly durationSeconds?: number;
  /** Optional transcript for accessibility and search. */
  readonly transcript?: string;
  /** Optional scene binding. */
  readonly sceneId?: string;
  /** Provider-specific or extension metadata. */
  readonly metadata?: Readonly<Record<string, JsonValue>>;
  /** ISO-8601 timestamp when the asset was attached. */
  readonly createdAt?: string;
}

/**
 * Aggregated media container on an {@link Experience}.
 * Keeps images and audio separate for template-specific consumption.
 */
export interface ExperienceMedia {
  /** Ordered visual assets (photos, illustrations, video stills). */
  readonly images: readonly MediaAsset[];
  /** Audio tracks (voice messages, background music). */
  readonly audio: readonly AudioAsset[];
}

/** Empty media collection — useful for defaults and cloning. */
export const EMPTY_EXPERIENCE_MEDIA: ExperienceMedia = {
  images: [],
  audio: [],
} as const;
