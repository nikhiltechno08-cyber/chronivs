/**
 * Branded scalar types for compile-time domain safety.
 * Prevents accidental interchange of semantically distinct string identifiers.
 */

/** Unique identifier for an Experience record. */
export type ExperienceId = string & { readonly __brand: 'ExperienceId' };

/** URL-safe public identifier for an Experience. */
export type ExperienceSlug = string & { readonly __brand: 'ExperienceSlug' };

/** Identifier for a registered experience template/recipe. */
export type TemplateId = string & { readonly __brand: 'TemplateId' };

/** Unique identifier for a media asset within an experience. */
export type MediaAssetId = string & { readonly __brand: 'MediaAssetId' };

/** Unique identifier for an audio asset within an experience. */
export type AudioAssetId = string & { readonly __brand: 'AudioAssetId' };

/** Unique identifier for a scene within an experience. */
export type SceneId = string & { readonly __brand: 'SceneId' };

/** ISO-8601 timestamp string (UTC). */
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };

/** Identifier for a user or service account that owns an experience. */
export type OwnerId = string & { readonly __brand: 'OwnerId' };

/** Opaque JSON-safe primitive used in generic content payloads. */
export type JsonPrimitive = string | number | boolean | null;

/** JSON-safe value for scene payloads and extension fields. */
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
