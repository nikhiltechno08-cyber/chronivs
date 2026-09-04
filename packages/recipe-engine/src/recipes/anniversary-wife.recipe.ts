import {
  DEFAULT_AUDIO_MIME_TYPES,
  DEFAULT_IMAGE_MIME_TYPES,
  RECIPE_FIELD_KEYS,
  RECIPE_SCHEMA_VERSION,
  RECIPE_VALIDATION_CODES,
} from '../constants';
import {
  FIELD_ANNIVERSARY_DATE,
  FIELD_AUDIO,
  FIELD_CUSTOM_MESSAGE,
  FIELD_LETTER,
  FIELD_PHOTOS,
  FIELD_PUZZLE_IMAGE,
  FIELD_RECEIVER_NAME_WIFE,
  FIELD_SENDER_NAME,
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
    message: 'Her name is required.',
  },
  {
    code: RECIPE_VALIDATION_CODES.PUZZLE_IMAGE_REQUIRED,
    target: RECIPE_FIELD_KEYS.PUZZLE_IMAGE,
    rule: 'required',
    message: 'Puzzle image is required for the anniversary puzzle scene.',
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
 * Anniversary · Wife recipe definition.
 */
export const anniversaryWifeRecipe: Recipe = {
  schemaVersion: RECIPE_SCHEMA_VERSION,
  templateId: 'anniversary-wife' as Recipe['templateId'],
  occasion: Occasion.Anniversary,
  relationships: [Relationship.Wife, Relationship.Husband],
  displayName: 'Anniversary · Wife',
  description:
    'Twelve scenes celebrating your story — ribbon timeline, puzzle, frames, vinyl, promises, and tree.',
  estimatedDuration: '10–12 min',
  coverImage: '/recipes/covers/anniversary-wife.jpg',
  theme: {
    presetId: 'rose-gold-anniversary',
    defaultMode: 'light',
  },
  music: {
    trackId: 'ambient-anniversary-vinyl',
    allowsUserOverride: true,
  },
  requiredFields: [
    FIELD_SENDER_NAME,
    FIELD_RECEIVER_NAME_WIFE,
    FIELD_ANNIVERSARY_DATE,
    FIELD_PHOTOS,
    FIELD_PUZZLE_IMAGE,
    FIELD_LETTER,
    FIELD_AUDIO,
    FIELD_CUSTOM_MESSAGE,
  ],
  optionalFields: [],
  mediaLimits: {
    maxPhotos: 5,
    minPhotos: 0,
    maxAudioTracks: 1,
    minAudioTracks: 0,
    requiresPuzzleImage: true,
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
    [RECIPE_FIELD_KEYS.LETTER]: null,
    [RECIPE_FIELD_KEYS.PUZZLE_IMAGE]: null,
    photos: [],
    audio: null,
  },
  sceneSequence: [
    { sceneId: 'wife-welcome', label: 'Welcome' },
    { sceneId: 'wife-photo', label: 'Photo' },
    { sceneId: 'wife-ribbon', label: 'Ribbon Timeline' },
    { sceneId: 'wife-stars', label: 'Constellation' },
    { sceneId: 'wife-puzzle', label: 'Puzzle' },
    { sceneId: 'wife-frames', label: 'Memory Frames' },
    { sceneId: 'wife-letter', label: 'Letter' },
    { sceneId: 'wife-vinyl', label: 'Vinyl' },
    { sceneId: 'wife-promises', label: 'Promises' },
    { sceneId: 'wife-tree', label: 'Tree of Us' },
    { sceneId: 'wife-celebration', label: 'Celebration' },
    { sceneId: 'wife-ending', label: 'Ending' },
  ],
  version: '1.0.0',
  isActive: true,
};
