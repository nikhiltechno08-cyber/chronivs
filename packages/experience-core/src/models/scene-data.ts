import type { JsonValue, SceneId } from '../types';

/**
 * Template-agnostic payload for a single scene within an experience.
 * Scene-specific shape is carried in `payload` — validated by template adapters.
 */
export interface SceneData {
  /** Stable scene identifier matching the template's scene registry. */
  readonly sceneId: SceneId;
  /** Zero-based display order; templates may override via their own scene order. */
  readonly order?: number;
  /** When false the scene is skipped during playback. Defaults to true. */
  readonly enabled?: boolean;
  /** Human-readable label for studio/preview UI (not rendered unless template uses it). */
  readonly label?: string;
  /**
   * Opaque, JSON-safe scene payload.
   * Template adapters map this to strongly typed scene props at the rendering boundary.
   */
  readonly payload: Readonly<Record<string, JsonValue>>;
  /** ISO-8601 timestamp of the last edit to this scene's payload. */
  readonly updatedAt?: string;
}

/**
 * Ordered collection of scene payloads keyed by scene id.
 */
export type SceneDataMap = Readonly<Record<string, SceneData>>;
