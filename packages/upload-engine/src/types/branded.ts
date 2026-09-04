/** Branded identifier for an upload asset record. */
export type UploadAssetId = string & { readonly __brand: 'UploadAssetId' };

/** ISO-8601 timestamp string. */
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };
