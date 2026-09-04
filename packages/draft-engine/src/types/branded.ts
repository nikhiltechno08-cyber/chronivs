/** Branded identifier for a draft record. */
export type DraftId = string & { readonly __brand: 'DraftId' };

/** ISO-8601 timestamp string. */
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };
