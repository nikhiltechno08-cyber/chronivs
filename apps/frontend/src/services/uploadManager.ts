/**
 * Shared upload queue for Chronivs studio media.
 * Concurrency-limited, retry-aware, cancellable, deduped.
 */

import {
  deleteUploadedImage,
  fileFingerprint,
  MediaValidationError,
  uploadImage,
  type MediaUploadResult,
} from './mediaUpload';

const MAX_CONCURRENT = 3;
const MAX_RETRIES = 2;

export type UploadJobStatus = 'queued' | 'uploading' | 'complete' | 'error' | 'cancelled';

export type UploadJobCallbacks = {
  onStatus?: (status: UploadJobStatus) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (result: MediaUploadResult) => void;
  onError?: (error: Error) => void;
};

type InternalJob = {
  clientId: string;
  file: File;
  folder: string;
  fingerprint: string;
  callbacks: UploadJobCallbacks;
  attempt: number;
  controller: AbortController;
  resolve: (result: MediaUploadResult) => void;
  reject: (error: Error) => void;
};

function isAbortError(error: unknown): boolean {
  return (
    (typeof DOMException !== 'undefined' &&
      error instanceof DOMException &&
      error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  );
}

function isRetryable(error: unknown): boolean {
  if (error instanceof MediaValidationError) return false;
  if (isAbortError(error)) return false;
  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: number }).status);
    if (status === 422 || status === 400 || status === 413) return false;
  }
  return true;
}

class UploadManager {
  private queue: InternalJob[] = [];
  private active = new Map<string, InternalJob>();
  private fingerprints = new Set<string>();
  private running = 0;

  /** Enqueue a file upload. Returns a promise for the Cloudinary result. */
  enqueue(
    clientId: string,
    file: File,
    options: { folder?: string } & UploadJobCallbacks = {},
  ): Promise<MediaUploadResult> {
    const fingerprint = fileFingerprint(file);
    if (this.fingerprints.has(fingerprint)) {
      return Promise.reject(
        new MediaValidationError('This photo is already uploading or added.', 'invalid_format'),
      );
    }

    const { folder = 'general', ...callbacks } = options;

    return new Promise<MediaUploadResult>((resolve, reject) => {
      const job: InternalJob = {
        clientId,
        file,
        folder,
        fingerprint,
        callbacks,
        attempt: 0,
        controller: new AbortController(),
        resolve,
        reject,
      };
      this.fingerprints.add(fingerprint);
      this.queue.push(job);
      callbacks.onStatus?.('queued');
      this.pump();
    });
  }

  cancel(clientId: string): void {
    const queuedIdx = this.queue.findIndex((j) => j.clientId === clientId);
    if (queuedIdx >= 0) {
      const [job] = this.queue.splice(queuedIdx, 1);
      if (job) {
        this.fingerprints.delete(job.fingerprint);
        job.callbacks.onStatus?.('cancelled');
        job.reject(new DOMException('Upload cancelled', 'AbortError'));
      }
      return;
    }

    const active = this.active.get(clientId);
    if (active) {
      active.controller.abort();
    }
  }

  cancelAll(): void {
    const queued = [...this.queue];
    this.queue = [];
    for (const job of queued) {
      this.fingerprints.delete(job.fingerprint);
      job.callbacks.onStatus?.('cancelled');
      job.reject(new DOMException('Upload cancelled', 'AbortError'));
    }
    for (const job of this.active.values()) {
      job.controller.abort();
    }
  }

  /** Forget fingerprint after a photo is removed so the same file can be re-added. */
  releaseFingerprint(fingerprint: string | undefined): void {
    if (fingerprint) this.fingerprints.delete(fingerprint);
  }

  async deleteRemote(mediaId: string): Promise<void> {
    await deleteUploadedImage(mediaId);
  }

  private pump(): void {
    while (this.running < MAX_CONCURRENT && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;
      this.running += 1;
      this.active.set(job.clientId, job);
      void this.runJob(job);
    }
  }

  private async runJob(job: InternalJob): Promise<void> {
    job.callbacks.onStatus?.('uploading');
    job.callbacks.onProgress?.(0);

    try {
      const result = await this.uploadWithRetry(job);
      this.fingerprints.delete(job.fingerprint);
      // Keep fingerprint reserved until photo is removed — re-add after success with new key
      this.fingerprints.add(job.fingerprint);
      job.callbacks.onProgress?.(100);
      job.callbacks.onStatus?.('complete');
      job.callbacks.onComplete?.(result);
      job.resolve(result);
    } catch (error) {
      this.fingerprints.delete(job.fingerprint);
      const err = error instanceof Error ? error : new Error('Upload failed');
      if (isAbortError(err)) {
        job.callbacks.onStatus?.('cancelled');
      } else {
        job.callbacks.onStatus?.('error');
        job.callbacks.onError?.(err);
      }
      job.reject(err);
    } finally {
      this.active.delete(job.clientId);
      this.running = Math.max(0, this.running - 1);
      this.pump();
    }
  }

  private async uploadWithRetry(job: InternalJob): Promise<MediaUploadResult> {
    let lastError: unknown;
    while (job.attempt <= MAX_RETRIES) {
      if (job.controller.signal.aborted) {
        throw new DOMException('Upload cancelled', 'AbortError');
      }
      try {
        return await uploadImage(job.file, {
          folder: job.folder,
          signal: job.controller.signal,
          onProgress: (progress) => job.callbacks.onProgress?.(progress),
        });
      } catch (error) {
        lastError = error;
        if (!isRetryable(error) || job.attempt >= MAX_RETRIES) {
          throw error;
        }
        job.attempt += 1;
        const delay = 400 * job.attempt;
        await new Promise((r) => setTimeout(r, delay));
        // Fresh controller not needed — same signal; if aborted, next loop throws
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Upload failed');
  }
}

/** Singleton shared by every studio / template flow. */
export const uploadManager = new UploadManager();
