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
  FIELD_RECEIVER_NAME_FATHER,
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
    message: "Father's name is required.",
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
 * Birthday · Father recipe definition.
 */
export const birthdayFatherRecipe: Recipe = {
  schemaVersion: RECIPE_SCHEMA_VERSION,
  templateId: 'birthday-father' as Recipe['templateId'],
  occasion: Occasion.Birthday,
  relationships: [Relationship.Father],
  displayName: 'Birthday · Father',
  description:
    'A twelve-chapter parchment journey celebrating Papa — timeline, album, lanterns, voice, and letter.',
  estimatedDuration: '10–14 min',
  coverImage: '/recipes/covers/birthday-father.jpg',
  theme: {
    presetId: 'golden-parchment',
    defaultMode: 'light',
  },
  music: {
    trackId: 'ambient-folk-warm',
    allowsUserOverride: true,
  },
  requiredFields: [
    FIELD_SENDER_NAME,
    FIELD_RECEIVER_NAME_FATHER,
    { ...FIELD_SPECIAL_DATE, label: 'Birthday Date' },
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
    { sceneId: 'father-welcome', label: 'Welcome' },
    { sceneId: 'father-door', label: 'The Door' },
    { sceneId: 'father-timeline', label: 'Timeline' },
    { sceneId: 'father-hands', label: 'These Hands' },
    { sceneId: 'father-album', label: 'Album' },
    { sceneId: 'father-lanterns', label: 'Lanterns' },
    { sceneId: 'father-voice', label: 'Voice' },
    { sceneId: 'father-letter', label: 'Letter' },
    { sceneId: 'father-celebration', label: 'Celebration' },
    { sceneId: 'father-wishes', label: 'Wishes' },
    { sceneId: 'father-thank-you', label: 'Thank You' },
    { sceneId: 'father-ending', label: 'Final Gift' },
  ],
  version: '1.0.0',
  isActive: true,
};
