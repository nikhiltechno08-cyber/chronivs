/**
 * Sharing, access control, and social-preview configuration for an experience.
 */
export interface ShareSettings {
  /** Whether the experience is reachable without authentication. */
  readonly isPublic: boolean;
  /** When true, recipients must provide a password to view. */
  readonly passwordProtected?: boolean;
  /** Hashed password storage is a backend concern; this flag is domain-only. */
  readonly hasPassword?: boolean;
  /** ISO-8601 expiry after which the share link is invalid. */
  readonly expiresAt?: string;
  /** Whether recipients may download attached media. */
  readonly allowDownload?: boolean;
  /** Canonical public URL once published (populated by publishing module). */
  readonly shareUrl?: string;
  /** Open Graph / social card title override. */
  readonly ogTitle?: string;
  /** Open Graph / social card description override. */
  readonly ogDescription?: string;
  /** Open Graph image URL override. */
  readonly ogImageUrl?: string;
}

/** Default share settings for a new draft experience. */
export const DEFAULT_SHARE_SETTINGS: ShareSettings = {
  isPublic: false,
  passwordProtected: false,
  allowDownload: false,
} as const;
