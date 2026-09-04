'use client';

import { useCallback, useState } from 'react';

import { ApiError } from '@/services/api-client';
import {
  fileFingerprint,
  MediaValidationError,
  validateImageFile,
} from '@/services/mediaUpload';
import { uploadManager } from '@/services/uploadManager';

import { MAX_PHOTOS } from '../constants/occasions';
import { useStudioStore } from '../store/studio-store';
import type { StudioPhoto } from '../types';
import { generateId } from '../utils';
import { resolveStudioUploadFolder } from '../utils/upload-folder';

type UsePhotoUploadOptions = {
  onLimitReached?: () => void;
  onPartialAdd?: (remaining: number) => void;
  onValidationError?: (message: string) => void;
  onUploadError?: (message: string) => void;
};

function friendlyUploadError(error: unknown): string {
  if (error instanceof MediaValidationError) return error.message;
  if (error instanceof ApiError) return error.message || 'Upload failed. Please try again.';
  if (error instanceof Error && error.name === 'AbortError') return 'Upload cancelled.';
  if (error instanceof Error && error.message) return error.message;
  return 'Upload failed. Please try again.';
}

export function usePhotoUpload(options: UsePhotoUploadOptions = {}) {
  const photos = useStudioStore((s) => s.photos);
  const occasion = useStudioStore((s) => s.occasion);
  const relationship = useStudioStore((s) => s.relationship);
  const addPhoto = useStudioStore((s) => s.addPhoto);
  const updatePhoto = useStudioStore((s) => s.updatePhoto);
  const removePhotoFromStore = useStudioStore((s) => s.removePhoto);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const startUpload = useCallback(
    (photoId: string, file: File, fingerprint: string) => {
      const folder = resolveStudioUploadFolder(occasion, relationship);

      void uploadManager
        .enqueue(photoId, file, {
          folder,
          onStatus: (status) => {
            updatePhoto(photoId, {
              uploadStatus: status,
              uploadError: status === 'error' ? 'Upload failed' : null,
            });
          },
          onProgress: (progress) => {
            updatePhoto(photoId, {
              uploadProgress: progress,
              uploadStatus: 'uploading',
            });
          },
          onComplete: (result) => {
            const secureUrl = result.url;
            updatePhoto(photoId, {
              mediaId: result.id,
              publicId: result.public_id,
              secureUrl,
              dataUrl: secureUrl,
              width: result.width ?? undefined,
              height: result.height ?? undefined,
              format: result.format ?? undefined,
              bytes: result.bytes ?? undefined,
              uploadStatus: 'complete',
              uploadProgress: 100,
              uploadError: null,
              contentFingerprint: fingerprint,
            });
          },
          onError: (error) => {
            const message = friendlyUploadError(error);
            updatePhoto(photoId, {
              uploadStatus: 'error',
              uploadError: message,
              uploadProgress: 0,
            });
            options.onUploadError?.(message);
          },
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return;
          const current = useStudioStore.getState().photos.find((p) => p.id === photoId);
          if (!current) return;
          // runJob already applied onError — only handle enqueue-time rejects
          if (current.uploadStatus === 'error' && current.uploadError) return;
          const message = friendlyUploadError(error);
          updatePhoto(photoId, {
            uploadStatus: 'error',
            uploadError: message,
          });
          options.onUploadError?.(message);
        });
    },
    [occasion, options, relationship, updatePhoto],
  );

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!files.length) return;

      const remaining = MAX_PHOTOS - useStudioStore.getState().photos.length;
      if (remaining <= 0) {
        options.onLimitReached?.();
        return;
      }

      const accepted: File[] = [];
      for (const file of files) {
        try {
          validateImageFile(file);
          accepted.push(file);
        } catch (error) {
          options.onValidationError?.(friendlyUploadError(error));
        }
      }

      if (!accepted.length) return;

      const toAdd = accepted.slice(0, remaining);
      if (accepted.length > remaining) {
        options.onPartialAdd?.(remaining);
      }

      for (const file of toAdd) {
        const fingerprint = fileFingerprint(file);
        const already = useStudioStore
          .getState()
          .photos.some((p) => p.contentFingerprint === fingerprint && p.uploadStatus !== 'error');
        if (already) {
          options.onValidationError?.('This photo is already added.');
          continue;
        }

        const photoId = generateId('photo');
        const photo: StudioPhoto = {
          id: photoId,
          dataUrl: '',
          name: file.name,
          uploadStatus: 'queued',
          uploadProgress: 0,
          uploadError: null,
          contentFingerprint: fingerprint,
        };

        addPhoto(photo);
        setLastAddedId(photoId);
        startUpload(photoId, file, fingerprint);
      }
    },
    [addPhoto, options, startUpload],
  );

  const removePhoto = useCallback(
    (id: string) => {
      const photo = useStudioStore.getState().photos.find((p) => p.id === id);
      uploadManager.cancel(id);
      uploadManager.releaseFingerprint(photo?.contentFingerprint);

      removePhotoFromStore(id);

      if (photo?.mediaId) {
        void uploadManager.deleteRemote(photo.mediaId).catch(() => {
          // Soft-fail — local state already cleared; orphan cleanup can be manual
          options.onUploadError?.('Photo removed locally, but cloud delete failed.');
        });
      }
    },
    [options, removePhotoFromStore],
  );

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return {
    photos,
    isDragging,
    lastAddedId,
    handleFiles,
    removePhoto,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    canAddMore: photos.length < MAX_PHOTOS,
    hasUploading: photos.some(
      (p) => p.uploadStatus === 'queued' || p.uploadStatus === 'uploading',
    ),
  };
}
