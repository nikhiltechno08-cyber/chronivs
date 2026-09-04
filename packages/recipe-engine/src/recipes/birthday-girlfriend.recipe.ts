import {
  DEFAULT_AUDIO_MIME_TYPES,
  DEFAULT_IMAGE_MIME_TYPES,
  RECIPE_FIELD_KEYS,
  RECIPE_SCHEMA_VERSION,
  RECIPE_VALIDATION_CODES,
} from '../constants';
import {
  FIELD_AUDIO,
  FIELD_BIRTHDAY_DATE,
  FIELD_CUSTOM_MESSAGE,
  FIELD_PHOTOS,
  FIELD_RECEIVER_NAME_GIRLFRIEND,
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
    message: 'Receiver name is required.',
  },
  {
    code: RECIPE_VALIDATION_CODES.REQUIRED_FIELD_MISSING,
    target: RECIPE_FIELD_KEYS.SPECIAL_DATE,
    rule: 'required',
    message: 'Birthday date is required.',
  },
  {
    code: RECIPE_VALIDATION_CODES.REQUIRED_FIELD_MISSING,
    target: RECIPE_FIELD_KEYS.CUSTOM_MESSAGE,
    rule: 'required',
    message: 'A personal message is required.',
  },
  {
    code: RECIPE_VALIDATION_CODES.PHOTOS_BELOW_MIN,
    target: 'photos',
    rule: 'min_items',
    value: 1,
    message: 'At least one photo is recommended; up to 5 supported.',
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
 * Birthday · Girlfriend recipe definition.
 */
export const birthdayGirlfriendRecipe: Recipe = {
  schemaVersion: RECIPE_SCHEMA_VERSION,
  templateId: 'birthday-girlfriend' as Recipe['templateId'],
  occasion: Occasion.Birthday,
  relationships: [Relationship.Girlfriend, Relationship.Boyfriend],
  displayName: 'Birthday · Girlfriend',
  description:
    'A cinematic birthday journey through memories, love, and celebration — tailored for your partner.',
  estimatedDuration: '6–8 min',
  coverImage: '/recipes/covers/birthday-girlfriend.jpg',
  theme: {
    presetId: 'romantic-plum',
    defaultMode: 'dark',
  },
  music: {
    trackId: 'ambient-romantic-plum',
    allowsUserOverride: true,
  },
  requiredFields: [
    FIELD_SENDER_NAME,
    FIELD_RECEIVER_NAME_GIRLFRIEND,
    FIELD_BIRTHDAY_DATE,
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
    { sceneId: 'surprise', label: 'Surprise' },
    { sceneId: 'birthday', label: 'Birthday' },
    { sceneId: 'beginning', label: 'Beginning' },
    { sceneId: 'memories', label: 'Memories' },
    { sceneId: 'love', label: 'Love' },
    { sceneId: 'heart', label: 'Heart' },
    { sceneId: 'celebration', label: 'Celebration' },
    { sceneId: 'forever', label: 'Forever' },
  ],
  version: '1.0.0',
  isActive: true,
};
