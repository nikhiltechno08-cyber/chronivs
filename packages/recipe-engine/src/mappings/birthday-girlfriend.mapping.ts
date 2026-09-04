import { RECIPE_FIELD_KEYS } from '../constants';
import type { RecipeSceneMappings } from '../types/scene-mapping';

/**
 * Scene data mappings for Birthday · Girlfriend.
 *
 * Defines the minimal prop surface per scene — the renderer injects only these keys.
 */
export const birthdayGirlfriendSceneMappings: RecipeSceneMappings = {
  templateId: 'birthday-girlfriend',
  globalDefaults: {
    receiverName: 'Someone Special',
    senderName: 'From Me',
    message: 'With all my love...',
  },
  scenes: {
    surprise: {
      sceneId: 'surprise',
      label: 'Hero / Surprise',
      props: [
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'Someone Special',
          required: true,
        },
        { prop: 'occasion', source: 'occasion' },
        { prop: 'theme', source: 'settings.theme' },
        {
          prop: 'senderName',
          source: `fields.${RECIPE_FIELD_KEYS.SENDER_NAME}`,
          fallback: 'From Me',
        },
      ],
    },
    birthday: {
      sceneId: 'birthday',
      label: 'Birthday Title',
      props: [
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'Someone Special',
        },
        {
          prop: 'specialDate',
          source: `fields.${RECIPE_FIELD_KEYS.SPECIAL_DATE}`,
          placeholder: 'Today',
        },
        { prop: 'theme', source: 'settings.theme' },
      ],
    },
    memories: {
      sceneId: 'memories',
      label: 'Gallery',
      props: [
        { prop: 'photos', source: 'media.photos' },
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'Someone Special',
        },
      ],
    },
    love: {
      sceneId: 'love',
      label: 'Letter',
      props: [
        {
          prop: 'message',
          source: `fields.${RECIPE_FIELD_KEYS.CUSTOM_MESSAGE}`,
          fallback: 'With all my love...',
        },
        {
          prop: 'senderName',
          source: `fields.${RECIPE_FIELD_KEYS.SENDER_NAME}`,
          fallback: 'From Me',
        },
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'Someone Special',
        },
      ],
    },
    heart: {
      sceneId: 'heart',
      label: 'Heart',
      props: [
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'Someone Special',
        },
        {
          prop: 'senderName',
          source: `fields.${RECIPE_FIELD_KEYS.SENDER_NAME}`,
          fallback: 'From Me',
        },
      ],
    },
    celebration: {
      sceneId: 'celebration',
      label: 'Celebration',
      props: [
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'Someone Special',
        },
        { prop: 'photos', source: 'media.photos' },
        { prop: 'theme', source: 'settings.theme' },
      ],
    },
    forever: {
      sceneId: 'forever',
      label: 'Ending',
      props: [
        {
          prop: 'receiverName',
          source: `fields.${RECIPE_FIELD_KEYS.RECEIVER_NAME}`,
          fallback: 'Someone Special',
        },
        {
          prop: 'senderName',
          source: `fields.${RECIPE_FIELD_KEYS.SENDER_NAME}`,
          fallback: 'From Me',
        },
        {
          prop: 'message',
          source: `fields.${RECIPE_FIELD_KEYS.CUSTOM_MESSAGE}`,
          fallback: 'Forever yours.',
        },
      ],
    },
  },
};
