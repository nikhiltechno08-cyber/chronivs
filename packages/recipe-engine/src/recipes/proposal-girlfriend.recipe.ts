import {
  DEFAULT_AUDIO_MIME_TYPES,
  DEFAULT_IMAGE_MIME_TYPES,
  RECIPE_FIELD_KEYS,
  RECIPE_SCHEMA_VERSION,
  RECIPE_VALIDATION_CODES,
} from '../constants';
import {
  FIELD_AUDIO,
  FIELD_LETTER,
  FIELD_PHOTOS,
  FIELD_PROPOSAL_DATE,
  FIELD_PUZZLE_IMAGE,
  FIELD_RECEIVER_NAME_PROPOSAL,
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
    code: RECIPE_VALIDATION_CODES.REQUIRED_FIELD_MISSING,
    target: RECIPE_FIELD_KEYS.LETTER,
    rule: 'required',
    message: 'Letter content is required.',
  },
  {
    code: RECIPE_VALIDATION_CODES.PUZZLE_IMAGE_REQUIRED,
    target: RECIPE_FIELD_KEYS.PUZZLE_IMAGE,
    rule: 'required',
    message: 'Puzzle image is required.',
  },
  {
    code: RECIPE_VALIDATION_CODES.PHOTOS_ABOVE_MAX,
    target: 'photos',
    rule: 'max_items',
    value: 5,
    message: 'Maximum 5 photos allowed.',
  },
  {
    code: RECIPE_VALIDATION_CODES.AUDIO_REQUIRED,
    target: 'audio',
    rule: 'required',
    message: 'Audio message is required for the full proposal experience.',
  },
] as const;

/**
 * Proposal · Girlfriend recipe definition.
 */
export const proposalGirlfriendRecipe: Recipe = {
  schemaVersion: RECIPE_SCHEMA_VERSION,
  templateId: 'proposal-girlfriend' as Recipe['templateId'],
  occasion: Occasion.Proposal,
  relationships: [Relationship.Girlfriend, Relationship.Boyfriend],
  displayName: 'Proposal · Girlfriend',
  description:
    'A fourteen-scene cinematic proposal — lantern, letter, ring reveal, and the question.',
  estimatedDuration: '12–16 min',
  coverImage: '/recipes/covers/proposal-girlfriend.jpg',
  theme: {
    presetId: 'midnight-gold',
    defaultMode: 'dark',
  },
  music: {
    trackId: 'ambient-cinematic-romance',
    allowsUserOverride: true,
  },
  requiredFields: [
    FIELD_SENDER_NAME,
    FIELD_RECEIVER_NAME_PROPOSAL,
    FIELD_PHOTOS,
    FIELD_PUZZLE_IMAGE,
    FIELD_LETTER,
    FIELD_AUDIO,
  ],
  optionalFields: [FIELD_PROPOSAL_DATE],
  mediaLimits: {
    maxPhotos: 5,
    minPhotos: 0,
    maxAudioTracks: 1,
    minAudioTracks: 1,
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
    [RECIPE_FIELD_KEYS.LETTER]: null,
    [RECIPE_FIELD_KEYS.PUZZLE_IMAGE]: null,
    photos: [],
    audio: null,
  },
  sceneSequence: [
    { sceneId: 'prop-lantern', label: 'Lantern' },
    { sceneId: 'prop-photo', label: 'Photo' },
    { sceneId: 'prop-little-things', label: 'The Little Things' },
    { sceneId: 'prop-cards', label: 'Reasons I Love You' },
    { sceneId: 'prop-timeline', label: 'Timeline' },
    { sceneId: 'prop-orbs', label: 'Orbs' },
    { sceneId: 'prop-seal', label: 'Seal' },
    { sceneId: 'prop-one-more-secret', label: 'One More Secret' },
    { sceneId: 'prop-letter', label: 'Letter' },
    { sceneId: 'prop-before-question', label: 'Before The Question' },
    { sceneId: 'prop-one-last-surprise', label: 'One Last Surprise' },
    { sceneId: 'prop-proposal', label: 'Proposal' },
    { sceneId: 'prop-celebration', label: 'Celebration' },
    { sceneId: 'prop-hope', label: 'Hope' },
  ],
  version: '1.0.0',
  isActive: true,
};
