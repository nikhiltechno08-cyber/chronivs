import {
  DEFAULT_AUDIO_MIME_TYPES,
  DEFAULT_IMAGE_MIME_TYPES,
  RECIPE_FIELD_KEYS,
  RECIPE_SCHEMA_VERSION,
  RECIPE_VALIDATION_CODES,
} from '../constants';
import {
  FIELD_AUDIO,
  FIELD_CUSTOM_MESSAGE,
  FIELD_PHOTOS,
  FIELD_RECEIVER_NAME_MOTHER,
  FIELD_SENDER_NAME,
  FIELD_SPECIAL_DATE,
} from '../fields';
import type { Recipe, RecipeValidationRule } from '../types';
import { Occasion, Relationship } from '@chronivs/experience-core';

const validationRules: readonly RecipeValidationRule[] = [
  {
    code: RECIPE_VALIDATION_CODES.REQUIRED_FIELD_MISSING,
    target: RECIPE_FIELD_KEYS.SENDER_NAME,
    rule: 'required',
    message: 'Your name is required.',
  },
  {
    code: RECIPE_VALIDATION_CODES.REQUIRED_FIELD_MISSING,
    target: RECIPE_FIELD_KEYS.RECEIVER_NAME,
    rule: 'required',
    message: "Mother's name is required.",
  },
  {
    code: RECIPE_VALIDATION_CODES.PHOTOS_ABOVE_MAX,
    target: 'photos',
    rule: 'max_items',
    value: 5,
    message: 'Maximum 5 photos allowed.',
  },
] as const;

/**
 * Birthday · Mother recipe definition.
 */
export const birthdayMotherRecipe: Recipe = {
  schemaVersion: RECIPE_SCHEMA_VERSION,
  templateId: 'birthday-mother' as Recipe['templateId'],
  occasion: Occasion.Birthday,
  relationships: [Relationship.Mother],
  displayName: 'Birthday · Mother',
  description:
    'A warm, premium birthday tribute through memory garden, voice, and a handwritten letter for Maa.',
  estimatedDuration: '7–9 min',
  coverImage: '/recipes/covers/birthday-mother.jpg',
  theme: {
    presetId: 'golden-parchment',
    defaultMode: 'light',
  },
  music: {
    trackId: 'ambient-warm-piano',
    allowsUserOverride: true,
  },
  requiredFields: [
    FIELD_SENDER_NAME,
    FIELD_RECEIVER_NAME_MOTHER,
    { ...FIELD_SPECIAL_DATE, label: 'Birthday / Ready By Date' },
    FIELD_PHOTOS,
    FIELD_AUDIO,
    FIELD_CUSTOM_MESSAGE,
  ],
  optionalFields: [],
  mediaLimits: {
    maxPhotos: 5,
    minPhotos: 0,
    maxAudioTracks: 1,
    minAudioTracks: 0,
    requiresPuzzleImage: false,
    acceptedImageMimeTypes: DEFAULT_IMAGE_MIME_TYPES,
    acceptedAudioMimeTypes: DEFAULT_AUDIO_MIME_TYPES,
    maxPhotoBytes: 5 * 1024 * 1024,
    maxAudioBytes: 10 * 1024 * 1024,
  },
  validationRules,
  defaultValues: {
    [RECIPE_FIELD_KEYS.SENDER_NAME]: null,
    [RECIPE_FIELD_KEYS.RECEIVER_NAME]: null,
    [RECIPE_FIELD_KEYS.SPECIAL_DATE]: null,
    [RECIPE_FIELD_KEYS.CUSTOM_MESSAGE]: null,
    photos: [],
    audio: null,
  },
  sceneSequence: [
    { sceneId: 'welcome', label: 'Welcome' },
    { sceneId: 'memory-garden', label: 'Memory Garden' },
    { sceneId: 'moments', label: 'Moments' },
    { sceneId: 'heart-letter', label: 'Heart Letter' },
    { sceneId: 'voice', label: 'Voice From Heart' },
    { sceneId: 'thank-you', label: 'Thank You' },
    { sceneId: 'ending', label: 'A Final Gift' },
  ],
  version: '1.0.0',
  isActive: true,
};
