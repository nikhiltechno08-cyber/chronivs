/**
 * Preview viewport mode.
 */
export enum PreviewViewportMode {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
}

export const PREVIEW_VIEWPORT_MODES = Object.values(PreviewViewportMode) as readonly PreviewViewportMode[];

/**
 * Preview synchronization status.
 */
export enum PreviewSyncStatus {
  Idle = 'idle',
  Syncing = 'syncing',
  Ready = 'ready',
  Error = 'error',
}

/**
 * Preview update strategy.
 */
export enum PreviewUpdateStrategy {
  /** Full experience re-render plan. */
  Full = 'full',
  /** Selective scene prop patch only. */
  Selective = 'selective',
  /** Optimistic immediate patch before debounced confirm. */
  Optimistic = 'optimistic',
}
