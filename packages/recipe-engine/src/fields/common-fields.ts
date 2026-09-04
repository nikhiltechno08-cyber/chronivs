import { RECIPE_FIELD_KEYS } from '../constants';
import type { RecipeField } from '../types';

/** Reusable field: sender / your name. */
export const FIELD_SENDER_NAME: RecipeField = {
  key: RECIPE_FIELD_KEYS.SENDER_NAME,
  type: 'text',
  label: 'Your Name',
  description: 'How the recipient knows you — used in signatures and cinematic copy.',
  maxLength: 80,
  minLength: 1,
  placeholder: 'Alex',
};

/** Reusable field: receiver / her name / celebrated person. */
export const FIELD_RECEIVER_NAME: RecipeField = {
  key: RECIPE_FIELD_KEYS.RECEIVER_NAME,
  type: 'text',
  label: 'Their Name',
  description: 'The person this experience is created for.',
  maxLength: 80,
  minLength: 1,
  placeholder: 'Jordan',
};

/** Birthday GF variant label. */
export const FIELD_RECEIVER_NAME_GIRLFRIEND: RecipeField = {
  ...FIELD_RECEIVER_NAME,
  label: 'Receiver Name',
  placeholder: 'Her name',
};

/** Proposal variant label. */
export const FIELD_RECEIVER_NAME_PROPOSAL: RecipeField = {
  ...FIELD_RECEIVER_NAME,
  label: 'Her Name',
  placeholder: 'Her name',
};

/** Anniversary variant label. */
export const FIELD_RECEIVER_NAME_WIFE: RecipeField = {
  ...FIELD_RECEIVER_NAME,
  label: 'Her Name',
  placeholder: 'Her name',
};

/** Mother variant. */
export const FIELD_RECEIVER_NAME_MOTHER: RecipeField = {
  ...FIELD_RECEIVER_NAME,
  label: 'Maa / Her Name',
  placeholder: 'Maa',
};

/** Father variant. */
export const FIELD_RECEIVER_NAME_FATHER: RecipeField = {
  ...FIELD_RECEIVER_NAME,
  label: 'Papa / His Name',
  placeholder: 'Papa',
};

/** Special date / birthday / anniversary date. */
export const FIELD_SPECIAL_DATE: RecipeField = {
  key: RECIPE_FIELD_KEYS.SPECIAL_DATE,
  type: 'date',
  label: 'Special Date',
  description: 'Birthday, anniversary, or proposal date displayed in cinematic scenes.',
};

export const FIELD_BIRTHDAY_DATE: RecipeField = {
  ...FIELD_SPECIAL_DATE,
  label: 'Birthday',
  consumedByScenes: ['birthday', 'celebration'],
};

export const FIELD_ANNIVERSARY_DATE: RecipeField = {
  ...FIELD_SPECIAL_DATE,
  label: 'Anniversary Date',
  consumedByScenes: ['wife-ribbon', 'wife-celebration'],
};

export const FIELD_PROPOSAL_DATE: RecipeField = {
  ...FIELD_SPECIAL_DATE,
  label: 'Proposal Date',
  consumedByScenes: ['prop-letter', 'prop-proposal'],
};

/** Custom message / letter body. */
export const FIELD_CUSTOM_MESSAGE: RecipeField = {
  key: RECIPE_FIELD_KEYS.CUSTOM_MESSAGE,
  type: 'textarea',
  label: 'Message',
  description: 'Personal message woven into letter and voiceover scenes.',
  maxLength: 400,
  minLength: 1,
};

export const FIELD_LETTER: RecipeField = {
  key: RECIPE_FIELD_KEYS.LETTER,
  type: 'letter',
  label: 'Letter',
  description: 'Long-form letter content for envelope and handwriting scenes.',
  maxLength: 2000,
  consumedByScenes: ['prop-letter', 'father-letter', 'wife-letter', 'heart-letter'],
};

/** Photo collection field (count enforced via mediaLimits). */
export const FIELD_PHOTOS: RecipeField = {
  key: 'photos',
  type: 'photo_collection',
  label: 'Photos',
  description: 'Personal photos displayed across memory and polaroid scenes.',
};

/** Voice message field. */
export const FIELD_AUDIO: RecipeField = {
  key: 'audio',
  type: 'audio',
  label: 'Audio',
  description: 'Recorded voice message or uploaded audio track.',
};

/** Puzzle or feature image slot (anniversary puzzle, proposal keepsake). */
export const FIELD_PUZZLE_IMAGE: RecipeField = {
  key: RECIPE_FIELD_KEYS.PUZZLE_IMAGE,
  type: 'image_slot',
  label: 'Puzzle Image',
  description: 'Hero image used in puzzle or reveal scenes.',
  consumedByScenes: ['wife-puzzle', 'prop-photo'],
};
