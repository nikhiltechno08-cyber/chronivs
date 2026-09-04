import { RECIPE_FIELD_KEYS } from '../constants';
import type { RecipeSceneMappings } from '../types/scene-mapping';

/**
 * Scene data mappings for Proposal · Girlfriend.
 */
export const proposalGirlfriendSceneMappings: RecipeSceneMappings = {
  templateId: 'proposal-girlfriend',
  globalDefaults: {
    receiverName: 'My Love',
    senderName: 'Me',
    letter: 'Every moment with you...',
  },
  scenes: {
    'prop-lantern': {
      sceneId: 'prop-lantern',
      label: 'Hero / Lantern',
      props: [
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'My Love',
          required: true,
        },
        { prop: 'occasion', source: 'occasion' },
        { prop: 'theme', source: 'settings.theme' },
      ],
    },
    'prop-photo': {
      sceneId: 'prop-photo',
      label: 'Photo Gallery',
      props: [
        { prop: 'photos', source: 'media.photos' },
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'My Love',
        },
      ],
    },
    'prop-letter': {
      sceneId: 'prop-letter',
      label: 'Letter',
      props: [
        {
          prop: 'letter',
          source: `fields.${RECIPE_FIELD_KEYS.LETTER}`,
          fallback: 'Every moment with you has led to this...',
        },
        {
          prop: 'senderName',
          source: `fields.${RECIPE_FIELD_KEYS.SENDER_NAME}`,
          fallback: 'Me',
        },
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'My Love',
        },
      ],
    },
    'prop-proposal': {
      sceneId: 'prop-proposal',
      label: 'Proposal',
      props: [
        {
          prop: 'senderName',
          source: `fields.${RECIPE_FIELD_KEYS.SENDER_NAME}`,
          fallback: 'Me',
          required: true,
        },
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'My Love',
          required: true,
        },
        { prop: 'theme', source: 'settings.theme' },
      ],
    },
    'prop-one-last-surprise': {
      sceneId: 'prop-one-last-surprise',
      label: 'Puzzle Surprise',
      props: [
        { prop: 'puzzleImage', source: 'media.puzzleImage' },
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'My Love',
        },
      ],
    },
    'prop-celebration': {
      sceneId: 'prop-celebration',
      label: 'Celebration',
      props: [
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'My Love',
        },
        { prop: 'photos', source: 'media.photos' },
        { prop: 'audio', source: 'media.primaryAudio' },
      ],
    },
  },
};
